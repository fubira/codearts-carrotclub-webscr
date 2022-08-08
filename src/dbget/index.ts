import mongoose from 'mongoose';
import { DB } from 'tateyama';
import logger from 'logger';

async function dbGet<T>(model: mongoose.Model<T,any,any,any,any>, param: any) {
  await DB.connect();

  const docs = await model.find(param).exec();

  await DB.close();
  if (docs) {
    logger.info(`${docs.length}件のデータがマッチしました`);
  }
  return docs;
}

async function dbGetResult(idReg: string) {
  const [ Date, JyoCD, RaceNum ] = idReg.split(':');
  const Year = Date.slice(0, 4);
  const MonthDay = Date.slice(4);
  const param = {
    'head.DataKubun': '7',
    'jvid.Year': Year,
    'jvid.MonthDay': MonthDay,
    'jvid.JyoCD': JyoCD,
    'jvid.RaceNum': RaceNum,
  };
  const docs = await dbGet(DB.HRModel, param);

  for (const doc of docs) {
    console.log(JSON.stringify(doc, undefined, 2));
  }
}

async function dbGetRace(idReg: string) {
  const [ Date, JyoCD, RaceNum ] = idReg.split(':');
  const Year = Date.slice(0, 4);
  const MonthDay = Date.slice(4);
  const param = {
    'jvid.Year': Year,
    'jvid.MonthDay': MonthDay,
    'jvid.JyoCD': JyoCD,
    'jvid.RaceNum': RaceNum,
  };
  const docs = await dbGet(DB.RAModel, param);

  for (const doc of docs) {
    console.log(JSON.stringify(doc, undefined, 2));
  }
}

async function dbGetWood(idReg: string) {
  const param = {
    'KettoNum': idReg,
  };
  const docs = await dbGet(DB.WCModel, param);

  for (const doc of docs) {
    console.log(JSON.stringify(doc, undefined, 2));
  }
}

async function dbGetHanro(idReg: string) {
  const param = {
    'KettoNum': idReg,
  };
  const docs = await dbGet(DB.HCModel, param);

  for (const doc of docs) {
    console.log(JSON.stringify(doc, undefined, 2));
  }
}

export default async (command: string, param: string) => {

  switch (command) {
    case 'race':
      await dbGetRace(param);
      break;
    case 'result':
      await dbGetResult(param);
        break;
    case 'hanro':
      await dbGetHanro(param);
        break;
    case 'wood':
      await dbGetWood(param);
        break;
    default:
      logger.error(`Unknown command: ${command}`);
  }
}
