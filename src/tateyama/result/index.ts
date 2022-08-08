export * from './types';

import logger from 'logger';
import { Result, DB, AI } from 'tateyama';
import * as Formatter from './formatter';

export class Logger {
  private logs: Result.Log[];

  public constructor () {
    this.clear();
  }

  public clear() {
    this.logs = [];
  }

  public bet(forecastResult: AI.ForecastResult[], raceResult: DB.HR) {
    this.logs.push({
      raceId: DB.getRaceID(raceResult?.jvid),
      bet: [
        Formatter.makeBetResult(forecastResult, raceResult, Result.BetStyle.WinShowA),
        Formatter.makeBetResult(forecastResult, raceResult, Result.BetStyle.QuinellaPlaceABC),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.ShowABC),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.ShowABX),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.QuinellaPlaceABX),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.QuinellaExactaABC),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.ExactaAtoAll),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.TrioAtoAll),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.TrioABtoAll),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.TrifectaAB),
        // Formatter.makeBetResult(forecast, raceResult, Result.BetStyle.TrifectaABX),
      ],
    });
  }

  public stats(): Result.Stats {
    const filteredLogs = this.logs;
    const stats: Result.Stats = {};

    Object.values(Result.BetStyle).forEach((betStyle: Result.BetStyle) => {
      const logMap = filteredLogs.map((log) => {
        const found = log.bet.find((bet) => bet.betStyle === betStyle);
        return { amount: found?.amount || 0, result: found?.result || 0 };
      });

      const hitRace = logMap.filter((log) => log.result > 0).length;
      const betRace = logMap.filter((log) => log.amount > 0).length;

      const totalResult = logMap.map((lm) => lm.result)?.reduce((p, c) => p + c, 0);
      const totalAmount = logMap.map((lm) => lm.amount)?.reduce((p, c) => p + c, 0);

      stats[betStyle] = {
        result: totalResult,
        amount: totalAmount,
        resultRate: (totalAmount > 0) ? (totalResult / totalAmount) : 0,
        hitRace: hitRace,
        betRace: betRace,
        hitRate: (betRace > 0) ? (hitRace / betRace) : 0,
      };
    })

    return stats;
  }

  public dump() {
    const logStats = this.stats();

    const topKeys = Object.keys(logStats)
      .sort((a, b) => logStats[b].hitRate - logStats[a].hitRate)
      .filter((a) => logStats[a].amount > 0)
      .slice(0, 2);

    topKeys.forEach((key) => {
      const log = logStats[key];
      const betType = String(key).padEnd(50, ' ');
      const resultValue = log.result.toLocaleString().padStart(10, ' ');
      const amountValue = log.amount.toLocaleString().padStart(10, ' ');
      const resultRate = String((log.resultRate * 100).toFixed(2).padStart(7, ' '))

      const hitRace = String(log.hitRace).padStart(4, ' ');
      const betRace = String(log.betRace).padStart(4, ' ');
      const hitRate = String((log.hitRate * 100).toFixed(2).padStart(7, ' '))

      logger.info(`${betType}: Result/Purchase ${resultValue} / ${amountValue} (${resultRate} %) Hit/Bet ${hitRace} / ${betRace} R (${hitRate} %)`)
    });

    logger.info(`==========`);
  }
}