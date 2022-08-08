import mongoose from 'mongoose';
import { DB } from 'tateyama';

const schema = new mongoose.Schema<DB.RA>(
  {
    head: {
      RecordSpec: String,
      DataKubun: String,
  
      MakeData: {
        Year: String,
        Month: String,
        Day: String,
      }
    },
  
    jvid: {
      Year: { type: String, index: true },
      MonthDay: { type: String, index: true },
      JyoCD: { type: String, index: true },
      Kaiji: { type: String, index: true },
      Nichiji: { type: String, index: true },
      RaceNum: { type: String, index: true },
    },
  
    RaceInfo: {
      YoubiCD: String,
      TokuNum: String,
      Hondai: String,
      Fukudai: String,
      Kakko: String,
      HondaiEng: String,
      Ryakusyo10: String,
      Ryakusyo6: String,
      Ryakusyo3: String,
      Kubun: String,
      Nkai: String,
    },
  
    GradeCD: String,
    GradeCDBefore: String,
  
    JyokenInfo: {
      SyubetuCD: String,
      KigoCD: String,
      JyuryoCD: String,
      JyokenCD: [String],
    },

    JyokenName: String,
  
    Kyori: String,
    KyoriBefore: String,
    TrackCD: String,
    TrackBefore: String,
    CourseKubunCD: String,
    CourseKubunCDBefore: String,
  
    Honsyokin: [String],
    HonsyokinBefore: [String],
    Fukasyokin: [String],
    FukasyokinBefore: [String],
  
    HassoTime: String,
    HassoTimeBefore: String,
    
    TorokuTosu: String,
    SyussoTosu: String,
    NyusenTosu: String,
    
    TenkoBaba: {
      TenkoCD: String,
      SibaBabaCD: String,
      DirtBabaCD: String,
    },
  
    LapTime: [String],
  
    SyogaiMileTime: String,
    HaronTimeS3: String,
    HaronTimeS4: String,
    HaronTimeL3: String,
    HaronTimeL4: String,
  
    CornerInfo: [{
      Corner: String,
      Syukaisu: String,
      Jyuni: String,
    }],
  
    RecordUpKubun: String,
    crlf: String,
  },

  {
    collection: "RA",
    versionKey: false,
    autoIndex: false,
    timestamps: false,
  },
);

export const RAModel = mongoose.models.RA as mongoose.Model<DB.RA> || mongoose.model('RA', schema);
