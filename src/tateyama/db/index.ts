export * from './types';
export * from './models';
import mongoose from 'mongoose';

const databaseURL = `${process.env.MONGODB_URL}`;
let _instance: mongoose.Connection;

export async function connect(): Promise<mongoose.Connection> {
  if (!_instance) {
    await mongoose.connect(databaseURL, { serverSelectionTimeoutMS: 5000 });

    await Promise.all(
      Object.keys(mongoose.models).map((key) => mongoose.models[key].createIndexes())
    );
  
    _instance = mongoose.connection;
  }

  return _instance;
}

export async function close() {
  await _instance.close();
  _instance = undefined;
}
