/**
 * 数値を小数点以下で丸める
 * @param value 
 * @returns 
 */
 export const Round2 = (value: number) => {
  return Math.round(value * 100) / 100;
}

 export const Round3 = (value: number) => {
  return Math.round(value * 1000) / 1000;
}

/**
 * タイムレートを算出する
 * 
 *   100 - ((秒数 / 距離) * 1000)
 *
 * @param value 
 * @returns 
 */
 export const CalcTimeRate = (value: number, distance: number) => {
  if (!distance) {
    return 0;
  } 

  const time1000 = 100 - ((value || 100) * 1000) / distance;

  return Math.round(time1000 * 100) / 100;
}

/**
 * オッズから勝率レートを算出する
 * 
 *   1 / (オッズ || 1)
 *
 * @param value 
 * @returns 
 */
export const CalcWinningRate = (value: number) => {
  return 1 / (value || 1);
}
