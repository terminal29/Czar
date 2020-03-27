import { Spell } from "../structs/Spell";
import { SpellID } from "../structs/SpellID";
import * as xml2js from "react-native-xml2js";
import nextFrame from "next-frame";
import Toast from "react-native-root-toast";
import SQLite from "react-native-sqlite-storage";
import squel from "squel";

SQLite.enablePromise(true);

type AsyncFunction<O> = () => Promise<O>;
interface FilterQueryParams {
  fields?: string[];
  name: string;
  classes: string[];
  schools: string[];
  levels: string[];
}

interface SpellFilterIterator {
  currentIndex: number;
  next: AsyncFunction<{ value: SpellID | null; done: boolean }>;
}

export default class SpellProvider {
  private static numSpells: number = 0;

  private static spellCache: Spell[] = [];

  private static classListListeners: Function[] = [];
  private static classList: string[] = [];

  private static schoolListListeners: Function[] = [];
  private static schoolList: string[] = [];

  private static levelListListeners: Function[] = [];
  private static levelList: string[] = [];

  private static db;
  public static readonly dbName = "CZAR.db";
  public static readonly spellTableName = "spells";
  public static readonly sourceTableName = "sources";

  private static checkSpellCache(id: SpellID): Spell | null {
    const spell = SpellProvider.spellCache.find(spell => spell.id === id.id);
    return spell || null;
  }

  private static addSpellToCache(spell: Spell) {
    SpellProvider.spellCache.push(spell);
  }

  private static removeSpellFromCache(spell: Spell) {
    SpellProvider.spellCache.filter(sp => sp.id !== spell.id);
  }

  private static clearSpellCache() {
    SpellProvider.spellCache = [];
  }

  public static async getDB() {
    if (!SpellProvider.db) {
      SpellProvider.db = await SQLite.openDatabase({
        name: SpellProvider.dbName
      });

      // ensure spells table exists
      await SpellProvider.db
        .executeSql(`CREATE TABLE IF NOT EXISTS ${SpellProvider.spellTableName}(
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        source TEXT NOT NULL,
        formattedText TEXT NOT NULL,
        classes TEXT NOT NULL,
        keywords TEXT NOT NULL,
        level TEXT NOT NULL,
        school TEXT NOT NULL,
        time TEXT NOT NULL,
        duration TEXT NOT NULL,
        range TEXT NOT NULL,
        has_verbal_component BOOL NOT NULL,
        has_somatic_component BOOL NOT NULL,
        has_material_component BOOL NOT NULL,
        material_components TEXT,
        is_concentration BOOL NOT NULL,
        is_ritual BOOL NOT NULL
      );`);

      // ensure sources table exists
      await SpellProvider.db
        .executeSql(`CREATE TABLE IF NOT EXISTS ${SpellProvider.sourceTableName}(
        id INTEGER PRIMARY KEY,
        url TEXT NOT NULL 
      );`);
    }
    return SpellProvider.db;
  }

  private static insertSpell(db: any, spell: Spell): Promise<any> {
    SpellProvider.addSpellToCache(spell);
    return db.executeSql(
      `INSERT INTO ${SpellProvider.spellTableName} VALUES (
      "${spell.id}",
      "${encodeURI(spell.name)}",
      "${encodeURI(spell.source)}",
      "${encodeURI(spell.formattedText)}",
      "${encodeURI(JSON.stringify(spell.classes))}",
      "${encodeURI(JSON.stringify(spell.keywords))}",
      "${encodeURI(spell.level)}",
      "${encodeURI(spell.school)}",
      "${encodeURI(spell.time)}",
      "${encodeURI(spell.duration)}",
      "${encodeURI(spell.range)}",
      ${spell.hasVerbalComponent ? 1 : 0},
      ${spell.hasSomaticComponent ? 1 : 0},
      ${spell.hasMaterialComponent ? 1 : 0},
      ${
        spell.materialComponents
          ? `"${encodeURI(spell.materialComponents)}"`
          : `NULL`
      },
      ${spell.isConcentration ? 1 : 0},
      ${spell.isRitual ? 1 : 0}
    );`
    );
  }

  public static async clearStoredSpells() {
    SpellProvider.clearSpellCache();
    await SpellProvider.getDB().then(db =>
      db.executeSql(`DELETE FROM ${SpellProvider.spellTableName};`)
    );
  }

