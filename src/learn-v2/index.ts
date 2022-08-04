import logger from 'logger';
import TateyamaDB from 'db';

import * as Tateyama from 'tateyama/v2';

export default async (idReg: string, options: { workDir: string, cycle: string, init: boolean }) => {
  logger.info(idReg, options);

  const betLogger = new Tateyama.BetLogger();
  const forecasts = Array.from(new Array(20)).map(() => new Tateyama.Forecast());
  const MAX_RACE = 1000;

  try {
    const { docs, warning } = await TateyamaDB.query(idReg);

    if (docs) {
      logger.info(`${docs.length}件のデータがマッチしました`);
    }
    if (warning) {
      logger.warn(warning);
    }

    const races = docs.length > MAX_RACE ? MAX_RACE : docs.length;

    docs.slice(0, races).forEach((race, index) => {
      forecasts.forEach((forecast) => {
        const forecastResult = forecast.forecast(race);
        const choice = Tateyama.getForecastResultChoiced(forecastResult);
        betLogger.bet(forecast.name, race._id, choice, race.result);
      });

      index % 100 === 0 && logger.info(`${index}/${races}`);
    });

    forecasts.forEach((forecast) => {
      console.log(betLogger.stats(forecast.name));
    });

    Tateyama.dumpTimeCountLog();


    // console.log({ name: `${forecast.name}`, choice });

  } catch (err) {
    logger.error(err);
  }
}
