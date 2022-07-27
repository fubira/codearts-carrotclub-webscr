export interface ScrapingParams {
  "year": string;
  "site-id": string;
  "site-pass": string;
  "proxy-server": string;
  "no-sandbox": boolean;
}

export interface RaceData {
  info: RaceInfo;
  data: RaceRawData;
}

export interface RaceInfo {
  date: string;
  courseId: string;
  courseName: string;
  raceNo: string;
  raceTitle: string;
}

export interface RaceRawData {
  entries: string;
  training: string;
  blood: string;
  result: string;
}

export type CourseType = '芝' | 'ダート';
export type CourseDirection = '左' | '右';
export type CourseWeather = '晴' | '曇' | '雨' | '小雨' | '雪' | '小雪';
export type CourseCondition = '良' | '稍重' | '重' | '不良';

export interface DataRace {
  course: DataCourse;

  entries: DataEntry[];
}

export interface DataCourse {
  // コースID
  id: number;

  // 競馬場名
  name: string;

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

export type HorseSex = '牡' | '牝' | 'セン';

export interface DataEntry {
  // 枠版
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
  horseBlood?: string;

  // 調教
  trainingLogs?: string;
}

export interface DataResult {
  _: null;
}
