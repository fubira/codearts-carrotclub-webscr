import * as Tateyama from 'tateyama/v2';

/**
 * オッズから勝率レートを算出する
 *
 * @param value 
 * @returns 
 */
export const OddsToWinRate = (value: number) => {
  return 1 / (value || 1);
}

export function getForecastResultChoiced(results: Tateyama.ForecastResult[]) {
  const worker = [...results.sort((a, b) => b.forecastValue - a.forecastValue)];
  const bet1st = worker.shift();
  const bet2nd = worker.shift();
  const bet3rd = worker.shift();
  const betRemark = worker.sort((a, b) => b.benefitRate - a.benefitRate).shift();
  const betNext1 = worker.shift();
  const betNext2 = worker.filter((f) => f.benefitRate > 0)?.sort((a, b) => b.benefitRate - a.benefitRate).shift();
  const betNext = (betNext2 && (betNext1.benefitRate < 1) && (betNext1.forecastWinRate < betNext1.oddsWinRate)) ? betNext2 : betNext1;

  return [
    bet1st,
    bet2nd,
    bet3rd,
    betNext,
    betRemark,
  ]
}

export function generateBetResult(bet: Tateyama.ForecastResult[]) {
  bet[0].horseId

}