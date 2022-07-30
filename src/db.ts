import pouchdb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';
import { Types } from 'tateyama';

pouchdb.plugin(pouchdbFind);

const DB_PATH="./.db/";

let _instance: PouchDB.Database<Types.DBRace>;

async function instance(): Promise<PouchDB.Database<Types.DBRace>> {
  if (!_instance) {
    _instance = new pouchdb(DB_PATH);
    await createIndex();
  }
  return _instance;
}

async function close() {
  await _instance.close();
  _instance = undefined;
}

async function createIndex() {
  await _instance.createIndex({ index: { fields: ["_id"] } });
  await _instance.createIndex({ index: { fields: ["date"] } });
  await _instance.createIndex({ index: { fields: ["courseId"] } });
  await _instance.createIndex({ index: { fields: ["courseName"] } });
  await _instance.createIndex({ index: { fields: ["course.distance"] } });
  await _instance.createIndex({ index: { fields: ["training.horseName"] } });
}

async function query(idRegex: string) : Promise<{ docs: Types.DBRace[], warning: string }> {
  const db = await instance();

  const { docs, warning } = await db.find({
    selector: { _id: { $regex: idRegex } }
  });

  db.close();
  return { docs, warning };
}


export default {
  instance,
  query,
  close,
}
