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
