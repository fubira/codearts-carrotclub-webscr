import logger from 'logger';
import FastGlob from 'fast-glob';
import { readFileSync } from 'fs';

import TateyamaDB from 'db';
import * as Tateyama from 'tateyama/v2';

export default async (idReg: string, forecastName: string, options: { workDir: string }) => {
  logger.info(options);

  try {
    const { docs } = await TateyamaDB.query(idReg);

    const forecastDir = `${options.workDir}/forecast/`;
    const files = await FastGlob(`${forecastDir}/${forecastName}.json`, { onlyFiles: true });
    if (files.length === 0) {
      logger.warn("AIが見つかりませんでした");
      return;
    }
    const forecast = Tateyama.Forecast.fromJSON(readFileSync(files[0]).toString());

    docs.forEach((race) => {
      const choice = Tateyama.getForecastResultChoiced(forecast.forecast(race));
      Tateyama.dumpForecastResult(race, choice);
    })

    
  } catch (err) {
    logger.error(err);
  }
}
