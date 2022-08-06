/**
 * 出走馬の数的要素の定義
 */
 export const ValueFactorID = {
  EntryHandicap: "entry/handicap",
  EntryOdds: "entry/odds",
  EntryOddsWinRate: "entry/oddswinrate",
  EntryOddsRank: "entry/oddsrank",
  EntryHeavy: "entry/heavy",
  EntryHeavyDiff: "entry/heavydiff",
  EntryResultRuns: "entry/resultruns",
  EntryResultWins: "entry/resultwins",
  EntryResultTopTwo: "entry/toptwo",
  EntryResultTopThree: "entry/topthree",
}

export type ValueFactorID = typeof ValueFactorID[keyof typeof ValueFactorID];
