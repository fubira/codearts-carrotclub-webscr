import mongoose from 'mongoose';
import { DB } from 'tateyama';

const schema = new mongoose.Schema<DB.HR>(
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
  
    TorokuTosu: String,
    SyussoTosu: String,
    FuseirituFlag: [String],
    TokubaraiFlag: [String],
    HenkanFlag: [String],
    HenkanUma: [String],
    HenkanWaku: [String],
    HenkanDoWaku: [String],
    PayTansyo: [{
      Umaban: String,
      Pay: String,
      Ninki: String,
    }],
    PayFukusyo: [{
      Umaban: String,
      Pay: String,
      Ninki: String,
    }],
    PayWakuren: [{
      Umaban: String,
      Pay: String,
      Ninki: String,
    }],
    PayUmaren: [{
      Kumi: String,
      Pay: String,
      Ninki: String,
    }],
    PayWide: [{
      Kumi: String,
      Pay: String,
      Ninki: String,
    }],
    PayReserved1: [{
      Kumi: String,
      Pay: String,
      Ninki: String,
    }],
    PayUmatan: [{
      Kumi: String,
      Pay: String,
      Ninki: String,
    }],
    PaySanrenpuku: [{
      Kumi: String,
      Pay: String,
      Ninki: String,
    }],
    PaySanrentan: [{
      Kumi: String,
      Pay: String,
      Ninki: String,
    }],
    
    crlf: String,
  },

  {
    collection: "HR",
    versionKey: false,
    autoIndex: false,
    timestamps: false,
  },
);

export const HRModel = mongoose.models.HR as mongoose.Model<DB.HR> || mongoose.model('HR', schema);
