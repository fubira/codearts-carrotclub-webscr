import { Forecast, Data } from 'tateyama/v2';

function getCoursePlaceID(courseName: string): Forecast.StateFactorID[] {
  switch (courseName) {
    case "東京":
      return [Forecast.StateFactorID.CourePlaceTokyo];
    case "中山":
      return [Forecast.StateFactorID.CourePlaceNakayama];
    case "阪神":
      return [Forecast.StateFactorID.CourePlaceHanshin];
    case "京都":
      return [Forecast.StateFactorID.CourePlaceKyoto];
    case "中京":
      return [Forecast.StateFactorID.CourePlaceChukyo];
    case "小倉":
      return [Forecast.StateFactorID.CourePlaceKokura];
    case "福島":
      return [Forecast.StateFactorID.CourePlaceFukushima];
    case "新潟":
      return [Forecast.StateFactorID.CourePlaceNiigata];
    case "札幌":
      return [Forecast.StateFactorID.CourePlaceSapporo];
    case "函館":
      return [Forecast.StateFactorID.CourePlaceHakodate];
    default:
      return [Forecast.StateFactorID.CourePlaceLocal];
  }
}

export function getCourseConditionID(courseCondition: string): Forecast.StateFactorID[] {
  if (courseCondition === "良") {
    return [
      Forecast.StateFactorID.CourseConditionFirm
    ];
  }
  if (courseCondition === "稍重") {
    return [
      Forecast.StateFactorID.CourseConditionGood,
      Forecast.StateFactorID.CourseConditionWorthThanGood
    ];
  }
  if (courseCondition === "重") {
    return [
      Forecast.StateFactorID.CourseConditionWorthThanGood,
      Forecast.StateFactorID.CourseConditionWorthThanYielding
    ];
  }
  if (courseCondition === "不良") {
    return [
      Forecast.StateFactorID.CourseConditionWorthThanGood,
      Forecast.StateFactorID.CourseConditionWorthThanYielding,
      Forecast.StateFactorID.CourseConditionWorthThanHeavy
    ];
  }
  return [];
}

function getCourseDistanceID(courseDistance: number): Forecast.StateFactorID[] {
  if (courseDistance <= 1300) {
    return [Forecast.StateFactorID.CourseDistanceSprint];
  } else if (courseDistance < 1900) {
    return [Forecast.StateFactorID.CourseDistanceMile];
  } else if (courseDistance <= 2100) {
    return [Forecast.StateFactorID.CourseDistanceIntermediate];
  } else if (courseDistance <= 2700) {
    return [Forecast.StateFactorID.CourseDistanceLong];
  } else {
    return [Forecast.StateFactorID.CourseDistanceExtended];
  }
}

function getCourseTypeID(courseType: string): Forecast.StateFactorID[] {
  if (courseType.startsWith('芝')) {
    return [Forecast.StateFactorID.CourseTypeTurf];
  }
  if (courseType.startsWith('ダ')) {
    return [Forecast.StateFactorID.CourseTypeDirt];
  }
  return [Forecast.StateFactorID.CourseTypeOthers];
}

function getCourseWeatherID(courseWeather: string): Forecast.StateFactorID[] {
  if (courseWeather.includes('雨')) {
    return [Forecast.StateFactorID.CourseWeatherRain];
  }
  if (courseWeather.includes('雪')) {
    return [Forecast.StateFactorID.CourseWeatherSnow];
  }

  return [Forecast.StateFactorID.CourseWeatherFine];
}

function getCourseDirectionID(courseDirection: string): Forecast.StateFactorID[] {
  return (courseDirection === '右') 
    ? [Forecast.StateFactorID.CourseDirectionRight]
    : [Forecast.StateFactorID.CourseDirectionLeft];
}

function getRaceCategoryID(raceCategory: string): Forecast.StateFactorID[] {
  if (raceCategory?.startsWith('未勝利') || raceCategory?.startsWith('新馬')) {
    return [Forecast.StateFactorID.RaceCategoryMaiden];
  }
  if (raceCategory?.startsWith('1勝')) {
    return [Forecast.StateFactorID.RaceCategoryWin1];
  }
  if (raceCategory?.startsWith('2勝')) {
    return [Forecast.StateFactorID.RaceCategoryWin2];
  }
  if (raceCategory?.startsWith('3勝')) {
    return [Forecast.StateFactorID.RaceCategoryWin3];
  }
  if (raceCategory?.startsWith('オープン')) {
    return [Forecast.StateFactorID.RaceCategoryOpen];
  }

  return [];
}

function getRaceEntryNumberID(raceEntryNumber: number): Forecast.StateFactorID[] {
  if (raceEntryNumber <= 10) {
    return [Forecast.StateFactorID.RaceEntryNumberSmall];
  }
  if (raceEntryNumber >= 14) {
    return [Forecast.StateFactorID.RaceEntryNumberLarge];
  }

  return [];
}

function getHorseSexID(horseSex: string): Forecast.StateFactorID[] {
  switch (horseSex) {
    case '牡':
    case 'オス':
    case 'セン':
      return [Forecast.StateFactorID.HorseMale];
    case '牝':
      return [Forecast.StateFactorID.HorseFemale];
  }
  return [];
}

function getHorseJockyChangeID(isJockyChange: boolean): Forecast.StateFactorID[] {
  if (isJockyChange) {
    return [Forecast.StateFactorID.HorseJockeyChange];
  }
  return [];
}

