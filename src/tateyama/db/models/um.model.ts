import mongoose from 'mongoose';
import { DB } from 'tateyama';

const schema = new mongoose.Schema<DB.UM>(
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
  
    KettoNum: { type: String, index: true },
    DelKubun: String,
  
    RegData: {
      Year: String,
      Month: String,
      Date: String,
    },
    DelDate: {
      Year: String,
      Month: String,
      Date: String,
    },
    BirthDate: {
      Year: String,
      Month: String,
      Date: String,
    },
  
    Bamei: String,
    BameiKana: String,
    BameiEng: String,
    ZaikyuFlag: String,
    Reserved: String,
  
    UmaKigoCD: String,
    SexCD: String,
    HinsyCD: String,
    KeiroCD: String,
  
    Ketto3Info: [{
      HansyokuNum: String,
      Bamei: String,
    }],
  
    TozaiCD: String,
    ChokyosiCode: String,
    ChokyosiRyakusyo: String,
    Syotai: String,
    BreederCode: String,
    BreederName: String,
    SanchiName: String,
    BanusiCode: String,
    BanusiName: String,
    RuikeiHonsyoHeiti: String,
    RuikeiHonsyoSyogai: String,
    RuikeiFukaHeichi: String,
    RuikeiFukaSyogai: String,
    RuikeiSyutokuHeichi: String,
    RuikeiSyutokuSyogai: String,
  
    ChakuSogo: {
      ChakuKaisu: [String],
    },
    ChakuChuo: {
      ChakuKaisu: [String],
    },
    ChakuKaisuBa: [{
      ChakuKaisu: [String],
    }],
    ChakuKaisuJyotai: [{
      ChakuKaisu: [String],
    }],
    ChakuKaisuKyori: [{
      ChakuKaisu: String,
    }],
    Kyakusitu: [String],
    RaceCOunt: String,
  
    crlf: String,
  },

  {
    collection: "UM",
    versionKey: false,
    autoIndex: false,
    timestamps: false,
  },
);

export const UMModel = mongoose.models.UM as mongoose.Model<DB.UM> || mongoose.model('UM', schema);
