import { Data } from 'tateyama';

/**
 * Databaseインスタンス
 */
 export type RaceDB = PouchDB.Database<Data.Race>;

 /**
  * Database Queryの返り値
  */
 export interface RaceDocs {
   docs: Data.Race[],
   warning?: string,
 }
 
 