function getHorseReturnFromOverseaID(isReturnFromOversea: boolean): Forecast.StateFactorID[] {
  if (isReturnFromOversea) {
    return [Forecast.StateFactorID.HorseReturnFromLocal];
  }
  return [];
}

function getHorseReturnFromLocalID(isReturnFromLocal: boolean): Forecast.StateFactorID[] {
  if (isReturnFromLocal) {
    return [Forecast.StateFactorID.HorseReturnFromLocal];
  }
  return [];
}

function getHorseFirstCourseID(isFirstCourse: boolean): Forecast.StateFactorID[] {
  if (isFirstCourse) {
    return [Forecast.StateFactorID.HorseFirstCourse];
  }
  return [];
}

function getHorseFirstTurfID(isFirstTurf: boolean): Forecast.StateFactorID[] {
  if (isFirstTurf) {
    return [Forecast.StateFactorID.HorseFirstTurf];
  }
  return [];
}

function getHorseFirstDirtID(isFirstDirt: boolean): Forecast.StateFactorID[] {
  if (isFirstDirt) {
    return [Forecast.StateFactorID.HorseFirstDirt];
  }
  return [];
}

function getHorseFirstDistanceID(isFirstDistance: boolean): Forecast.StateFactorID[] {
  if (isFirstDistance) {
    return [Forecast.StateFactorID.HorseFirstDistance];
  }
  return [];
}

function getHorseChangeToTurfID(isChangeToTurf: boolean): Forecast.StateFactorID[] {
  if (isChangeToTurf) {
    return [Forecast.StateFactorID.HorseChangeToTurf];
  }
  return [];
}

function getHorseChangeToDirtID(isChangeToDirt: boolean): Forecast.StateFactorID[] {
  if (isChangeToDirt) {
    return [Forecast.StateFactorID.HorseChangeToDirt];
  }
  return [];
}

function getHorseClassUpID(isClassUp: boolean): Forecast.StateFactorID[] {
  if (isClassUp) {
    return [Forecast.StateFactorID.HorseClassUp];
  }
  return [];
}

function getHorseAfterRestID(isAfterRest: boolean): Forecast.StateFactorID[] {
  if (isAfterRest) {
    return [Forecast.StateFactorID.HorseAfterRest];
  }
  return [];
}

function getHorseBracketID(bracketId: number, horseId: number): Forecast.StateFactorID[] {
  const result: Forecast.StateFactorID[] = [];
  if (horseId % 2 === 0) {
    result.push(Forecast.StateFactorID.HorseGateEven);
  } else {
    result.push(Forecast.StateFactorID.HorseGateOdd);
  }

  if (horseId <= 4) {
    result.push(Forecast.StateFactorID.HorseBracketInner);
  }
  if (horseId >= 12) {
    result.push(Forecast.StateFactorID.HorseBracketOuter);
  }

  switch (bracketId) {
    case 1: result.push(Forecast.StateFactorID.HorseBracket1); break;
    case 2: result.push(Forecast.StateFactorID.HorseBracket2); break;
    case 3: result.push(Forecast.StateFactorID.HorseBracket3); break;
    case 4: result.push(Forecast.StateFactorID.HorseBracket4); break;
    case 5: result.push(Forecast.StateFactorID.HorseBracket5); break;
    case 6: result.push(Forecast.StateFactorID.HorseBracket6); break;
    case 7: result.push(Forecast.StateFactorID.HorseBracket7); break;
    case 8: result.push(Forecast.StateFactorID.HorseBracket8); break;
  }
  
  return result;
}

function getHorseAgeID(horseAge: number): Forecast.StateFactorID[] {
  if (horseAge <= 2) {
    return [Forecast.StateFactorID.HorseAge2];
  }
  if (horseAge === 3) {
    return [Forecast.StateFactorID.HorseAge3];
  }
  if (horseAge === 4) {
    return [Forecast.StateFactorID.HorseAge4];
  }
  if (horseAge >= 5) {
    return [Forecast.StateFactorID.HorseAgeOver5];
  }
  return [];
}

export function getRaceStateFactor(race: Data.Race) {
  return [
    ... getCoursePlaceID(race.courseName),
    ... getCourseConditionID(race.course.condition),
    ... getCourseDistanceID(race.course.distance),
    ... getCourseTypeID(race.course.type),
    ... getCourseWeatherID(race.course.weather),
    ... getCourseDirectionID(race.course.direction),
    ... getRaceCategoryID(undefined), // TODO
    ... getRaceEntryNumberID(race.entries.length),
  ];
}

export function getHorseStateFactor(entry: Data.Entry) {
  return [
    ... getHorseSexID(entry.horseSex),
    ... getHorseJockyChangeID(false), // TODO
    ... getHorseReturnFromOverseaID(false), // TODO
    ... getHorseReturnFromLocalID(false), // TODO
    ... getHorseFirstCourseID(false), // TODO
    ... getHorseFirstTurfID(false), // IODO
    ... getHorseFirstDirtID(false), // IODO
    ... getHorseFirstDistanceID(false), // TODO
    ... getHorseChangeToTurfID(false), // TODO
    ... getHorseChangeToDirtID(false), // TODO
    ... getHorseClassUpID(false), // TODO
    ... getHorseAfterRestID(false), // TODO
    ... getHorseBracketID(entry.bracketId, entry.horseId),
    ... getHorseAgeID(entry.horseAge),
  ];
}
