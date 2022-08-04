/**
 * 比較対象
 */

export const ComparableType = {
  // 該当項目を前走の値と比較
  SelfPrev1R: "selfprev1r",

  // 該当項目を過去2Rの平均と比較
  SelfPrev2RAvg: "selfprev2r/avg",
  // 該当項目を過去2Rの最大と比較
  SelfPrev2RMax: "selfprev2r/max",
  // 該当項目を過去2Rの最小と比較
  SelfPrev2RMin: "selfprev2r/min",

  // 該当項目を過去3Rの平均と比較
  SelfPrev3RAvg: "selfprev3r/avg",
  // 該当項目を過去3Rの最大と比較
  SelfPrev3RMax: "selfprev3r/max",
  // 該当項目を過去3Rの最小と比較
  SelfPrev3RMin: "selfprev3r/min",

  // 当該レースの出走馬の平均
  AllCurrentAvg: "allcurrent/avg",
  // 当該レースの出走馬の最大
  AllCurrentMax: "allcurrent/max",
  // 当該レースの出走馬の最小
  AllCurrentMin: "allcurrent/min",

  // 全出走馬の過去1Rの平均
  AllPrevAvg: "allprev/avg",
  // 全出走馬の過去1Rの最大
  AllPrevMax: "allprev/max",
  // 全出走馬の過去1Rの最小
  AllPrevMin: "allprev/min",

  // 全出走馬の過去2Rの平均
  AllPrev2RAvg: "allprev2r/avg",
  // 全出走馬の過去2Rの最大
  AllPrev2RMax: "allprev2r/max",
  // 全出走馬の過去2Rの最小
  AllPrev2RMin: "allprev2r/min",

  // 全出走馬の過去3Rの平均
  AllPrev3RAvg: "allprev3r/avg",
  // 全出走馬の過去3Rの最大
  AllPrev3RMax: "allprev3r/max",
  // 全出走馬の過去3Rの最小
  AllPrev3RMin: "allprev2r/min",
}

export type ComparableType = typeof ComparableType[keyof typeof ComparableType];
