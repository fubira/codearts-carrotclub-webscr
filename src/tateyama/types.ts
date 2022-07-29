/**
 * スクレイピングレースデータ
 */
export type ScrapeRaceData = ScrapeRaceInfo & { rawHTML: ScrapeRaceRaw }

/**
 * keibabook smart レース情報
 */
export interface ScrapeRaceInfo {
  // 日付
  date: string;

  // コース番号
  courseId: string;

  // コース名
  courseName: string;

  // レース番号
  raceNo: string;

  // レース名
  raceTitle: string;
}

/**
 * keibabook smart HTMLデータ
 */
export interface ScrapeRaceRaw {
  // 出走表ページ 
  entries?: string;

  // 能力表ページ
  detail?: string;

  // 調教ページ
  training?: string;

  // 血統表ページ (deprecated)
  blood?: string;

  // 結果ページ
  result?: string;
}


/**
 * DB保存データ形定義
 */

export interface DBRace {
  // データベースID
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

export interface DBCourse {
  // 距離
  distance: number;
  
  // ダート/芝
  type: CourseType;

  // 右周り左回り
  direction: CourseDirection;

  // 天候
  weather: CourseWeather;

  // 馬場状態
  condition: CourseCondition;

  // 付随情報
  option: string;
}

export type CourseType = '芝' | 'ダート';
export type CourseDirection = '左' | '右';
export type CourseWeather = '晴' | '曇' | '雨' | '小雨' | '雪' | '小雪';
export type CourseCondition = '良' | '稍重' | '重' | '不良';

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

export interface DBTrainingLog {
  // 日時 YYYYMMDD
  date: string,

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

export interface DBLapGap {
  lap?: number;
  gap?: number;
}

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

export type HorseSex = '牡' | '牝' | 'セン';

export interface DBResult {
  // 着順
  detail: DBResultDetail[];

  // 払戻
  refund: DBResultRefund;
}

export interface DBResultDetail {
  // 馬番号
  horseId: number;

  // 着順
  order: number;

  // 道中のポジション
  position: number[];

  // 道中不利
  disadvantage: boolean[];

  // タイム (s)
  timeSec: number;

  // 上り3F (s)
  last3fSec: number;
}

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

