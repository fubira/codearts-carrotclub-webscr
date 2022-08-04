/**
 * 購入タイプ
 */
 export const BetType = {
  // 単勝複勝タイプ
  BetWinShow: "bet/win-show",

  // 複勝タイプ
  BetShow: "bet/only-show",

  // 複勝 高配当タイプ
  BetShowBenefit: "bet/show-benefit",

  // 馬連ワイドタイプ
  QuinellaPlace: "bet/quinella-place",

  // 馬連ワイド 高配当タイプ
  QuinellaPlaceBenefit: "bet/quinella-place-benefit",

  // 馬連 馬単
  QuinellaExacta: "bet/quinella-exacta",

  // 馬単 流し
  Exacta: "bet/exacta",

  // 三連複パターン1 本命・対抗流し
  Trio1: "bet/trio1",

  // 三連複パターン2 2頭流し
  Trio2: "bet/trio2",

  // 3連単パターン1 2頭-2頭-3頭 + 1頭-4頭-4頭
  Trifecta1: "bet/trifecta1",

  // 3連単パターン2 2頭-4頭-5頭
  Trifecta2: "bet/trifecta2",

  // 3連単パターン3 3頭-3頭-5頭
  Trifecta3: "bet/trifecta3",
}

export type BetType = typeof BetType[keyof typeof BetType];
