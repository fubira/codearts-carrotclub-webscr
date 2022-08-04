/**
 * レースに対する状態要素
 */

const RaceStateFactorID = {
  // 競馬場
  CourePlaceTokyo: "courseplace/tokyo",
  CourePlaceNakayama: "courseplace/nakayama",
  CourePlaceHanshin: "courseplace/hanshin",
  CourePlaceKyoto: "courseplace/kyoto",
  CourePlaceFukushima: "courseplace/fukushima",
  CourePlaceKokura: "courseplace/kokura",
  CourePlaceNiigata: "courseplace/niigata",
  CourePlaceChukyo: "courseplace/chukyo",
  CourePlaceHakodate: "courseplace/hakodate",
  CourePlaceSapporo: "courseplace/sapporo",
  CourePlaceLocal: "courseplace/local",
  CourePlaceForeign: "courseplace/foreign",
  CourePlaceOthers: "courseplace/others",

  // コースタイプ
  CourseTypeTurf: "coursetype/turf",
  CourseTypeDirt: "coursetype/dirt",
  CourseTypeOthers: "coursetype/others",

  // コース距離タイプ
  CourseDistanceSprint: "coursedistance/sprint",
  CourseDistanceMile: "coursedistance/mile",
  CourseDistanceIntermediate: "coursedistance/intermediate",
  CourseDistanceLong: "coursedistance/long",
  CourseDistanceExtended: "coursedistance/extended",

  // コース状態タイプ
  CourseConditionFirm: "coursecondition/firm",                           // 良
  CourseConditionGood: "coursecondition/good",                           // 稍重
  CourseConditionWorthThanGood: "coursecondition/worthgood",             // 稍重、重、不良
  CourseConditionWorthThanYielding: "coursecondition/worthyielding",     // 重、不良
  CourseConditionWorthThanHeavy: "coursecondition/worthheavy",           // 不良

  // コース天候タイプ
  CourseWeatherFine: "courseweather/fine", 
  CourseWeatherRain: "courseweather/rain", 
  CourseWeatherSnow: "courseweather/snow", 

  // コース方向
  CourseDirectionRight: "coursedirection/right",
  CourseDirectionLeft: "coursedirection/left",

  // レース カテゴリ
  RaceCategoryMaiden: "racecategory/maiden",
  RaceCategoryWin1: "racecategory/win1",
  RaceCategoryWin2: "racecategory/win2",
  RaceCategoryWin3: "racecategory/win3",
  RaceCategoryOpen: "racecategory/open",

  // レース 小頭数/多頭数
  RaceEntryNumberSmall: "raceentrynumber/small",
  RaceEntryNumberLarge: "raceentrynumber/large",
}

/**
 * レースごとの馬に対する状態要素
 */
 const HorseStateFactorID = {
  // 馬 性別
  HorseMale: "horse/male",
  HorseFemale: "horse/female",

  // 馬 状態
  HorseJockeyChange: "horse/jockeychange",              // 乗り変わり
  HorseReturnFromOversea: "horse/returnfromoversea",    // 海外帰り
  HorseReturnFromLocal: "horse/returnfromlocal",        // 地方帰り
  HorseFirstCourse: "horse/firstcourse",                // 初コース
  HorseFirstTurf: "horse/firstturf",                    // 初芝
  HorseFirstDirt: "horse/firstdirt",                    // 初ダート
  HorseFirstDistance: "horse/firstdistance",            // 初距離
  HorseChangeToTurf: "horse/changetoturf",              // 芝替わり
  HorseChangeToDirt: "horse/changetodirt",              // ダート替わり
  HorseClassUp: "horse/classup",                        // 昇級戦
  HorseAfterRest: "horse/afterrest",                    // 休養明け
  
  // 馬 枠番
  HorseBracket1: "horse/bracket1",
  HorseBracket2: "horse/bracket2",
  HorseBracket3: "horse/bracket3",
  HorseBracket4: "horse/bracket4",
  HorseBracket5: "horse/bracket5",
  HorseBracket6: "horse/bracket6",
  HorseBracket7: "horse/bracket7",
  HorseBracket8: "horse/bracket8",
  HorseBracketInner: "horse/bracketinner",
  HorseBracketOuter: "horse/bracketouter",
  HorseGateOdd: "horse/gateodd",
  HorseGateEven: "horse/gateeven",

  HorseAge2: "horse/age2",
  HorseAge3: "horse/age3",
  HorseAge4: "horse/age4",
  HorseAgeOver5: "horse/ageover5",
}

export const StateFactorID = {
  ...RaceStateFactorID,
  ...HorseStateFactorID,
};
export type StateFactorID = typeof StateFactorID[keyof typeof StateFactorID];
