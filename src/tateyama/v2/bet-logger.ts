import * as Tateyama from 'tateyama/v2';
import * as TateyamaV1 from 'tateyama/v1/types';
import logger from 'logger';

function logBetWinShow(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  // const bet2nd = forecast[1].horseId;
  // const bet3rd = forecast[2].horseId;
  // const bet4th = forecast[3].horseId;
  // const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.BetWinShow;
  const betText = [
    `単勝 ${bet1st} x 1200円`,
    `複勝 ${bet1st} x 2400円`,
  ];
  const amount = 1200 + 2400;
  const result = [
    ...raceResult.refund.win.map((w) => w.horseId === bet1st ? w.amount * 12 : 0),
    ...raceResult.refund.place.map((w) => w.horseId === bet1st ? w.amount * 24 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}

/*
function logBetShow(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  // const bet4th = forecast[3].horseId;
  // const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.BetShow;
  const betText = [
    `複勝 ${bet1st} x 1200円`,
    `複勝 ${bet2nd} x 1200円`,
    `複勝 ${bet3rd} x 1200円`,
  ];
  const amount = 1200 + 1200 + 1200;
  const result = [
    ...raceResult.refund.place.map((w) => w.horseId === bet1st ? w.amount * 12 : 0),
    ...raceResult.refund.place.map((w) => w.horseId === bet2nd ? w.amount * 12 : 0),
    ...raceResult.refund.place.map((w) => w.horseId === bet3rd ? w.amount * 12 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}
*/

/*
function logBetShowBenefit(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  // const bet3rd = forecast[2].horseId;
  // const bet4th = forecast[3].horseId;
  const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.BetShowBenefit;
  const betText = [
    `複勝 ${bet1st} x 1200円`,
    `複勝 ${bet2nd} x 1200円`,
    `複勝 ${bet5th} x 1200円`,
  ];
  const amount = 1200 + 1200 + 1200;
  const result = [
    ...raceResult.refund.place.map((w) => w.horseId === bet1st ? w.amount * 12 : 0),
    ...raceResult.refund.place.map((w) => w.horseId === bet2nd ? w.amount * 12 : 0),
    ...raceResult.refund.place.map((w) => w.horseId === bet5th ? w.amount * 12 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}
*/

function logQuinellaPlace(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  // const bet4th = forecast[3].horseId;
  // const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.QuinellaPlace;
  const betText = [
    `馬連 ${bet1st}-${bet2nd} x 1200円`,
    `ワイド ${bet1st}-${bet2nd} x 1200円`,
    `ワイド ${bet1st}-${bet3rd} x 1200円`,
  ];
  const amount = 1200 + 1200 + 1200;
  const result = [
    ...raceResult.refund.quinella.map((w) => w.horseId.includes(bet1st) && w.horseId.includes(bet2nd) ? w.amount * 12 : 0),
    ...raceResult.refund.quinellaPlace.map((w) => w.horseId.includes(bet1st) && w.horseId.includes(bet2nd) ? w.amount * 12 : 0),
    ...raceResult.refund.quinellaPlace.map((w) => w.horseId.includes(bet1st) && w.horseId.includes(bet3rd) ? w.amount * 12 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}

function logQuinellaPlaceBenefit(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  // const bet3rd = forecast[2].horseId;
  // const bet4th = forecast[3].horseId;
  const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.QuinellaPlaceBenefit;
  const betText = [
    `馬連 ${bet1st}-${bet2nd} x 1200円`,
    `ワイド ${bet1st}-${bet2nd} x 1200円`,
    `ワイド ${bet1st}-${bet5th} x 1200円`,
  ];
  const amount = 1200 + 1200 + 1200;
  const result = [
    ...raceResult.refund.quinella.map((w) => w.horseId.includes(bet1st) && w.horseId.includes(bet2nd) ? w.amount * 12 : 0),
    ...raceResult.refund.quinellaPlace.map((w) => w.horseId.includes(bet1st) && w.horseId.includes(bet2nd) ? w.amount * 12 : 0),
    ...raceResult.refund.quinellaPlace.map((w) => w.horseId.includes(bet1st) && w.horseId.includes(bet5th) ? w.amount * 12 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}

function logQuinellaExacta(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  // const bet4th = forecast[3].horseId;
  // const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.QuinellaExacta;
  const betText = [
    `馬連 ${bet1st}-${bet2nd} x 2000円`,
    `馬単 ${bet1st}-${bet2nd} x 800円`,
    `馬単 ${bet1st}-${bet3rd} x 800円`,
  ];
  const amount = 2000 + 800 + 800;
  const result = [
    ...raceResult.refund.quinella.map((w) => w.horseId.includes(bet1st) && w.horseId.includes(bet2nd) ? w.amount * 20 : 0),
    ...raceResult.refund.exacta.map((w) => w.horseId[0] === bet1st && w.horseId[1] === bet2nd ? w.amount * 8 : 0),
    ...raceResult.refund.exacta.map((w) => w.horseId[0] === bet1st && w.horseId[1] === bet3rd ? w.amount * 8 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}

/*
function logExacta(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  const bet4th = forecast[3].horseId;
  const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.Exacta;
  const betText = [
    `馬単 ${bet1st}-${bet2nd} x 1200円`,
    `馬単 ${bet1st}-${bet3rd} x 1200円`,
    `馬単 ${bet1st}-${bet4th} x 600円`,
    `馬単 ${bet1st}-${bet5th} x 600円`,
  ];
  const amount = 1200 + 1200 + 600 + 600;
  const result = [
    ...raceResult.refund.exacta.map((w) => w.horseId[0] === bet1st && w.horseId[1] === bet2nd ? w.amount * 12 : 0),
    ...raceResult.refund.exacta.map((w) => w.horseId[0] === bet1st && w.horseId[1] === bet3rd ? w.amount * 12 : 0),
    ...raceResult.refund.exacta.map((w) => w.horseId[0] === bet1st && w.horseId[1] === bet4th ? w.amount * 6 : 0),
    ...raceResult.refund.exacta.map((w) => w.horseId[0] === bet1st && w.horseId[1] === bet5th ? w.amount * 6 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}
*/

function logTrio1(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  const bet4th = forecast[3].horseId;
  const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.Trio1;
  const betText = [
    `三連複 流し ${bet1st}-${bet2nd},${bet3rd},${bet4th},${bet5th} x 300円`,
    `三連複 流し ${bet2nd}-${bet1st},${bet3rd},${bet4th},${bet5th} x 300円`,
  ];
  const amount = 300 * 6 + 300 * 6;
  const result = [
    ...raceResult.refund.trio.map((w) =>
      (w.horseId.includes(bet1st) && (
        (w.horseId.includes(bet2nd) && w.horseId.includes(bet3rd)) ||
        (w.horseId.includes(bet2nd) && w.horseId.includes(bet4th)) ||
        (w.horseId.includes(bet2nd) && w.horseId.includes(bet5th)) ||
        (w.horseId.includes(bet3rd) && w.horseId.includes(bet4th)) ||
        (w.horseId.includes(bet3rd) && w.horseId.includes(bet5th)) ||
        (w.horseId.includes(bet4th) && w.horseId.includes(bet5th))
      )) ? w.amount * 3 : 0),
    ...raceResult.refund.trio.map((w) =>
      (w.horseId.includes(bet2nd) && (
        (w.horseId.includes(bet1st) && w.horseId.includes(bet3rd)) ||
        (w.horseId.includes(bet1st) && w.horseId.includes(bet4th)) ||
        (w.horseId.includes(bet1st) && w.horseId.includes(bet5th)) ||
        (w.horseId.includes(bet3rd) && w.horseId.includes(bet4th)) ||
        (w.horseId.includes(bet3rd) && w.horseId.includes(bet5th)) ||
        (w.horseId.includes(bet4th) && w.horseId.includes(bet5th))
      )) ? w.amount * 3 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}

function logTrio2(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  const bet4th = forecast[3].horseId;
  const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.Trio2;
  const betText = [
    `三連複 流し ${bet1st}-${bet2nd},${bet3rd},${bet4th},${bet5th} x 600円`,
  ];
  const amount = 600 * 6 ;
  const result = [
    ...raceResult.refund.trio.map((w) =>
      (w.horseId.includes(bet1st) && (
        (w.horseId.includes(bet2nd) && w.horseId.includes(bet3rd)) ||
        (w.horseId.includes(bet2nd) && w.horseId.includes(bet4th)) ||
        (w.horseId.includes(bet2nd) && w.horseId.includes(bet5th)) ||
        (w.horseId.includes(bet3rd) && w.horseId.includes(bet4th)) ||
        (w.horseId.includes(bet3rd) && w.horseId.includes(bet5th)) ||
        (w.horseId.includes(bet4th) && w.horseId.includes(bet5th))
      )) ? w.amount * 6 : 0),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}
/*
function logTrifecta3(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  const bet4th = forecast[3].horseId;
  const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.Trifecta3;
  const betText = [
    `三連単 ${bet1st},${bet2nd}-${bet1st},${bet2nd}-${bet3rd},${bet4th},${bet5th} x 200円`,
    `三連単 ${bet1st}-${bet2nd},${bet3rd},${bet4th},${bet5th}-${bet2nd},${bet3rd},${bet4th},${bet5th} x 200円`,
  ];
  const amount = 200 * 6 + 200 * 12;
  const result = [
    ...raceResult.refund.trifecta.map((w) => (
        (w.horseId[0] === bet1st || w.horseId[0] === bet2nd) &&
        (w.horseId[1] === bet1st || w.horseId[1] === bet2nd) &&
        (w.horseId[2] === bet3rd || w.horseId[2] === bet4th || w.horseId[2] === bet5th)
      ) ? w.amount * 2 : 0
    ),
    ...raceResult.refund.trifecta.map((w) => (
        (w.horseId[0] === bet1st) &&
        (w.horseId[1] === bet2nd || w.horseId[1] === bet3rd || w.horseId[1] === bet4th || w.horseId[1] === bet5th) &&
        (w.horseId[2] === bet2nd || w.horseId[2] === bet3rd || w.horseId[2] === bet4th || w.horseId[2] === bet5th)
      ) ? w.amount * 2 : 0
    ),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}
*/

function logTrifecta1(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  const bet4th = forecast[3].horseId;
  const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.Trifecta1;
  const betText = [
    `三連単 ${bet1st},${bet2nd}-${bet1st},${bet2nd},${bet3rd},${bet5th}-${bet1st},${bet2nd},${bet3rd},${bet4th},${bet5th} x 200円`,
  ];
  const amount = 200 * 6 + 200 * 12;
  const result = [
    ...raceResult.refund.trifecta.map((w) =>
      (
        (w.horseId[0] === bet1st) &&
        (w.horseId[1] === bet2nd || w.horseId[1] === bet3rd || w.horseId[1] === bet5th) &&
        (w.horseId[2] === bet2nd || w.horseId[2] === bet3rd || w.horseId[2] === bet4th || w.horseId[2] === bet5th)
      ) ? w.amount * 2 : 0
    ),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}

function logTrifecta2(forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
  const bet1st = forecast[0].horseId;
  const bet2nd = forecast[1].horseId;
  const bet3rd = forecast[2].horseId;
  const bet4th = forecast[3].horseId;
  const bet5th = forecast[4].horseId;

  const betType = Tateyama.BetType.Trifecta2;
  const betText = [
    `三連単 ${bet1st},${bet2nd},${bet5th}-${bet1st},${bet2nd},${bet5th}-${bet1st},${bet2nd},${bet3rd},${bet4th},${bet5th} x 200円`,
  ];
  const amount = 200 * 18;
  const result = [
    ...raceResult.refund.trifecta.map((w) =>
      (
        (w.horseId[0] === bet1st || w.horseId[0] === bet2nd || w.horseId[0] === bet5th) &&
        (w.horseId[1] === bet1st || w.horseId[1] === bet2nd || w.horseId[1] === bet5th) &&
        (w.horseId[2] === bet1st || w.horseId[2] === bet2nd || w.horseId[2] === bet3rd || w.horseId[2] === bet4th || w.horseId[2] === bet5th)
      ) ? w.amount * 2 : 0
    ),
  ].reduce((p, c) => p + c);

  return { betType, betText, amount, result };
}


export interface BetLog {
  forecastName: string,
  raceId: string,
  bet: {
    betType: string,
    betText: string[],
    amount: number,
    result: number,
  }[],
}

export interface LogStats {
  [key: string]: {
    result: number,
    amount: number,
    resultRate: number,
    hitRace: number,
    betRace: number,
    hitRate: number,
  }
}

export class BetLogger {
  private logs: BetLog[];

  public constructor () {
    this.clear();
  }

  public clear() {
    this.logs = [];
  }

  public bet(forecastName: string, raceId: string, forecast: Tateyama.ForecastResult[], raceResult: TateyamaV1.DBResult) {
    this.logs.push({
      forecastName,
      raceId,
      bet: [
        logBetWinShow(forecast, raceResult),
        // logBetShow(forecast, raceResult),
        // logBetShowBenefit(forecast, raceResult),
        logQuinellaPlace(forecast, raceResult),
        logQuinellaPlaceBenefit(forecast, raceResult),
        logQuinellaExacta(forecast, raceResult),
        // logExacta(forecast, raceResult),
        logTrio1(forecast, raceResult),
        logTrio2(forecast, raceResult),
        logTrifecta1(forecast, raceResult),
        logTrifecta2(forecast, raceResult),
        // logTrifecta3(forecast, raceResult),
      ],
    });
  }

  public stats(forecaastName: string): LogStats {
    const filteredLogs = this.logs.filter((l) => l.forecastName === forecaastName);
    const stats: LogStats = {};

    Object.values(Tateyama.BetType).forEach((betType: Tateyama.BetType) => {
      const logMap = filteredLogs.map((log) => {
        const found = log.bet.find((bet) => bet.betType === betType);
        return { amount: found.amount, result: found.result };
      });

      const hitRace = logMap.filter((log) => log.result > 0).length;
      const betRace = logMap.filter((log) => log.amount > 0).length;

      const totalResult = logMap.map((lm) => lm.result).reduce((p, c) => p + c);
      const totalAmount = logMap.map((lm) => lm.amount).reduce((p, c) => p + c);

      stats[betType] = {
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

  /**
   * 指定したForecastの中から成績ベスト5とワースト1を取り出す
   * @param names 
   */
  public getSelections(names: string[], good: number, worst: number) {
    const scores = names.map((name) => {
      const logStats = this.stats(name);
      const top5Keys = Object.keys(logStats)
        .sort((a, b) => logStats[b].hitRate - logStats[a].hitRate)
        .slice(0, 8);

      const totalResultRate = top5Keys.map((key) => logStats[key].resultRate).reduce((p, c) => p + c) / 8;
      const totalHitRate = top5Keys.map((key) => logStats[key].hitRate).reduce((p, c) => p + c) / 8;
      return { name, score: totalHitRate + totalResultRate };
    }).sort((a, b) => b.score - a.score);

    const selections = [ ...scores.slice(0, good), ...scores.slice(-worst) ];

    return selections;
  }

  public dump(selections: { name: string, score: number }[]) {
    selections.forEach(({ name, score }, index) => {
      const logStats = this.stats(name);

      const topKeys = Object.keys(logStats)
        .sort((a, b) => logStats[b].hitRate - logStats[a].hitRate)
        .slice(0, 8);

      logger.info(`== Rank ${index + 1}. [${name}] - (rating ${(score * 100).toFixed(2)})`);

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
    })
  }
}