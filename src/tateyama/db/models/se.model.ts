import mongoose from 'mongoose';
import { DB } from 'tateyama';

const schema = new mongoose.Schema<DB.SE>(
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
  
    Wakuban: String,
    Umaban: String,
  
    KettoNum: String,
    Bamei: String,
    UmaKigoCD: String,
    SexCD: String,
    HinsyuCD: String,
    KeiroCD: String,
    Barei: String,
  
    TozaiCD: String,
    ChokyosiCode: String,
    ChokyosiRyakusyo: String,
    BanusiCode: String,
    BanusiName: String,
    Fukusyoku: String,
    reserved1: String,
  
    Futan: String,
    FutanBefore: String,
    Blinker: String,
    reserved2: String,
  
    KisyuCode: String,
    KisyuCodeBefore: String,
    KisyuRyakusyo: String,
    KisyuRyakusyoBefore: String,
    MinaraiCD: String,
    MinaraiCDBefore: String,
  
    Bataijyu: String,
    ZogenFugo: String,
    ZogenSa: String,
    IJyoCD: String,
  
    NyusenJyuni: String,
    KakuteiJyuni: String,
    DochakuKubun: String,
    DochakuTosu: String,
    Time: String,
    ChakusaCD: String,
    ChakusaCDP: String,
    ChakusaCDPP: String,
  
    Jyuni1c: String,
    Jyuni2c: String,
    Jyuni3c: String,
    Jyuni4c: String,
    
    Odds: String,
    Ninki: String,
    Honsyokin: String,
    Fukasyokin: String,
    reserved3: String,
    reserved4: String,
  
    HaronTimeL4: String,
    HaronTimeL3: String,
  
    ChakuUmaInfo: [{
      KettoNum: String,
      Bamei: String,
    }],

    TimeDiff: String,
    RecordUpKubun: String,
  
    DMKubun: String,
    DMTime: String,
    DMGosaP: String,
    DMGosaM: String,
    DMJyuni: String,
    KyakusituKubun: String,
    
    crlf: String,
  },

  {
    collection: "SE",
    versionKey: false,
    autoIndex: false,
    timestamps: true,
  },
);

export const SEModel = mongoose.models.SE as mongoose.Model<DB.SE> || mongoose.model('SE', schema);
