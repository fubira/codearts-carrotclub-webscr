/**
 * 予想内容をもとに馬券を買った場合の成績ログ
 */
export interface Log {
  raceId: string,
  bet: BetResult[],
}

/**
 * 賭けた結果のまとめ
 */
export interface BetResult {
  betStyle: string,
  descriptions: string[],
  amount: number,
  result: number,
}

/**
 * 買い方ごとの馬券成績統計
 */
export interface Stats {
  [key: string]: {
    result: number,
    amount: number,
    resultRate: number,
    hitRace: number,
    betRace: number,
    hitRate: number,
  }
}

/**
 * 購入タイプ
 */
 export const BetStyle = {
  // 単勝複勝タイプ
  WinShowA: "Win A / Place A",

  // 複勝1
  ShowABC: "Place A,B,C",

  // 複勝2
  ShowABX: "Place A,B,X",

  // 馬連ワイド
  QuinellaPlaceABC: "Quinella A - B / QuinellaPlace A - B,C",

  // 馬連ワイド 高配当タイプ
  QuinellaPlaceABX: "Quinella A - B / QuinellaPlace A - B,X",

  // 馬連 馬単
  QuinellaExactaABC: "Quinella A - B / Exacta A - B,C",

  // 馬単 流し
  ExactaAtoAll: "Exacta A - B,C,D,X",

  // 三連複パターン1 本命・対抗流し
  TrioAtoAll: "Trio A = B,C,D,X",

  // 三連複パターン2 1頭軸流し
  TrioABtoAll: "Trio A = B,C,D,X / Trio B = A,C,D,X",

  // 3連単パターン2 2頭-4頭-5頭
  TrifectaAB: "Trifecta A,B > A,B,C,X > A,B,C,D,X",

  // 3連単パターン3 3頭-3頭-5頭
  TrifectaABX: "Trifecta A,B,X > A,B,X > A,B,C,D,X",
}

export type BetStyle = typeof BetStyle[keyof typeof BetStyle];
