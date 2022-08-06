import { DB } from 'tateyama';
import logger from 'logger';

async function dbUtilGet(idReg: string) {
  const { docs, warning } = await DB.query(idReg);

  if (docs) {
    logger.info(`${docs.length}件のデータがマッチしました`);
  }
  if (warning) {
    logger.warn(warning);
  }

  for (const doc of docs) {
    console.log(JSON.stringify(doc, undefined, 2));
  }
}


export default async (command: string, param: string) => {

  switch (command) {
    case 'get':
      await dbUtilGet(param);
      break;
  
    default:
      logger.error(`Unknown command: ${command}`);
  }
}
