import pouchdb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';
import { Types } from 'tateyama';

pouchdb.plugin(pouchdbFind);

const DB_PATH="./.db";

let _instance: PouchDB.Database<Types.DBRace>;

function instance(): PouchDB.Database<Types.DBRace> {
  if (!_instance) {
    _instance = new pouchdb(DB_PATH);
    createIndex();
  }
  return _instance;
}

function close() {
  _instance.close();
  _instance = undefined;
}

function createIndex() {
  _instance.createIndex({ index: { fields: ["_id"] } });
  _instance.createIndex({ index: { fields: ["date"] } });
  _instance.createIndex({ index: { fields: ["courseId"] } });
  _instance.createIndex({ index: { fields: ["courseName"] } });
  _instance.createIndex({ index: { fields: ["course.distance"] } });
  _instance.createIndex({ index: { fields: ["training.horseName"] } });
}

export default {
  instance,
  close,
}
