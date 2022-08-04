/**
 * 出走馬の数的要素の定義
 */

export const TrainingValueFactorID = {
  TrainingFastestLap1f: "training/fastestlap1f",
  TrainingFastestLap3f: "training/fastestlap3f",
  TrainingFastestLap4f: "training/fastestlap4f",
  TrainingFastestGap1f: "training/fastestgap1f",
  TrainingFastestGap3f: "training/fastestgap3f",
  TrainingFastestGap4f: "training/fastestgap4f",
  TrainingFastestAccel1f: "training/fastestaccel1f",
  TrainingFastestAccel3f1f: "training/fastestaccel3f1f",
  TrainingFastestAccel4f1f: "training/fastestaccel4f1f",

  TrainingPresentLap1f: "training/presentlap1f",
  TrainingPresentLap3f: "training/presentlap3f",
  TrainingPresentLap4f: "training/presentlap4f",
  TrainingPresentGap1f: "training/presentgap1f",
  TrainingPresentGap3f: "training/presentgap3f",
  TrainingPresentGap4f: "training/presentgap4f",
  TrainingPresentAccel1f: "training/presentaccel1f",
  TrainingPresentAccel3f1f: "training/presentaccel3f1f",
  TrainingPresentAccel4f1f: "training/presentaccel4f1f",

  TrainingLastLap1f: "training/lastlap1f",
  TrainingLastLap3f: "training/lastlap3f",
  TrainingLastLap4f: "training/lastlap4f",
  TrainingLastGap1f: "training/lastgap1f",
  TrainingLastGap3f: "training/lastgap3f",
  TrainingLastGap4f: "training/lastgap4f",
  TrainingLastAccel1f: "training/lastaccel1f",
  TrainingLastAccel3f1f: "training/lastaccel3f1f",
  TrainingLastAccel4f1f: "training/lastaccel4f1f",
}

export type TrainingValueFactorID = typeof TrainingValueFactorID[keyof typeof TrainingValueFactorID];
