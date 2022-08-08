import mongoose from 'mongoose';
import { DB } from 'tateyama';

const schema = new mongoose.Schema<DB.HC>(
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
  
    ToresenKubun: String,

    ChokyoDate: {
      Year: { type: String, index: true },
      Month: { type: String, index: true },
      Day: { type: String, index: true },
    },
  
    ChokyoTime: String,
    KettoNum: { type: String, index: true },
    HaronTime4: String,
    LapTime4: String,
    HaronTime3: String,
    LapTime3: String,
    HaronTime2: String,
    LapTime2: String,
    LapTime1: String,
    
    crlf: String,
  },

  {
    collection: "HC",
    versionKey: false,
    autoIndex: false,
    timestamps: false,
  },
);

export const HCModel = mongoose.models.HC as mongoose.Model<DB.HC> || mongoose.model('HC', schema);
