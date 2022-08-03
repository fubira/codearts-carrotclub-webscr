/**
 * 比較対象
 */
const ComparableType = {
  // 前走の同項目
  SelfPrev1R: "selfprev1r",

  // 過去2Rの平均
  SelfPrev2RAvg: "selfprev2r/avg",
  // 過去2Rの最大
  SelfPrev2RMax: "selfprev2r/max",
  // 過去2Rの最小
  SelfPrev2RMin: "selfprev2r/min",

  // 過去3Rの平均
  SelfPrev3RAvg: "selfprev3r/avg",
  // 過去3Rの最大
  SelfPrev3RMax: "selfprev3r/max",
  // 過去3Rの最小
  SelfPrev3RMin: "selfprev3r/min",

  // 当該レースの出走馬平均
  AllCurrentAvg: "allcurrent/avg",
  // 当該レースの出走馬最大
  AllCurrentMax: "allcurrent/max",
  // 当該レースの出走馬最小
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

type ComparableType = typeof ComparableType[keyof typeof ComparableType];


export default ComparableType;
