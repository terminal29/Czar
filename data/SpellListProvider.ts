import SQLite from "react-native-sqlite-storage";
import squel from "squel";
import SpellProvider from "./SpellProvider";
import { SpellList } from "../structs/SpellList";
import { SpellID } from "../structs/SpellID";
SQLite.enablePromise(true);

export default class SpellListProvider {
  private static hasCheckedTables = false;
  private static spellListTableName = "spell_lists";
  private static spellListSpellIDsTableName = "spell_list_spell_ids";
  private static readonly dbName = "CZAR.db";

  private static spellListsListeners = [];
  private static singleSpellListListener: {
    callback: Function;
    id: string;
  }[] = [];

  public static async observeSpellLists(callback: Function) {
    const spellLists = await this.getSpellLists();
    callback(spellLists);
    this.spellListsListeners.push(callback);
  }
  public static unObserveSpellLists(callback: Function) {
    SpellListProvider.spellListsListeners = SpellListProvider.spellListsListeners.filter(
      c => c !== callback
    );
  }
  private static async notifyListsListeners() {
    const spellLists = await SpellListProvider.getSpellLists();
    this.spellListsListeners.forEach(listener => listener(spellLists));
  }

  public static async observeSingleList(callback: Function, list: SpellList) {
    const spellIDs = await SpellListProvider.getSpellListSpellIDs(list);
    callback(spellIDs);
    this.singleSpellListListener.push({ callback, id: list.id });
  }
  public static unObserveSingleList(callback: Function) {
    SpellListProvider.singleSpellListListener = SpellListProvider.singleSpellListListener.filter(
      c => c.callback !== callback
    );
  }
  private static async notifySingleListListeners(id: string) {
    this.singleSpellListListener.forEach(async listener => {
      if (listener.id === id) {
        const spellIDs: Array<SpellID> = await SpellListProvider.getSpellListSpellIDs(
          new SpellList(id, "")
        );
        listener.callback(spellIDs);
      }
    });
  }

  private static async getDB() {
    const db = await SpellProvider.getDB();
    if (!this.hasCheckedTables) {
      this.hasCheckedTables = true;
      await db.executeSql(`CREATE TABLE IF NOT EXISTS ${SpellListProvider.spellListTableName}(
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            thumbnailURI TEXT,
            listIndex INTEGER
            );`);

      // ensure spell list ids table exists
      await db.executeSql(`CREATE TABLE IF NOT EXISTS ${SpellListProvider.spellListSpellIDsTableName}(
            id TEXT NOT NULL,
            spellID TEXT NOT NULL,
            spellIndex INTEGER,
            PRIMARY KEY (id, spellID)
            );`);
    }
    return db;
  }

  public static async getSpellListSpellIDs(
    list: SpellList
  ): Promise<SpellID[]> {
    const ids = SpellProvider.getRowData(
      await (await this.getDB()).executeSql(
        `SELECT * from ${SpellListProvider.spellListSpellIDsTableName} where id='${list.id}' ORDER BY spellIndex ASC`
      )
    );
    return ids.map(id => new SpellID(id.spellID));
  }

  public static async addSpellIDToList(list: SpellList, id: SpellID) {
    const existingIDs = await SpellListProvider.getSpellListSpellIDs(list);

    await (await this.getDB()).executeSql(
      `INSERT INTO ${SpellListProvider.spellListSpellIDsTableName} (id, spellID, spellIndex) VALUES ('${list.id}', '${id.id}', ${existingIDs.length})`
    );
    console.log(`Added spell ${id.id} to ${list.name}`);
    this.notifySingleListListeners(list.id);
  }

  public static async addSpellIDtoListAtIndex(
    list: SpellList,
    id: SpellID,
    index: number
  ) {
    const allSpells = await this.getSpellListSpellIDs(list);
    allSpells.splice(index, 0, id);
    await this.clearSpellListSpellIDs(list);
    await this.addMultipleSpellsToList(list, allSpells);
    this.notifySingleListListeners(list.id);
  }

  private static async clearSpellListSpellIDs(list: SpellList) {
    await (await this.getDB()).executeSql(
      `DELETE FROM ${SpellListProvider.spellListSpellIDsTableName} WHERE id='${list.id}'`
    );
    this.notifySingleListListeners(list.id);
  }

  private static async addMultipleSpellsToList(
    list: SpellList,
    ids: Array<SpellID>
  ) {
    const promises = [];
    ids.forEach((id, index) => {
      promises.push(
        this.getDB().then(db =>
          db.executeSql(
            `INSERT INTO ${SpellListProvider.spellListSpellIDsTableName} (id, spellID, spellIndex) VALUES ('${list.id}', '${id.id}', ${index})`
          )
        )
      );
    });
    await Promise.all(promises);
    this.notifySingleListListeners(list.id);
  }

  public static async removeSpellIDFromList(list: SpellList, id: SpellID) {
    await (await this.getDB()).executeSql(
      `DELETE FROM ${SpellListProvider.spellListSpellIDsTableName} WHERE id='${list.id}' AND spellID='${id.id}'`
    );

    // Get all spells after removal
    const allSpells = await this.getSpellListSpellIDs(list);
    console.log(allSpells);
    //Clear list
    await this.clearSpellListSpellIDs(list);
    // Add spells back (already ordered properly)
    await this.addMultipleSpellsToList(list, allSpells);

    this.notifySingleListListeners(list.id);
  }

  public static async getSpellLists(): Promise<SpellList[]> {
    const ids = SpellProvider.getRowData(
      await (await this.getDB()).executeSql(
        `SELECT * from ${SpellListProvider.spellListTableName} ORDER BY listIndex ASC`
      )
    );
    return ids.map(
      id => new SpellList(id.id, decodeURI(id.name), id.thumbnailURI)
    );
  }

  public static async addSpellList(list: SpellList) {
    const spellLists = await this.getSpellLists();
    await (await this.getDB()).executeSql(
      `INSERT INTO ${
        SpellListProvider.spellListTableName
      } (id, name, thumbnailURI, listIndex) VALUES ('${list.id}', '${encodeURI(
        list.name
      )}',${
        list.thumbnailURI ? `'${encodeURI(list.thumbnailURI)}'` : "NULL"
      }, ${spellLists.length})`
    );
    console.log(`Added spell list ${list.name}`);
    this.notifyListsListeners();
  }

  public static async removeSpellList(
    list: SpellList,
    clearSpells: boolean = true
  ) {
    // Delete list
    await (await this.getDB()).executeSql(
      `DELETE FROM ${SpellListProvider.spellListTableName} WHERE id='${list.id}'`
    );
    if (clearSpells) {
      // Delete list ids
      await (await this.getDB()).executeSql(
        `DELETE FROM ${SpellListProvider.spellListSpellIDsTableName} WHERE id='${list.id}'`
      );
    }
    console.log(`Removed spell list ${list.name}`);
    this.notifyListsListeners();
  }
}
