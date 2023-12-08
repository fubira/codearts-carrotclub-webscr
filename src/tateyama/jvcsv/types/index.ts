/**
 * JV2Linkデータ形定義
*/

/**
 * レースID
 */
export interface JVID {
  Year: string; 
  MonthDay: string;
  JyoCD: string;
  RaceNum: string;
}

/**
 * レースデータ
 */
export interface RA extends JVID {
  RecordSpec: string;
  DataKubun: string;
  RecordYear: string;
  RecordMonth: string;
  RecordDay: string;

  Year: string; 
  MonthDay: string;
  JyoCD: string;
  Kaiji: string;
  Nitiji: string;
  RaceNum: string;

  YoubiCD: string;
  TokuNum: string;
  Hondai: string;
  Fukudai: string;
  Kakko: string;
  HondaiEng: string;
  FukudaiEng: string;
  KakkoEng: string;
  Ryakusyo10: string;
  Ryakusyo6: string;
  Ryakusyo3: string;
  Kubun: string;
  Nkai: string;

  GradeCD: string;
  GradeCDBefore: string;
  SyubetuCD: string;
  KigoCD: string;
  JyuryoCD: string;
  JyokenName: string;
  Kyori: string;
  KyoriBefore: string;
  TrackCD: string;
  TrackCDBefore: string;
  CourseKubunCD: string;
  CourseKubunCDBefore: string;

  HassoTime: string;
  HassoTimeBefore: string;
  TorokuTosu: string;
  SyussoTosu: string;
  NyusenTosu: string;
  TenkoCD: string;
  SibaBabaCD: string;
  DirtBabaCD: string;
  SyogaiMileTime: string;
  HaronTimeS3: string;
  HaronTimeS4: string;
  HaronTimeL3: string;
  HaronTimeL4: string;
  RecordUpKubun: string;
  crlf: string;
}

/**
 * 出走馬データ
 */
export interface SE extends JVID {
  RecordSpec: string;
  DataKubun: string;
  RecordYear: string;
  RecordMonth: string;
  RecordDay: string;

  Year: string;
  MonthDay: string;
  JyoCD: string;
  Kaiji: string;
  Nichiji: string;
  RaceNum: string;

  Wakuban: string;
  Umaban: string;
  KettoNum: string;
  Bamei: string;
  UmaKigoCD: string;
  SexCD: string;
  HinsyuCD: string;
  KeiroCD: string;
  Barei: string;
  TozaiCD: string;
  ChokyosiCode: string;
  ChokyosiRyakusyo: string;
  BanusiCode: string;
  BanusiName: string;
  Fukusyoku: string;
  reserved1: string;
  Futan: string;
  FutanBefore: string;
  Blinker: string;
  reserved2: string;
  KisyuCode: string;
  KisyuCodeBefore: string;
  KisyuRyakusyo: string;
  KisyuRyakusyoBefore: string;
  MinaraiCD: string;
  MinaraiCDBefore: string;
  BaTaijyu: string;
  ZogenFugo: string;
  ZogenSa: string;
  IJyoCD: string;
  NyusenJyuni: string;
  KakuteiJyuni: string;
  DochakuKubun: string;
  DochakuTosu: string;
  Time: string;
  ChakusaCD: string;
  ChakusaCDP: string;
  ChakusaCDPP: string;
  Jyuni1c: string;
  Jyuni2c: string;
  Jyuni3c: string;
  Jyuni4c: string;
  Odds: string;
  Ninki: string;
  Honsyokin: string;
  Fukasyokin: string;
  reserved3: string;
  reserved4: string;
  HaronTimeL4: string;
  HaronTimeL3: string;
  TimeDiff: string;
  RecordUpKubun: string;
  DMKubun: string;
  DMTime: string;
  DMGosaP: string;
  DMGosaM: string;
  DMJyuni: string;
  KyakusituKubun: string;
}

/**
 * 払戻データ
 */
export interface HR {
  RecordSpec: string;
  DataKubun: string;
  RecordYear: string;
  RecordMonth: string;
  RecordDay: string;

  TresenKubun: string;
  Year: string;
  Month: string;
  Day: string;

  ChokyoTime: string;
  KettoNum: string;

  HaronTime4: string;
  LapTime4: string;
  HaronTime3: string;
  LapTime3: string;
  HaronTime2: string;
  LapTime2: string;
  LapTime1: string;
  crlf: string;
}

/**
 * 坂路調教データ
 */
export interface HC {
  RecordSpec: string;
  DataKubun: string;
  RecordYear: string;
  RecordMonth: string;
  RecordDay: string;

  TresenKubun: string;
  Year: string;
  Month: string;
  Day: string;

  ChokyoTime: string;
  KettoNum: string;

  HaronTime4: string;
  LapTime4: string;
  HaronTime3: string;
  LapTime3: string;
  HaronTime2: string;
  LapTime2: string;
  LapTime1: string;
  crlf: string;
}

/**
 * ウッドチップ調教データ
 */
export interface WC {
  RecordSpec: string;
  DataKubun: string;
  RecordYear: string;
  RecordMonth: string;
  RecordDay: string;

  TresenKubun: string;
  Year: string;
  Month: string;
  Day: string;
  ChokyoTime: string;
  KettoNum: string;

  Course: string;
  BabaMawari: string;
  
  HaronTime6: string;
  LapTime6: string;
  HaronTime5: string;
  LapTime5: string;
  HaronTime4: string;
  LapTime4: string;
  HaronTime3: string;
  LapTime3: string;
  HaronTime2: string;
  LapTime2: string;
  LapTime1: string;
  crlf: string;
}
