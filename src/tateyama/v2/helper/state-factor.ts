import * as Tateyama from 'tateyama/v2';
import * as TateyamaV1 from 'tateyama/v1/types/database';

function getCoursePlaceID(courseName: string): Tateyama.StateFactorID[] {
  switch (courseName) {
    case "東京":
      return [Tateyama.StateFactorID.CourePlaceTokyo];
    case "中山":
      return [Tateyama.StateFactorID.CourePlaceNakayama];
    case "阪神":
      return [Tateyama.StateFactorID.CourePlaceHanshin];
    case "京都":
      return [Tateyama.StateFactorID.CourePlaceKyoto];
    case "中京":
      return [Tateyama.StateFactorID.CourePlaceChukyo];
    case "小倉":
      return [Tateyama.StateFactorID.CourePlaceKokura];
    case "福島":
      return [Tateyama.StateFactorID.CourePlaceFukushima];
    case "新潟":
      return [Tateyama.StateFactorID.CourePlaceNiigata];
    case "札幌":
      return [Tateyama.StateFactorID.CourePlaceSapporo];
    case "函館":
      return [Tateyama.StateFactorID.CourePlaceHakodate];
    default:
      return [Tateyama.StateFactorID.CourePlaceLocal];
  }
}

export function getCourseConditionID(courseCondition: string): Tateyama.StateFactorID[] {
  if (courseCondition === "良") {
    return [
      Tateyama.StateFactorID.CourseConditionFirm
    ];
  }
  if (courseCondition === "稍重") {
    return [
      Tateyama.StateFactorID.CourseConditionGood,
      Tateyama.StateFactorID.CourseConditionWorthThanGood
    ];
  }
  if (courseCondition === "重") {
    return [
      Tateyama.StateFactorID.CourseConditionWorthThanGood,
      Tateyama.StateFactorID.CourseConditionWorthThanYielding
    ];
  }
  if (courseCondition === "不良") {
    return [
      Tateyama.StateFactorID.CourseConditionWorthThanGood,
      Tateyama.StateFactorID.CourseConditionWorthThanYielding,
      Tateyama.StateFactorID.CourseConditionWorthThanHeavy
    ];
  }
}

function getCourseDistanceID(courseDistance: number): Tateyama.StateFactorID[] {
  if (courseDistance <= 1300) {
    return [Tateyama.StateFactorID.CourseDistanceSprint];
  } else if (courseDistance < 1900) {
    return [Tateyama.StateFactorID.CourseDistanceMile];
  } else if (courseDistance <= 2100) {
    return [Tateyama.StateFactorID.CourseDistanceIntermediate];
  } else if (courseDistance <= 2700) {
    return [Tateyama.StateFactorID.CourseDistanceLong];
  } else {
    return [Tateyama.StateFactorID.CourseDistanceExtended];
  }
}

function getCourseTypeID(courseType: string): Tateyama.StateFactorID[] {
  if (courseType.startsWith('芝')) {
    return [Tateyama.StateFactorID.CourseTypeTurf];
  }
  if (courseType.startsWith('ダ')) {
    return [Tateyama.StateFactorID.CourseTypeDirt];
  }
  return [Tateyama.StateFactorID.CourseTypeOthers];
}

function getCourseWeatherID(courseWeather: string): Tateyama.StateFactorID[] {
  if (courseWeather.includes('雨')) {
    return [Tateyama.StateFactorID.CourseWeatherRain];
  }
  if (courseWeather.includes('雪')) {
    return [Tateyama.StateFactorID.CourseWeatherSnow];
  }

  return [Tateyama.StateFactorID.CourseWeatherFine];
}

function getCourseDirectionID(courseDirection: string): Tateyama.StateFactorID[] {
  return (courseDirection === '右') 
    ? [Tateyama.StateFactorID.CourseDirectionRight]
    : [Tateyama.StateFactorID.CourseDirectionLeft];
}

export function getRaceCategoryID(raceCategory: string): Tateyama.StateFactorID[] {
  if (raceCategory.startsWith('未勝利') || raceCategory.startsWith('新馬')) {
    return [Tateyama.StateFactorID.RaceCategoryMaiden];
  }
  if (raceCategory.startsWith('1勝')) {
    return [Tateyama.StateFactorID.RaceCategoryWin1];
  }
  if (raceCategory.startsWith('2勝')) {
    return [Tateyama.StateFactorID.RaceCategoryWin2];
  }
  if (raceCategory.startsWith('3勝')) {
    return [Tateyama.StateFactorID.RaceCategoryWin3];
  }
  if (raceCategory.startsWith('オープン')) {
    return [Tateyama.StateFactorID.RaceCategoryOpen];
  }

  return [];
}

function getRaceEntryNumberID(raceEntryNumber: number): Tateyama.StateFactorID[] {
  if (raceEntryNumber <= 10) {
    return [Tateyama.StateFactorID.RaceEntryNumberSmall];
  }
  if (raceEntryNumber >= 14) {
    return [Tateyama.StateFactorID.RaceEntryNumberLarge];
  }

  return [];
}

