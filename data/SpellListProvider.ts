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

  public static observeSpellLists(callback: Function) {
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

  public static observeSingleList(callback: Function, list: SpellList) {
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
      // ensure spell list table exists
      await db.executeSql(`CREATE TABLE IF NOT EXISTS ${SpellListProvider.spellListTableName}(
            id TEXT PRIMARY KEY NOT NULL,
            name TEXT NOT NULL,
            thumbnailURI TEXT
            );`);

      // ensure spell list ids table exists
      await db.executeSql(`CREATE TABLE IF NOT EXISTS ${SpellListProvider.spellListSpellIDsTableName}(
            id TEXT PRIMARY KEY,
            spellID TEXT NOT NULL
            );`);
    }
    return db;
  }

  public static async getSpellListSpellIDs(
    list: SpellList
  ): Promise<SpellID[]> {
    const ids = SpellProvider.getRowData(
      await (await this.getDB()).executeSql(
        `SELECT * from ${SpellListProvider.spellListSpellIDsTableName} where id='${list.id}'`
      )
    );
    return ids.map(id => new SpellID(id.id));
  }

  public static async addSpellIDToList(list: SpellList, id: SpellID) {
    await (await this.getDB()).executeSql(
      `INSERT INTO ${SpellListProvider.spellListSpellIDsTableName} (id, spellID) VALUES ('${list.id}', '${id.id}')`
    );
    console.log(`Added spell ${id.id} to ${list.name}`);
    this.notifySingleListListeners(list.id);
  }

  public static async removeSpellIDFromList(list: SpellList, id: SpellID) {
    await (await this.getDB()).executeSql(
      `DELETE FROM ${SpellListProvider.spellListSpellIDsTableName} WHERE id='${list.id}' AND spellID='${id.id}'`
    );
    console.log(`Removed spell ${id.id} from ${list.name}`);
    this.notifySingleListListeners(list.id);
  }

  public static async getSpellLists(): Promise<SpellList[]> {
    const ids = SpellProvider.getRowData(
      await (await this.getDB()).executeSql(
        `SELECT * from ${SpellListProvider.spellListTableName}`
      )
    );
    return ids.map(
      id => new SpellList(id.id, decodeURI(id.name), id.thumbnailURI)
    );
  }

  public static async addSpellList(list: SpellList) {
    await (await this.getDB()).executeSql(
      `INSERT INTO ${
        SpellListProvider.spellListTableName
      } (id, name, thumbnailURI) VALUES ('${list.id}', '${encodeURI(
        list.name
      )}',${list.thumbnailURI ? `'${encodeURI(list.thumbnailURI)}'` : "NULL"})`
    );
    console.log(`Added spell list ${list.name}`);
    this.notifyListsListeners();
  }

  public static async removeSpellList(list: SpellList) {
    // Delete list
    await (await this.getDB()).executeSql(
      `DELETE FROM ${SpellListProvider.spellListTableName} WHERE id='${list.id}'`
    );
    // Delete list ids
    await (await this.getDB()).executeSql(
      `DELETE FROM ${SpellListProvider.spellListSpellIDsTableName} WHERE id='${list.id}'`
    );
    console.log(`Removed spell list ${list.name}`);
    this.notifyListsListeners();
  }
}
