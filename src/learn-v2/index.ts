import logger from 'logger';
import TateyamaDB from 'db';

import { Tipster } from 'tateyama/v2/ai-tipster';

export default async (idReg: string, options: { workDir: string, cycle: string, init: boolean }) => {
  logger.info(idReg, options);

  try {
    const { docs, warning } = await TateyamaDB.query(idReg);

    if (docs) {
      logger.info(`${docs.length}件のデータがマッチしました`);
    }
    if (warning) {
      logger.warn(warning);
    }

    const tipster = new Tipster();
    const forecast = tipster.forecast(docs[0]);

    console.log({ name: `${tipster.name}`, forecast });

  } catch (err) {
    logger.error(err);
  }
}
