import logger from 'logger';
import FastGlob from 'fast-glob';
import { readFileSync } from 'fs';

import { AI, DB } from 'tateyama';

export default async (idReg: string, forecastName: string, options: { workDir: string }) => {
  logger.info(options);

  try {
    const { docs } = await DB.query(idReg);

    const forecastDir = `${options.workDir}/forecast/`;
    const files = await FastGlob(`${forecastDir}/${forecastName}.json`, { onlyFiles: true });
    if (files.length === 0) {
      logger.warn("AIが見つかりませんでした");
      return;
    }
    const forecast = AI.Forecast.fromJSON(readFileSync(files[0]).toString());

    docs.forEach((race) => {
      const choice = AI.getForecastResultChoiced(forecast.forecast(race));
      AI.dumpForecastResult(race, choice);
    })

    
  } catch (err) {
    logger.error(err);
  }
}
