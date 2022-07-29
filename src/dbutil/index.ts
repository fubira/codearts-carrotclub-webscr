import TateyamaDB from 'db';
import logger from 'logger';

async function dbUtilGet(id: string) {
  const db = TateyamaDB.instance();

  const { docs, warning } = await db.find({ selector: { _id: { $regex: `^${id}` } }});

  if (warning) {
    logger.warn(warning);
  }

  for (const doc of docs) {
    console.log(`${doc?._id} - ${doc?._rev}`);
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
