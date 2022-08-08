import mongoose from 'mongoose';
import { DB } from 'tateyama';

const schema = new mongoose.Schema<DB.WC>(
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

    Course: String,
    BabaMawari: String,
    reserved: String,

    HaronTime10: String,
    LapTime10: String,
    HaronTime9: String,
    LapTime9: String,
    HaronTime8: String,
    LapTime8: String,
    HaronTime7: String,
    LapTime7: String,
    HaronTime6: String,
    LapTime6: String,
    HaronTime5: String,
    LapTime5: String,
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
    collection: "WC",
    versionKey: false,
    autoIndex: false,
    timestamps: false,
  },
);

export const WCModel = mongoose.models.WC as mongoose.Model<DB.WC> || mongoose.model('WC', schema);
