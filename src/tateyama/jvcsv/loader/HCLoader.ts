import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { HC } from '../types';

export function loadCsvHC(): HC[] {
  const HCcsv = parse<HC>(readFileSync(".csv/HC.csv").toString(), {
    header: true,
    delimiter: ',',
    transformHeader: (header: string, index: number) => {
      if (index === 2 && header === "Year") {
        return "RecordYear"
      }
      if (index === 3 && header === "Month") {
        return "RecordMonth"
      }
      if (index === 4 && header === "Day") {
        return "RecordDay"
      }
      return header;
    }
  });
  
  console.log(Object.keys(HCcsv.data[0]));
  return HCcsv.data.filter((v) => v.RecordSpec === "HC" && v.DataKubun !== "0");
}