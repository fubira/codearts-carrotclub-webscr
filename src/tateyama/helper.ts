import * as Types from './types';

export const CourseTypeToNumber = (value: Types.CourseType) => { 
  switch (value) {
    case '芝': return 0;
    case 'ダート': return 1;
    default: return -1;
  }
}

export const CourseDirectionToNumber = (value: Types.CourseDirection) => { 
  switch (value) {
    default:
    case '左': return 0;
    case '右': return 1;
  }
}

export const CourseWeatherToNumber = (value: Types.CourseWeather) => { 
  switch (value) {
    default:
    case '晴': return 0;
    case '曇': return 1;
    case '雨': return 2;
    case '小雨': return 3;
    case '雪': return 4;
    case '小雪': return 5;
  }
}

export const CourseConditionToNumber = (value: Types.CourseCondition) => { 
  switch (value) {
    default:
    case '良': return 0;
    case '稍重': return 1;
    case '重': return 2;
    case '不良': return 3;
  }
}

export const HorseSexToNumber = (value: Types.HorseSex) => { 
  switch (value) {
    default:
    case '牡': return 0;
    case '牝': return 1;
    case 'セン': return 2;
  }
}

/**
 * 数値を小数点以下一桁で丸める
 * @param value 
 * @returns 
 */
 export const RoundTime = (value: number) => {
  return Math.round(value * 10) / 10;
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

  const time1000 = 100 - (value * 1000) / distance;

  return Math.round(time1000 * 100) / 100;
}
