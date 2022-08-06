import { AI, Data } from 'tateyama';

function getCoursePlaceID(courseName: string): AI.StateFactorID[] {
  switch (courseName) {
    case "東京":
      return [AI.StateFactorID.CourePlaceTokyo];
    case "中山":
      return [AI.StateFactorID.CourePlaceNakayama];
    case "阪神":
      return [AI.StateFactorID.CourePlaceHanshin];
    case "京都":
      return [AI.StateFactorID.CourePlaceKyoto];
    case "中京":
      return [AI.StateFactorID.CourePlaceChukyo];
    case "小倉":
      return [AI.StateFactorID.CourePlaceKokura];
    case "福島":
      return [AI.StateFactorID.CourePlaceFukushima];
    case "新潟":
      return [AI.StateFactorID.CourePlaceNiigata];
    case "札幌":
      return [AI.StateFactorID.CourePlaceSapporo];
    case "函館":
      return [AI.StateFactorID.CourePlaceHakodate];
    default:
      return [AI.StateFactorID.CourePlaceLocal];
  }
}

export function getCourseConditionID(courseCondition: string): AI.StateFactorID[] {
  if (courseCondition === "良") {
    return [
      AI.StateFactorID.CourseConditionFirm
    ];
  }
  if (courseCondition === "稍重") {
    return [
      AI.StateFactorID.CourseConditionGood,
      AI.StateFactorID.CourseConditionWorthThanGood
    ];
  }
  if (courseCondition === "重") {
    return [
      AI.StateFactorID.CourseConditionWorthThanGood,
      AI.StateFactorID.CourseConditionWorthThanYielding
    ];
  }
  if (courseCondition === "不良") {
    return [
      AI.StateFactorID.CourseConditionWorthThanGood,
      AI.StateFactorID.CourseConditionWorthThanYielding,
      AI.StateFactorID.CourseConditionWorthThanHeavy
    ];
  }
  return [];
}

function getCourseDistanceID(courseDistance: number): AI.StateFactorID[] {
  if (courseDistance <= 1300) {
    return [AI.StateFactorID.CourseDistanceSprint];
  } else if (courseDistance < 1900) {
    return [AI.StateFactorID.CourseDistanceMile];
  } else if (courseDistance <= 2100) {
    return [AI.StateFactorID.CourseDistanceIntermediate];
  } else if (courseDistance <= 2700) {
    return [AI.StateFactorID.CourseDistanceLong];
  } else {
    return [AI.StateFactorID.CourseDistanceExtended];
  }
}

function getCourseTypeID(courseType: string): AI.StateFactorID[] {
  if (courseType.startsWith('芝')) {
    return [AI.StateFactorID.CourseTypeTurf];
  }
  if (courseType.startsWith('ダ')) {
    return [AI.StateFactorID.CourseTypeDirt];
  }
  return [AI.StateFactorID.CourseTypeOthers];
}

function getCourseWeatherID(courseWeather: string): AI.StateFactorID[] {
  if (courseWeather.includes('雨')) {
    return [AI.StateFactorID.CourseWeatherRain];
  }
  if (courseWeather.includes('雪')) {
    return [AI.StateFactorID.CourseWeatherSnow];
  }

  return [AI.StateFactorID.CourseWeatherFine];
}

function getCourseDirectionID(courseDirection: string): AI.StateFactorID[] {
  return (courseDirection === '右') 
    ? [AI.StateFactorID.CourseDirectionRight]
    : [AI.StateFactorID.CourseDirectionLeft];
}

function getRaceCategoryID(raceCategory: string): AI.StateFactorID[] {
  if (raceCategory?.startsWith('未勝利') || raceCategory?.startsWith('新馬')) {
    return [AI.StateFactorID.RaceCategoryMaiden];
  }
  if (raceCategory?.startsWith('1勝')) {
    return [AI.StateFactorID.RaceCategoryWin1];
  }
  if (raceCategory?.startsWith('2勝')) {
    return [AI.StateFactorID.RaceCategoryWin2];
  }
  if (raceCategory?.startsWith('3勝')) {
    return [AI.StateFactorID.RaceCategoryWin3];
  }
  if (raceCategory?.startsWith('オープン')) {
    return [AI.StateFactorID.RaceCategoryOpen];
  }

  return [];
}

function getRaceEntryNumberID(raceEntryNumber: number): AI.StateFactorID[] {
  if (raceEntryNumber <= 10) {
    return [AI.StateFactorID.RaceEntryNumberSmall];
  }
  if (raceEntryNumber >= 14) {
    return [AI.StateFactorID.RaceEntryNumberLarge];
  }

  return [];
}

