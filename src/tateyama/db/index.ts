export * from './types';
import { DB } from 'tateyama';

import pouchdb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';

const DB_PATH="./.db/";
let _instance: DB.RaceDB;

pouchdb.plugin(pouchdbFind);

export async function instance(): Promise<DB.RaceDB> {
  if (!_instance) {
    _instance = new pouchdb(DB_PATH);
    _instance.createIndex({ index: { fields: ["_id"] } });
    _instance.createIndex({ index: { fields: ["date"] } });
    _instance.createIndex({ index: { fields: ["course.id"] } });
    _instance.createIndex({ index: { fields: ["course.name"] } });
    _instance.createIndex({ index: { fields: ["course.distance"] } });
    _instance.createIndex({ index: { fields: ["training.horseName"] } });
  }

  return _instance;
}

export async function close() {
  await _instance.close();
  _instance = undefined;
}

export async function query(idRegex: string) : Promise<DB.RaceDocs> {
  const db = await instance();

  return db.find({
    selector: {
      _id: {
        $regex: idRegex
      }
    }
  });
}
