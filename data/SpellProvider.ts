import { Spell } from "../structs/Spell";
import { SpellID } from "../structs/SpellID";
import AsyncStorage from "@react-native-community/async-storage";
import * as xml2js from "react-native-xml2js";
import nextFrame from "next-frame";
import Toast from "react-native-root-toast";

function nextFrameParams(p) {
  return new Promise(function(resolve, reject) {
    requestAnimationFrame(function() {
      resolve(p);
    });
  });
}

export default class SpellProvider {
  private static spellDBName = "spells_full_";
  private static spellSourcesDBName = "spell_sources_";

  private static numSpells: number = 0;

  private static classListListeners: Function[] = [];
  private static classList: string[] = [];

  private static schoolListListeners: Function[] = [];
  private static schoolList: string[] = [];

  private static levelListListeners: Function[] = [];
  private static levelList: string[] = [];

  public static async clearStoredSpells() {}

  public static async downloadSpellsFromSources() {
    SpellProvider.classList = [];
    SpellProvider.levelList = [];
    SpellProvider.schoolList = [];
    SpellProvider.notifyListeners();

    const getIndexFiles = async (url: string) => {
      return fetch(url)
        .then(async response => {
          console.log(`Fetching ${url}`);
          await nextFrame();
          return response.text();
        })
        .then(
          text =>
            new Promise(async (resolve, reject) => {
              await nextFrame();
              const parser = new xml2js.Parser();
              parser.parseString(text, (err, xml) => {
                if (err) {
                  reject(err);
                }
                resolve(xml);
              });
            })
        )
        .then(async xml => {
          const urls: any = [{ url, xml }];
          if (xml["index"]) {
            for (let fileList of xml["index"]["files"]) {
              for (let file of fileList["file"]) {
                await nextFrame();
                urls.push(await getIndexFiles(file["$"]["url"]));
              }
            }
          }
          return urls;
        });
    };

    const builder = new xml2js.Builder();
    const parseSpell = spellXML => {
      const spell = new Spell();
      spell.name = spellXML["$"]["name"];
      spell.id = spellXML["$"]["id"];
      spell.source = spellXML["$"]["source"];

      spell.formattedText = builder.buildObject(spellXML["description"]);

      spell.classes = spellXML["supports"][0].split(",").map(str => str.trim());

      const getSetValue = name =>
        spellXML["setters"][0]["set"].find(set => set["$"]["name"] == name)[
          "_"
        ] || "";

      spell.keywords = getSetValue("keywords")
        .split(",")
        .map(str => str.trim());
      spell.level = getSetValue("level");
      spell.school = getSetValue("school");
      spell.time = getSetValue("time");
      spell.duration = getSetValue("duration");
      spell.range = getSetValue("range");
      spell.hasVerbalComponent = getSetValue("hasVerbalComponent") === "true";
      spell.hasSomaticComponent = getSetValue("hasSomaticComponent") === "true";
      spell.hasMaterialComponent =
        getSetValue("hasMaterialComponent") === "true";
      spell.materialComponents = getSetValue("materialComponent");
      spell.isConcentration = getSetValue("isConcentration") === "true";
      spell.isRitual = getSetValue("isRitual") == "true";

      return spell;
    };

    Toast.show("Gathering source files...", {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM
    });
    try {
      const providedUrls = await SpellProvider.getSourceURLs();
      const allUrls = (
        await Promise.all(
          providedUrls.map(async url => await getIndexFiles(url))
        )
      ).flat(Infinity);
      Toast.show(`Parsing spells...`, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM
      });

      const allSpells = [];
      for (const url of allUrls) {
        if (url.xml["elements"]) {
          for (let element of url.xml["elements"]["element"]) {
            if (element["$"]["type"] == "Spell") {
              const spell = parseSpell(element);
              allSpells.push([
                SpellProvider.spellDBName + spell.id,
                JSON.stringify(spell)
              ]);
              await nextFrame();
            }
          }
        }
      }

      Toast.show(`Saving spells...`, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM
      });
      let idx = 0;
      let step = 10;
      while (idx < allSpells.length) {
        await nextFrame();
        await AsyncStorage.multiSet(
          allSpells.slice(idx, Math.min(idx + step, allSpells.length))
        );
        idx += step;
      }

