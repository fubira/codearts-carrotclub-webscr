/**
 * 学習データセット定義
 */

export interface Dataset {
  /** Race Info */
  infoDate: string,
  infoCourseId: number,
  infoCourse: string,
  infoRaceNo: number,
  infoRaceTitle: string,
  infoBracketId: number,
  infoHorseId: number,

  /** Data */
  outputScratch: number,
  outputTimeRate: number,
  outputTimeDiffSec: number,
  // inputHorseIsMale: number,
  // inputHorseIsFemale: number,
  // inputHorseWeightDiff: number,
  // inputHorseWinPercent: number,
  inputHorseWinRank: number,
  inputHorseHandicap: number,
  /*
  inputPresentTrainingAccel3f: number,
  inputPresentTrainingAccel2f: number,
  inputPresentTrainingAccel1f: number,
  */
  // inputPresentTrainingDiff3f: number,
  inputPresentTrainingAccel: number,
  // inputFastestTrainingDiff3f: number,
  inputFastestTrainingAccel: number,
  // inputTrainingAccel: number,
  /*
  inputPresentTrainingDiff2f: number,
  inputPresentTrainingDiff1f: number,
  */
}
