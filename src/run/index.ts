import logger from 'logger';
import FastGlob from 'fast-glob';
import { readFileSync } from 'fs';

import { Forecast, DB } from 'tateyama';

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
    const forecast = Forecast.ForecastAI.fromJSON(readFileSync(files[0]).toString());

    docs.forEach((race) => {
      const choice = Forecast.getForecastResultChoiced(forecast.forecast(race));
      Forecast.dumpForecastResult(race, choice);
    })

    
  } catch (err) {
    logger.error(err);
  }
}
