import logger from 'logger';
import TateyamaDB from 'db';

import * as Tateyama from 'tateyama/v2';

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

    const forecast = new Tateyama.Forecast();
    const forecastResult = forecast.forecast(docs[0]);
    const choiced = Tateyama.getForecastResultChoiced(forecastResult);

    console.log({ name: `${forecast.name}`, choiced });

  } catch (err) {
    logger.error(err);
  }
}
