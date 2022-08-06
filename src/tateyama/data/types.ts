export type HorseSex = '牡' | '牝' | 'セン';

export type CourseType = '芝' | 'ダート';

export type CourseDirection = '左' | '右';

export type CourseWeather = '晴' | '曇' | '雨' | '小雨' | '雪' | '小雪';

export type CourseCondition = '良' | '稍重' | '重' | '不良';

/**
 * DB保存データ形定義
 */
export interface Race {
  // データベースID [date]:[courseID]:[raceNo]
  _id: string;

  // レース日時
  date: string;

  // レース番号
  raceNo: number;

  // レース名
  raceTitle: string;
  
  // コース情報
  course: Course;

  // 登録馬情報
  entries: Entry[];

  // レース結果
  result: Result;
}

/**
 * コース情報
 */
export interface Course {
  // ダート/芝
  type: CourseType;

  // 競馬場ID
  id: number;

  // 競馬場名
  name: string;

  // 距離
  distance: number;
  
  // 右周り左回り
  direction: CourseDirection;

  // 天候
  weather: CourseWeather;

  // 馬場状態
  condition: CourseCondition;

  // 付随情報
  option: string;
}

/**
 * 直近の成績
 */
export interface ResentRace {
  // 日付
  date: string

  detail: ResultDetail;

  course: Course;
}

export interface Detail {
  // 枠番
  bracketId: number;

  // 馬番
  horseId: number;

  // トータル戦績 [1着, 2着, 3着, その他]
  orderRecord?: number[];

  // 直近3戦の成績
  resent?: ResentRace[];
}

/**
 * レース登録馬データ
 */
export interface Entry {
  // 枠番
  bracketId: number;

  // 馬番
  horseId: number;

  // 馬名
  horseName: string;

  // 性別
  horseSex: HorseSex;

  // 年齢
  horseAge: number;
  
  // ジョッキー
  jockyName: string;

  // ハンデ
  handicap: number;

  // 馬体重
  horseWeight: number;

  // 馬体重増減
  horseWeightDiff: number;

  // 人気
  odds: number;

  // 人気順
  oddsRank: number;
  
  // 過去の戦績
  detail?: Detail;

  // 血統
  pedigree?: string;

  // 調教
  training?: Training;
}

/**
 * 調教データ
 */
 export interface Training {
  // 枠番
  bracketId: number;

  // 馬番
  horseId: number;

  // 馬名
  horseName: string;

  // コメント
  comment: string;

  // 調子
  status: string;

  // 調教ログ
  logs: TrainingLog[];
}

/**
 * 調教履歴データ
 */
export interface TrainingLog {
  // 日時 YYYYMMDD
  date: string,

  // 前走直前追切
  previous?: boolean,

  // 調教コース
  course: string,

  // 調教コース状態
  condition: string,

  // コメント
  comment: string,

  // 調教回数
  count: number,

  // 走行位置
  position: string,

  // ラップタイム
  lap: TrainingLap[],

  // 併せ相手
  partner?: string,
}

/**
 * 調教タイム・区間タイム
 */
export interface TrainingLap {
  lap?: number;
  gap?: number;
  accel?: number;
}

/**
 * レース結果
 */
export interface Result {
  // 着順
  detail: ResultDetail[];

  // 払戻
  refund: ResultRefund;
}

/**
 * レース結果詳細
 */
export interface ResultDetail {
  // 馬番号
  horseId: number;

  // 着順
  order: number;

  // 道中のポジション
  period: ResultPeriod[];

  // タイム (s)
  timeSec: number;

  // 勝ち馬とのタイム差 (s)
  timeDiffSec: number;

  // 上り3F (s)
  last3fSec: number;
}

/**
 * レース結果詳細 道中ポジション
 */
 export interface ResultPeriod {
  position: number;
  
  disadvantage?: boolean;
}

/**
 * レース払戻
 */
export interface ResultRefund {
  // 単勝
  win?: {
    horseId: number;
    amount: number;
  }[],

  // 複勝
  place?: {
    horseId: number;
    amount: number;
  }[],

  // 馬連
  quinella?: {
    horseId: number[];
    amount: number;
  }[],

  // 馬単
  exacta?: {
    horseId: number[];
    amount: number;
  }[],

  // ワイド
  quinellaPlace?: {
    horseId: number[];
    amount: number;
  }[],

  // 三連複
  trio?: {
    horseId: number[];
    amount: number;
  }[],

  // 三連単
  trifecta?: {
    horseId: number[];
    amount: number;
  }[],
}