function getHorseSexID(horseSex: string): Tateyama.StateFactorID[] {
  switch (horseSex) {
    case '牡':
    case 'オス':
    case 'セン':
      return [Tateyama.StateFactorID.HorseMale];
    case '牝':
      return [Tateyama.StateFactorID.HorseFemale];
  }
  return [];
}

function getHorseJockyChangeID(isJockyChange: boolean): Tateyama.StateFactorID[] {
  if (isJockyChange) {
    return [Tateyama.StateFactorID.HorseJockeyChange];
  }
  return [];
}

function getHorseReturnFromOverseaID(isReturnFromOversea: boolean): Tateyama.StateFactorID[] {
  if (isReturnFromOversea) {
    return [Tateyama.StateFactorID.HorseReturnFromLocal];
  }
  return [];
}

function getHorseReturnFromLocalID(isReturnFromLocal: boolean): Tateyama.StateFactorID[] {
  if (isReturnFromLocal) {
    return [Tateyama.StateFactorID.HorseReturnFromLocal];
  }
  return [];
}

function getHorseFirstCourseID(isFirstCourse: boolean): Tateyama.StateFactorID[] {
  if (isFirstCourse) {
    return [Tateyama.StateFactorID.HorseFirstCourse];
  }
  return [];
}

function getHorseFirstTurfID(isFirstTurf: boolean): Tateyama.StateFactorID[] {
  if (isFirstTurf) {
    return [Tateyama.StateFactorID.HorseFirstTurf];
  }
  return [];
}

function getHorseFirstDirtID(isFirstDirt: boolean): Tateyama.StateFactorID[] {
  if (isFirstDirt) {
    return [Tateyama.StateFactorID.HorseFirstDirt];
  }
  return [];
}

function getHorseFirstDistanceID(isFirstDistance: boolean): Tateyama.StateFactorID[] {
  if (isFirstDistance) {
    return [Tateyama.StateFactorID.HorseFirstDistance];
  }
  return [];
}

function getHorseChangeToTurfID(isChangeToTurf: boolean): Tateyama.StateFactorID[] {
  if (isChangeToTurf) {
    return [Tateyama.StateFactorID.HorseChangeToTurf];
  }
  return [];
}

function getHorseChangeToDirtID(isChangeToDirt: boolean): Tateyama.StateFactorID[] {
  if (isChangeToDirt) {
    return [Tateyama.StateFactorID.HorseChangeToDirt];
  }
  return [];
}

function getHorseClassUpID(isClassUp: boolean): Tateyama.StateFactorID[] {
  if (isClassUp) {
    return [Tateyama.StateFactorID.HorseClassUp];
  }
  return [];
}

function getHorseAfterRestID(isAfterRest: boolean): Tateyama.StateFactorID[] {
  if (isAfterRest) {
    return [Tateyama.StateFactorID.HorseAfterRest];
  }
  return [];
}

function getHorseBracketID(bracketId: number, horseId: number): Tateyama.StateFactorID[] {
  const result: Tateyama.StateFactorID[] = [];
  if (horseId % 2 === 0) {
    result.push(Tateyama.StateFactorID.HorseGateEven);
  } else {
    result.push(Tateyama.StateFactorID.HorseGateOdd);
  }

  if (horseId <= 4) {
    result.push(Tateyama.StateFactorID.HorseBracketInner);
  }
  if (horseId >= 12) {
    result.push(Tateyama.StateFactorID.HorseBracketOuter);
  }

  switch (bracketId) {
    case 1: result.push(Tateyama.StateFactorID.HorseBracket1); break;
    case 2: result.push(Tateyama.StateFactorID.HorseBracket2); break;
    case 3: result.push(Tateyama.StateFactorID.HorseBracket3); break;
    case 4: result.push(Tateyama.StateFactorID.HorseBracket4); break;
    case 5: result.push(Tateyama.StateFactorID.HorseBracket5); break;
    case 6: result.push(Tateyama.StateFactorID.HorseBracket6); break;
    case 7: result.push(Tateyama.StateFactorID.HorseBracket7); break;
    case 8: result.push(Tateyama.StateFactorID.HorseBracket8); break;
  }
  
  return result;
}

function getHorseAgeID(horseAge: number): Tateyama.StateFactorID[] {
  if (horseAge <= 2) {
    return [Tateyama.StateFactorID.HorseAge2];
  }
  if (horseAge === 3) {
    return [Tateyama.StateFactorID.HorseAge3];
  }
  if (horseAge === 4) {
    return [Tateyama.StateFactorID.HorseAge4];
  }
  if (horseAge >= 5) {
    return [Tateyama.StateFactorID.HorseAgeOver5];
  }
  return [];
}

export function getRaceStateFactor(race: TateyamaV1.DBRace) {
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

export function getHorseStateFactor(entry: TateyamaV1.DBEntry) {
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
