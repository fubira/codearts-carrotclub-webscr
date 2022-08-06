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
