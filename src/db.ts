import pouchdb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';
import { Types } from 'tateyama';

pouchdb.plugin(pouchdbFind);

const DB_PATH="./.db";

let _instance: PouchDB.Database<Types.DataRace>;

function instance(): PouchDB.Database<Types.DataRace> {
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
  _instance.createIndex({ index: { fields: ["date"] } });
  _instance.createIndex({ index: { fields: ["training.horseName"] } });
}

export default {
  instance,
  close,
}
