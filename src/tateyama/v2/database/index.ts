export * from './types';

import pouchdb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';

import { DB } from 'tateyama';

pouchdb.plugin(pouchdbFind);

const DB_PATH="./.db/";

let _instance: PouchDB.Database<DB.DBRace>;

export async function instance(): Promise<PouchDB.Database<DB.DBRace>> {
  if (!_instance) {
    _instance = new pouchdb(DB_PATH);
    await createIndex();
  }
  return _instance;
}

export async function close() {
  await _instance.close();
  _instance = undefined;
}

export async function query(idRegex: string) : Promise<{ docs: DB.DBRace[], warning: string }> {
  const db = await instance();

  const { docs, warning } = await db.find({
    selector: { _id: { $regex: idRegex } }
  });

  return { docs, warning };
}

async function createIndex() {
  await _instance.createIndex({ index: { fields: ["_id"] } });
  await _instance.createIndex({ index: { fields: ["date"] } });
  await _instance.createIndex({ index: { fields: ["courseId"] } });
  await _instance.createIndex({ index: { fields: ["courseName"] } });
  await _instance.createIndex({ index: { fields: ["course.distance"] } });
  await _instance.createIndex({ index: { fields: ["training.horseName"] } });
}
