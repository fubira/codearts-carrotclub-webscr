import { Data } from 'tateyama';

export const CourseTypeToNumber = (value: Data.CourseType) => { 
  switch (value) {
    case '芝': return 0;
    case 'ダート': return 1;
    default: return -1;
  }
}

export const CourseDirectionToNumber = (value: Data.CourseDirection) => { 
  switch (value) {
    default:
    case '左': return 0;
    case '右': return 1;
  }
}

export const CourseWeatherToNumber = (value: Data.CourseWeather) => { 
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

export const CourseConditionToNumber = (value: Data.CourseCondition) => { 
  switch (value) {
    default:
    case '良': return 0;
    case '稍重': return 1;
    case '重': return 2;
    case '不良': return 3;
  }
}

export const HorseSexToNumber = (value: Data.HorseSex) => { 
  switch (value) {
    default:
    case '牡': return 0;
    case '牝': return 1;
    case 'セン': return 2;
  }
}