  public static async downloadSpellsFromSources() {
    SpellProvider.classList = [];
    SpellProvider.levelList = [];
    SpellProvider.schoolList = [];
    SpellProvider.notifyListeners();
    await SpellProvider.clearStoredSpells();

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
          providedUrls.map(async url => await getIndexFiles(url.url))
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
              allSpells.push(spell);
              await nextFrame();
            }
          }
        }
      }

      const db = await SpellProvider.getDB();
      Toast.show(`Saving spells...`, {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM
      });

      for (const spell of allSpells) {
        await nextFrame();
        await SpellProvider.insertSpell(db, spell);
      }

      await SpellProvider.updateSpellDataFromStorage();

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
    //const ids = await SpellProvider.getSpellIDs();

    const classQuery = squel
      .select()
      .from(SpellProvider.spellTableName)
      .field("classes")
      .distinct();
    const classesRaw = SpellProvider.getRowData(
      await (await SpellProvider.getDB()).executeSql(classQuery.toString())
    );
    const classes = new Set<string>(
      classesRaw
        .map(rawStringResult => JSON.parse(decodeURI(rawStringResult.classes)))
        .flat(Infinity)
    );

    const levelQuery = squel
      .select()
      .from(SpellProvider.spellTableName)
      .field("level")
      .distinct();
    const levelsRaw = SpellProvider.getRowData(
      await (await SpellProvider.getDB()).executeSql(levelQuery.toString())
    );
    const levels = new Set<string>(
      levelsRaw
        .map(rawStringResult => decodeURI(rawStringResult.level))
        .flat(Infinity)
    );

    const schoolQuery = squel
      .select()
      .from(SpellProvider.spellTableName)
      .field("school")
      .distinct();
    const schoolsRaw = SpellProvider.getRowData(
      await (await SpellProvider.getDB()).executeSql(schoolQuery.toString())
    );
    const schools = new Set<string>(
      schoolsRaw
        .map(rawStringResult => decodeURI(rawStringResult.school))
        .flat(Infinity)
    );
    SpellProvider.schoolList = Array.from(schools);
    SpellProvider.levelList = Array.from(levels);
    SpellProvider.classList = Array.from(classes);
    SpellProvider.notifyListeners();
  }

  public static async addSource(url: string) {
    await SpellProvider.getDB().then(db =>
      db.executeSql(
        `INSERT INTO ${SpellProvider.sourceTableName} (url) values('${url}');`
      )
    );
  }

  public static async removeSource(url: string) {
    await SpellProvider.getDB().then(db =>
      db.executeSql(
        `DELETE FROM ${SpellProvider.sourceTableName} WHERE url='${url}';`
      )
    );
  }

  public static async getSourceURLs(): Promise<{ id: number; url: string }[]> {
    const urlRows = await (await SpellProvider.getDB()).executeSql(
      `SELECT * FROM ${SpellProvider.sourceTableName};`
    );
    const sources = [];
    for (let i = 0; i < urlRows[0].rows.length; i++) {
      sources.push(urlRows[0].rows.item(i));
    }
    return sources;
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

  private static parseSpell(spellRaw: any): Spell {
    const spell = new Spell();
    spell.name = decodeURI(spellRaw.name);
    spell.id = spellRaw.id;
    spell.source = decodeURI(spellRaw.source);
    spell.formattedText = decodeURI(spellRaw.formattedText);

    spell.classes = JSON.parse(decodeURI(spellRaw.classes));

    spell.keywords = JSON.parse(decodeURI(spellRaw.keywords));
    spell.duration = decodeURI(spellRaw.duration);

    spell.level = decodeURI(spellRaw.level);
    spell.school = decodeURI(spellRaw.school);
    spell.time = decodeURI(spellRaw.time);
    spell.range = decodeURI(spellRaw.range);
    spell.hasVerbalComponent = spellRaw.has_verbal_component === 1;
    spell.hasSomaticComponent = spellRaw.has_somatic_component === 1;
    spell.hasMaterialComponent = spellRaw.has_material_component === 1;
    spell.materialComponents = spellRaw.material_components
      ? decodeURI(spellRaw.material_components)
      : null;
    spell.isConcentration = spellRaw.is_concentration;
    spell.isRitual = spellRaw.is_ritual;
    return spell;
  }

  public static async getSpellByID(spellID: SpellID): Promise<Spell> {
    const possibleSpell = SpellProvider.checkSpellCache(spellID);
    if (possibleSpell) return possibleSpell;
    const spellRaw = SpellProvider.getRowData(
      await (await SpellProvider.getDB()).executeSql(
        `SELECT * from ${SpellProvider.spellTableName} where id='${spellID.id}';`
      )
    );

    if (spellRaw.length != 1) return null;

    const spell = SpellProvider.parseSpell(spellRaw[0]);

    SpellProvider.addSpellToCache(spell);

    return spell;
  }

  public static getRowData(response) {
    const data = [];
    for (let i = 0; i < response[0].rows.length; i++) {
      data.push(response[0].rows.item(i));
    }
    return data;
  }

  public static async getSpellIDs(): Promise<SpellID[]> {
    const ids = SpellProvider.getRowData(
      await (await SpellProvider.getDB()).executeSql(
        `SELECT id from ${SpellProvider.spellTableName};`
      )
    ) as SpellID[];
    return ids;
  }

  private static makeFilterQuery({
    fields,
    name,
    classes,
    schools,
    levels
  }: FilterQueryParams) {
    let query = squel.select().from(SpellProvider.spellTableName);
    if (fields) {
      query = query.fields(fields);
    }
    if (name && name.length > 0) {
      query = query.where(`name LIKE '%${encodeURI(name)}%'`);
    }
    if (classes && classes.length > 0) {
      let andClasses = squel.expr();
      for (const spellClass of classes) {
        andClasses = andClasses.or(`classes LIKE '%${encodeURI(spellClass)}%'`);
      }
      query.where(andClasses);
    }
    if (levels && levels.length > 0) {
      let andLevels = squel.expr();
      for (const spellLevel of levels) {
        andLevels = andLevels.or(`level LIKE '%${encodeURI(spellLevel)}%'`);
      }
      query.where(andLevels);
    }
    if (schools && schools.length > 0) {
      let andSchools = squel.expr();
      for (const spellSchool of schools) {
        andSchools = andSchools.or(`school LIKE '%${encodeURI(spellSchool)}%'`);
      }
      query.where(andSchools);
    }
    return query;
  }

  public static async getSpellIDsByFilters(
    name: string,
    classes: string[],
    schools: string[],
    levels: string[]
  ) {
    let query = SpellProvider.makeFilterQuery({
      name,
      classes,
      schools,
      levels
    });

    let rtn: SpellFilterIterator = {
      currentIndex: 0,
      next: null
    };

    rtn.next = async () => {
      const limitQuery = query.limit(1).offset(rtn.currentIndex);

      const ids = SpellProvider.getRowData(
        await (await SpellProvider.getDB()).executeSql(limitQuery.toString())
      );

      if (ids.length != 1) {
        return { value: null, done: true };
      } else {
        rtn.currentIndex++;
        return { value: new SpellID(ids[0].id), done: false };
      }
    };
    return rtn;
  }

  public static async getNumSpellsByFilters(
    name: string,
    classes: string[],
    schools: string[],
    levels: string[]
  ) {
    let query = SpellProvider.makeFilterQuery({
      fields: ["id"],
      name,
      classes,
      schools,
      levels
    });
    return SpellProvider.getRowData(
      await (await SpellProvider.getDB()).executeSql(query.toString())
    ).length;
  }

  public static async getSpellIDsByFiltersSection(
    name: string,
    start: number,
    length: number,
    classes: string[],
    schools: string[],
    levels: string[]
  ) {
    let query = SpellProvider.makeFilterQuery({
      fields: ["id"],
      name,
      classes,
      schools,
      levels
    });

    const limitQuery = query.limit(length).offset(start);

    return SpellProvider.getRowData(
      await (await SpellProvider.getDB()).executeSql(limitQuery.toString())
    ).map(spellInfo => new SpellID(spellInfo.id));
  }

  public static async getSpellsByFiltersSection(
    name: string,
    start: number,
    length: number,
    classes: string[],
    schools: string[],
    levels: string[]
  ) {
    let query = SpellProvider.makeFilterQuery({
      name,
      classes,
      schools,
      levels
    });

    const limitQuery = query.limit(length).offset(start);

    return SpellProvider.getRowData(
      await (await SpellProvider.getDB()).executeSql(limitQuery.toString())
    ).map(spellInfo => SpellProvider.parseSpell(spellInfo));
  }
}
