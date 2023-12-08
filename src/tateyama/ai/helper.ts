import { AI, JVCsv } from 'tateyama';

export const softmax = (logits: number[]) => {
  const maxLogit = Math.max(...logits);
  const scores = logits.map(l => Math.exp(l - maxLogit));
  const denom = scores.reduce((a, b) => a + b, 0);
  return scores.map(s => s / denom);
}

/**
 * オッズから勝率レートを算出する
 *
 * @param value 
 * @returns 
 */
export const OddsToWinRate = (value: number) => {
  return 1 / (value || 1);
}

export function getForecastResultChoiced(results: AI.ForecastResult[]) {
  // 予想レート順にソート
  const worker = [...results.sort((a, b) => b.forecastValue - a.forecastValue)];

  // 3番手まではレート順で決める
  const bet1st = worker.shift();
  const bet2nd = worker.shift();
  const bet3rd = worker.shift();
  const bet4th = worker.shift();
  const bet5th = worker.shift();

  // 5番手(☆)はオッズと予想順位の格差の大きいものを選ぶ
  // const betRemark = worker.sort((a, b) => b.benefitRate - a.benefitRate).shift();

  // 4番手(△)は基本レート順4番手
  // ただし4番手候補の割安度が低い場合、残りの候補から割安度の最も高いものを選ぶ
  // const betNext1 = worker.shift();
  // const betNext2 = worker.filter((f) => f.benefitRate > 0)?.sort((a, b) => b.benefitRate - a.benefitRate).shift();
  // const betNext = (betNext2 && (betNext1.benefitRate < 1) && (betNext1.forecastWinRate < betNext1.oddsWinRate)) ? betNext2 : betNext1;

  return [
    bet1st,
    bet2nd,
    bet3rd,
    bet4th,
    bet5th,
  ]
}

export function dumpForecastResult(race: JVCsv.RA, entries: JVCsv.SE[], results: AI.ForecastResult[]) {
  const mark = ['A', 'B', 'C', 'D', 'X', 'R', 'R', 'R'];

  console.log('==========');
  console.log(`${race.Year}${race.MonthDay} }${race.RaceNum} ${race.Hondai}`);

  results.forEach((res, index) => {
    const horseId = res.horseId.toFixed(0).padStart(2, ' ');
    const horseName = res.horseName.padEnd(12, ' ');
    const forecastValue = (res.forecastValue * 100).toFixed(2).padStart(6, ' ');
    const benefitRate = res.benefitRate.toFixed(2).padStart(6, ' ');
    const horseEntry = entries.find((e) => Number(e.Umaban) === res.horseId);
    
    let resultDetailText = "";
    if (horseEntry) {
      const horseResultOrderText = !horseEntry.KakuteiJyuni ? `競争中止` : `${horseEntry.KakuteiJyuni}着`;
      const horseResultDetailText = !horseEntry.Ninki ? '競争除外' : `${horseEntry.Ninki}人気 ${horseResultOrderText}`
      resultDetailText = `(-> ${horseResultDetailText})`;
    }

    // 勝率[${forecastWinRate}] 
    console.log(`${mark[index]} ${horseId}-${horseName}: スコア[${forecastValue}] 割安度[${benefitRate}] ${resultDetailText}`);
  })


}