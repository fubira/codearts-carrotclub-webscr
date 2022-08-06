import { Data } from 'tateyama';

import pouchdb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';

const DB_PATH="./.db/";
let _instance: Data.RaseDB;

pouchdb.plugin(pouchdbFind);

export async function instance(): Promise<Data.RaseDB> {
  if (!_instance) {
    _instance = new pouchdb(DB_PATH);
    _instance.createIndex({ index: { fields: ["_id"] } });
    _instance.createIndex({ index: { fields: ["date"] } });
    _instance.createIndex({ index: { fields: ["courseId"] } });
    _instance.createIndex({ index: { fields: ["courseName"] } });
    _instance.createIndex({ index: { fields: ["course.distance"] } });
    _instance.createIndex({ index: { fields: ["training.horseName"] } });
  }

  return _instance;
}

export async function close() {
  await _instance.close();
  _instance = undefined;
}

export async function query(idRegex: string) : Promise<Data.RaseDBDocs> {
  const db = await instance();

  return db.find({
    selector: {
      _id: {
        $regex: idRegex
      }
    }
  });
}
