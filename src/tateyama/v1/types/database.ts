export type HorseSex = '牡' | '牝' | 'セン';
export type CourseType = '芝' | 'ダート';
export type CourseDirection = '左' | '右';
export type CourseWeather = '晴' | '曇' | '雨' | '小雨' | '雪' | '小雪';
export type CourseCondition = '良' | '稍重' | '重' | '不良';

/**
 * DB保存データ形定義
 */
export interface DBRace {
  // データベースID
  // [date]:[courseID]:[raceNo]
  _id: string;

  // レース日時
  date: string;

  // 競馬場ID
  courseId: number;

  // 競馬場名
  courseName: string;

  // レース番号
  raceNo: number;

  // レース名
  raceTitle: string;
  
  // コース情報
  course: DBCourse;

  // 登録馬情報
  entries: DBEntry[];

  // レース結果
  result: DBResult;
}

/**
 * コース情報
 */
export interface DBCourse {
  // ダート/芝
  type: CourseType;

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
 * レース登録馬データ
 */
export interface DBEntry {
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

  // 血統
  pedigree?: string;

  // 調教
  training?: DBTraining;
}

/**
 * 調教データ
 */
 export interface DBTraining {
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
  logs: DBTrainingLog[];
}

/**
 * 調教履歴データ
 */
export interface DBTrainingLog {
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
  lap: DBLapGap[],

  // 併せ相手
  partner?: string,
}

/**
 * 調教タイム・区間タイム
 */
export interface DBLapGap {
  lap?: number;
  gap?: number;
  accel?: number;
}

/**
 * レース結果
 */
export interface DBResult {
  // 着順
  detail: DBResultDetail[];

  // 払戻
  refund: DBResultRefund;
}

/**
 * レース結果詳細
 */
export interface DBResultDetail {
  // 馬番号
  horseId: number;

  // 着順
  order: number;

  // 道中のポジション
  period: DBResultPeriod[];

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
 export interface DBResultPeriod {
  position: number;
  
  disadvantage?: boolean;
}

/**
 * レース払戻
 */
export interface DBResultRefund {
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
