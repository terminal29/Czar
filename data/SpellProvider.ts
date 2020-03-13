import { Spell } from "../structs/Spell";
import { SpellID } from "../structs/SpellID";
import { ToastAndroid } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import * as xml2js from "react-native-xml2js";

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
    const getSpells = async (url: string) => {
      const spells = [];
      const loadXML = async (url: string) => {
        const response = await fetch(url);

        const text = await response.text();
        const xml = await new Promise((resolve, reject) => {
          const parser = new xml2js.Parser();
          parser.parseString(text, (err, result) => {
            if (err) {
              reject(err);
            }
            resolve(result);
          });
        });

        if (xml["index"]) {
          let promises = [];
          for (let fileList of xml["index"]["files"]) {
            for (let file of fileList["file"]) {
              promises.push(loadXML(file["$"]["url"]));
            }
          }
          await Promise.all(promises);
        } else if (xml["elements"]) {
          for (let element of xml["elements"]["element"]) {
            if (element["$"]["type"] == "Spell") spells.push(element);
          }
        }
      };

      await loadXML(url);
      return spells;
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

    try {
      const spellPromises = [];
      const allSpells: Array<Spell> = [];
      const urls = await SpellProvider.getSourceURLs();

      for (let url of urls) {
        spellPromises.push(
          getSpells(url)
            .then(spells => {
              return spells.map(spell => parseSpell(spell));
            })
            .then(spells => allSpells.push(...spells))
            .catch(e => {
              throw Error(`${url} threw ${e.message}`);
            })
        );
      }

      await Promise.all(spellPromises);
      const storagePromises = [];
      for (let spell of allSpells) {
        storagePromises.push(
          AsyncStorage.setItem(
            SpellProvider.spellDBName + spell.id,
            JSON.stringify(spell)
          )
        );
      }

      await Promise.all(storagePromises);

      await SpellProvider.updateSpellDataFromStorage();

      ToastAndroid.show(
        `Loaded ${allSpells.length} spells successfully!`,
        ToastAndroid.SHORT
      );
    } catch (e) {
      alert(`Failed to load spells: ${e.message}`);
    }
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
    const actionPromises = [];
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

    SpellProvider.classListListeners.forEach(listener =>
      listener(SpellProvider.classList)
    );
    SpellProvider.levelListListeners.forEach(listener =>
      listener(SpellProvider.levelList)
    );
    SpellProvider.schoolListListeners.forEach(listener =>
      listener(SpellProvider.schoolList)
    );

    return await Promise.all(actionPromises);
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
