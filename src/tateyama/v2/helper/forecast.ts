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
  // 予想レート順にソート
  const worker = [...results.sort((a, b) => b.forecastValue - a.forecastValue)];

  // 3番手まではレート順で決める
  const bet1st = worker.shift();
  const bet2nd = worker.shift();
  const bet3rd = worker.shift();

  // 5番手(☆)はオッズと予想順位の格差の大きいものを選ぶ
  const betRemark = worker.sort((a, b) => b.benefitRate - a.benefitRate).shift();

  // 4番手(△)は基本レート順4番手
  // ただし4番手候補の割安度が低い場合、残りの候補から割安度の最も高いものを選ぶ
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
