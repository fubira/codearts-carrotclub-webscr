/**
 * レース情報
 */
export interface RA {
  head: {
    RecordSpec: string;
    DataKubun: string;

    MakeData: {
      Year: string;
      Month: string;
      Day: string;
    }
  };

  jvid: {
    Year: string;
    MonthDay: string;
    JyoCD: string;
    Kaiji: string;
    Nichiji: string;
    RaceNum: string;
  };

  RaceInfo: {
    YoubiCD: string;
    TokuNum: string;
    Hondai: string;
    Fukudai: string;
    Kakko: string;
    HondaiEng: string;
    Ryakusyo10: string;
    Ryakusyo6: string;
    Ryakusyo3: string;
    Kubun: string;
    Nkai: string;
  };

  GradeCD: string;
  GradeCDBefore: string;

  JyokenInfo: {
    SyubetuCD: string;
    KigoCD: string;
    JyuryoCD: string;
    JyokenCD: string[];
  }
  JyokenName: string;

  Kyori: string;
  KyoriBefore: string;
  TrackCD: string;
  TrackBefore: string;
  CourseKubunCD: string;
  CourseKubunCDBefore: string;

  Honsyokin: string[];
  HonsyokinBefore: string[];
  Fukasyokin: string[];
  FukasyokinBefore: string[];

  HassoTime: string;
  HassoTimeBefore: string;
  
  TorokuTosu: string;
  SyussoTosu: string;
  NyusenTosu: string;
  
  TenkoBaba: {
    TenkoCD: string;
    SibaBabaCD: string;
    DirtBabaCD: string;
  }

  LapTime: string[];

  SyogaiMileTime: string;
  HaronTimeS3: string;
  HaronTimeS4: string;
  HaronTimeL3: string;
  HaronTimeL4: string;

  CornerInfo: {
    Corner: string;
    Syukaisu: string;
    Jyuni: string;
  }[];

  RecordUpKubun: string;
  crlf: string;
}

/**
 * 坂路調教
 */
export interface HC {
  head: {
    RecordSpec: string;
    DataKubun: string;

    MakeData: {
      Year: string;
      Month: string;
      Day: string;
    }
  };

  ToresenKubun: string;
  ChokyoDate: {
    Year: string;
    Month: string;
    Day: string;
  };

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
 * 坂路調教
 */
export interface WC {
  head: {
    RecordSpec: string;
    DataKubun: string;

    MakeData: {
      Year: string;
      Month: string;
      Day: string;
    }
  };

  ToresenKubun: string;
  ChokyoDate: {
    Year: string;
    Month: string;
    Day: string;
  };

  ChokyoTime: string;
  KettoNum: string;
  Course: string;
  BabaMawari: string;
  reserved: string;
  
  HaronTime10: string;
  LapTime10: string;
  HaronTime9: string;
  LapTime9: string;
  HaronTime8: string;
  LapTime8: string;
  HaronTime7: string;
  LapTime7: string;
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

/**
 * 払戻
 */
export interface HR {
  head: {
    RecordSpec: string;
    DataKubun: string;

    MakeData: {
      Year: string;
      Month: string;
      Day: string;
    }
  };

  jvid: {
    Year: string;
    MonthDay: string;
    JyoCD: string;
    Kaiji: string;
    Nichiji: string;
    RaceNum: string;
  };

  TorokuTosu: string;
  SyussoTosu: string;
  FuseirituFlag: string[];
  TokubaraiFlag: string[];
  HenkanFlag: string[];
  HenkanUma: string[];
  HenkanWaku: string[];
  HenkanDoWaku: string[];
  PayTansyo: {
    Umaban: string;
    Pay: string;
    Ninki: string;
  }[];
  PayFukusyo: {
    Umaban: string;
    Pay: string;
    Ninki: string;
  }[];
  PayWakuren: {
    Umaban: string;
    Pay: string;
    Ninki: string;
  }[];
  PayUmaren: {
    Kumi: string;
    Pay: string;
    Ninki: string;
  }[];
  PayWide: {
    Kumi: string;
    Pay: string;
    Ninki: string;
  }[];
  PayReserved1: {
    Kumi: string;
    Pay: string;
    Ninki: string;
  }[];
  PayUmatan: {
    Kumi: string;
    Pay: string;
    Ninki: string;
  }[];
  PaySanrenpuku: {
    Kumi: string;
    Pay: string;
    Ninki: string;
  }[];
  PaySanrentan: {
    Kumi: string;
    Pay: string;
    Ninki: string;
  }[];
  
  crlf: string;
}

/**
 * 出走馬情報
 */
export interface SE {
  head: {
    RecordSpec: string;
    DataKubun: string;

    MakeData: {
      Year: string;
      Month: string;
      Day: string;
    }
  };

  jvid: {
    Year: string;
    MonthDay: string;
    JyoCD: string;
    Kaiji: string;
    Nichiji: string;
    RaceNum: string;
  };

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

  Bataijyu: string;
  ZogenFugo: string;
  ZogenSa: string;
  IJyoCD: string;

  NyusenJuni: string;
  KakuteiJuni: string;
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

  ChakuUmaInfo: {
    KettoNum: string;
    Bamei: string;
  }[];
  TimeDiff: string;
  RecordUpKubun: string;

  DMKubun: string;
  DMTime: string;
  DMGosaP: string;
  DMGosaM: string;
  DMJyuni: string;
  KyakusituKubun: string;
  
  crlf: string;
}

/**
 * 競争馬情報
 */
export interface UM {
  head: {
    RecordSpec: string;
    DataKubun: string;

    MakeData: {
      Year: string;
      Month: string;
      Day: string;
    }
  };

  KettoNum: string;
  DelKubun: string;

  RegData: {
    Year: string;
    Month: string;
    Date: string;
  };
  DelDate: {
    Year: string;
    Month: string;
    Date: string;
  };
  BirthDate: {
    Year: string;
    Month: string;
    Date: string;
  };

  Bamei: string;
  BameiKana: string;
  BameiEng: string;
  ZaikyuFlag: string;
  Reserved: string;

  UmaKigoCD: string;
  SexCD: string;
  HinsyCD: string;
  KeiroCD: string;

  Ketto3Info: {
    HansyokuNum: string;
    Bamei: string;
  }[];

  TozaiCD: string;
  ChokyosiCode: string;
  ChokyosiRyakusyo: string;
  Syotai: string;
  BreederCode: string;
  BreederName: string;
  SanchiName: string;
  BanusiCode: string;
  BanusiName: string;
  RuikeiHonsyoHeiti: string;
  RuikeiHonsyoSyogai: string;
  RuikeiFukaHeichi: string;
  RuikeiFukaSyogai: string;
  RuikeiSyutokuHeichi: string;
  RuikeiSyutokuSyogai: string;

  ChakuSogo: {
    ChakuKaisu: string[];
  };
  ChakuChuo: {
    ChakuKaisu: string[];
  };
  ChakuKaisuBa: {
    ChakuKaisu: string[];
  }[];
  ChakuKaisuJyotai: {
    ChakuKaisu: string[];
  }[];
  ChakuKaisuKyori: {
    ChakuKaisu: string[];
  }[];
  Kyakusitu: string[];
  RaceCOunt: string;

  crlf: string;
}