      await SpellProvider.updateSpellDataFromStorage();

      console.dir(allSpells[0]);

      Toast.show(`Loaded ${allSpells.length} spells`, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM
      });
    } catch (e) {
      Toast.show(e);
    }
  }

  private static notifyListeners() {
    SpellProvider.classListListeners.forEach(listener =>
      listener(SpellProvider.classList)
    );
    SpellProvider.levelListListeners.forEach(listener =>
      listener(SpellProvider.levelList)
    );
    SpellProvider.schoolListListeners.forEach(listener =>
      listener(SpellProvider.schoolList)
    );
  }

  public static async updateSpellDataFromStorage() {
    const ids = await SpellProvider.getSpellIDs();
    const spells = [];
    const spellPromises = ids.map(id =>
      SpellProvider.getSpellByID(id).then(spell => spells.push(spell))
    );
    await Promise.all(spellPromises);
    SpellProvider.numSpells = spells.length;
    SpellProvider.classList = [];
    SpellProvider.levelList = [];
    SpellProvider.schoolList = [];
    spells.forEach(spell => {
      spell.classes.forEach(spellClass => {
        if (SpellProvider.classList.findIndex(v => v === spellClass) === -1) {
          SpellProvider.classList.push(spellClass);
        }
      });
      // Add all new spell levels
      if (SpellProvider.levelList.findIndex(v => v === spell.level) === -1) {
        SpellProvider.levelList.push(spell.level);
      }

      // Add all new spell schools
      if (SpellProvider.schoolList.findIndex(v => v === spell.school) === -1) {
        SpellProvider.schoolList.push(spell.school);
      }
    });
    SpellProvider.notifyListeners();
  }

  public static async addSource(url: string) {
    await AsyncStorage.setItem(SpellProvider.spellSourcesDBName + url, url);
  }

  public static async removeSource(url: string) {
    await AsyncStorage.removeItem(SpellProvider.spellSourcesDBName + url);
  }

  public static async getSourceURLs(): Promise<string[]> {
    const keys = await AsyncStorage.getAllKeys();
    const sourceKeys = keys.filter(key =>
      key.startsWith(SpellProvider.spellSourcesDBName)
    );
    return (await AsyncStorage.multiGet(sourceKeys)).map(s => s[1]);
  }

  public static observeClassList(callback: Function) {
    callback(SpellProvider.classList);
    SpellProvider.classListListeners.push(callback);
  }

  public static observeSchoolList(callback: Function) {
    callback(SpellProvider.schoolList);
    SpellProvider.schoolListListeners.push(callback);
  }

  public static observeLevelList(callback: Function) {
    callback(SpellProvider.levelList);
    SpellProvider.levelListListeners.push(callback);
  }

  public static unObserveClassList(callback: Function) {
    SpellProvider.classListListeners = SpellProvider.classListListeners.filter(
      c => c !== callback
    );
  }

  public static unObserveSchoolList(callback: Function) {
    SpellProvider.schoolListListeners = SpellProvider.schoolListListeners.filter(
      c => c !== callback
    );
  }

  public static unObserveLevelList(callback: Function) {
    SpellProvider.levelListListeners = SpellProvider.levelListListeners.filter(
      c => c !== callback
    );
  }

  public static async getSpellByID(id: SpellID): Promise<Spell> {
    const spellText = await AsyncStorage.getItem(
      SpellProvider.spellDBName + id.id
    );
    return JSON.parse(spellText) as Spell;
  }

  public static async getSpellIDs(): Promise<SpellID[]> {
    const keys = await AsyncStorage.getAllKeys();
    const spellIDKeys = keys.filter(key =>
      key.startsWith(SpellProvider.spellDBName)
    );
    return spellIDKeys.map(
      key => new SpellID(key.substr(SpellProvider.spellDBName.length))
    );
  }

  public static async getSpellIDsByFilters(
    classes: string[],
    schools: string[],
    levels: string[]
  ): Promise<SpellID[]> {
    return [];
  }
}
