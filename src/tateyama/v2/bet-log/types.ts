/**
 * 購入タイプ
 */
 export const BetType = {
  // 単勝複勝タイプ
  BetWinShow: "Win A / Place A",

  // 複勝タイプ
  // BetShow: "Place A,B,C",

  // 複勝 高配当タイプ
  // BetShowBenefit: "Place A,B,X",

  // 馬連ワイドタイプ
  QuinellaPlace: "Quinella A - B / QuinellaPlace A - B,C",

  // 馬連ワイド 高配当タイプ
  QuinellaPlaceBenefit: "Quinella A - B / QuinellaPlace A - B,X",

  // 馬連 馬単
  QuinellaExacta: "Quinella A - B / Exacta A - B,C",

  // 馬単 流し
  // Exacta: "Exacta A - B,C,D,X",

  // 三連複パターン1 本命・対抗流し
  Trio1: "Trio A = B,C,D,X / Trio B = A,C,D,X",

  // 三連複パターン2 1頭軸流し
  Trio2: "Trio A = B,C,D,X",

  // 3連単パターン2 2頭-4頭-5頭
  Trifecta1: "Trifecta A,B > A,B,C,X > A,B,C,D,X",

  // 3連単パターン3 3頭-3頭-5頭
  Trifecta2: "Trifecta A,B,X > A,B,X > A,B,C,D,X",

  // 3連単パターン1 2頭-2頭-3頭 + 1頭-4頭-4頭
  // Trifecta3: "Trifecta A,B > A,B > C,D,X / Trifecta A > B,C,D,X",
}

export type BetType = typeof BetType[keyof typeof BetType];