function getHorseSexID(horseSex: string): AI.StateFactorID[] {
  switch (horseSex) {
    case '牡':
    case 'オス':
    case 'セン':
      return [AI.StateFactorID.HorseMale];
    case '牝':
      return [AI.StateFactorID.HorseFemale];
  }
  return [];
}

function getHorseJockyChangeID(isJockyChange: boolean): AI.StateFactorID[] {
  if (isJockyChange) {
    return [AI.StateFactorID.HorseJockeyChange];
  }
  return [];
}

function getHorseReturnFromOverseaID(isReturnFromOversea: boolean): AI.StateFactorID[] {
  if (isReturnFromOversea) {
    return [AI.StateFactorID.HorseReturnFromLocal];
  }
  return [];
}

function getHorseReturnFromLocalID(isReturnFromLocal: boolean): AI.StateFactorID[] {
  if (isReturnFromLocal) {
    return [AI.StateFactorID.HorseReturnFromLocal];
  }
  return [];
}

function getHorseFirstCourseID(isFirstCourse: boolean): AI.StateFactorID[] {
  if (isFirstCourse) {
    return [AI.StateFactorID.HorseFirstCourse];
  }
  return [];
}

function getHorseFirstTurfID(isFirstTurf: boolean): AI.StateFactorID[] {
  if (isFirstTurf) {
    return [AI.StateFactorID.HorseFirstTurf];
  }
  return [];
}

function getHorseFirstDirtID(isFirstDirt: boolean): AI.StateFactorID[] {
  if (isFirstDirt) {
    return [AI.StateFactorID.HorseFirstDirt];
  }
  return [];
}

function getHorseFirstDistanceID(isFirstDistance: boolean): AI.StateFactorID[] {
  if (isFirstDistance) {
    return [AI.StateFactorID.HorseFirstDistance];
  }
  return [];
}

function getHorseChangeToTurfID(isChangeToTurf: boolean): AI.StateFactorID[] {
  if (isChangeToTurf) {
    return [AI.StateFactorID.HorseChangeToTurf];
  }
  return [];
}

function getHorseChangeToDirtID(isChangeToDirt: boolean): AI.StateFactorID[] {
  if (isChangeToDirt) {
    return [AI.StateFactorID.HorseChangeToDirt];
  }
  return [];
}

function getHorseClassUpID(isClassUp: boolean): AI.StateFactorID[] {
  if (isClassUp) {
    return [AI.StateFactorID.HorseClassUp];
  }
  return [];
}

function getHorseAfterRestID(isAfterRest: boolean): AI.StateFactorID[] {
  if (isAfterRest) {
    return [AI.StateFactorID.HorseAfterRest];
  }
  return [];
}

function getHorseBracketID(bracketId: number, horseId: number): AI.StateFactorID[] {
  const result: AI.StateFactorID[] = [];
  if (horseId % 2 === 0) {
    result.push(AI.StateFactorID.HorseGateEven);
  } else {
    result.push(AI.StateFactorID.HorseGateOdd);
  }

  if (horseId <= 4) {
    result.push(AI.StateFactorID.HorseBracketInner);
  }
  if (horseId >= 12) {
    result.push(AI.StateFactorID.HorseBracketOuter);
  }

  switch (bracketId) {
    case 1: result.push(AI.StateFactorID.HorseBracket1); break;
    case 2: result.push(AI.StateFactorID.HorseBracket2); break;
    case 3: result.push(AI.StateFactorID.HorseBracket3); break;
    case 4: result.push(AI.StateFactorID.HorseBracket4); break;
    case 5: result.push(AI.StateFactorID.HorseBracket5); break;
    case 6: result.push(AI.StateFactorID.HorseBracket6); break;
    case 7: result.push(AI.StateFactorID.HorseBracket7); break;
    case 8: result.push(AI.StateFactorID.HorseBracket8); break;
  }
  
  return result;
}

function getHorseAgeID(horseAge: number): AI.StateFactorID[] {
  if (horseAge <= 2) {
    return [AI.StateFactorID.HorseAge2];
  }
  if (horseAge === 3) {
    return [AI.StateFactorID.HorseAge3];
  }
  if (horseAge === 4) {
    return [AI.StateFactorID.HorseAge4];
  }
  if (horseAge >= 5) {
    return [AI.StateFactorID.HorseAgeOver5];
  }
  return [];
}

export function getRaceStateFactor(race: Data.Race) {
  return [
    ... getCoursePlaceID(race.course.name),
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
