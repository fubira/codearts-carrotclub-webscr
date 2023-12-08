import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { WC } from '../types';

export function loadCsvWC(): WC[] {
  const WCcsv = parse<WC>(readFileSync(".csv/WC.csv").toString(), {
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
  
  return WCcsv.data.filter((v) => v.RecordSpec === "WC" && v.DataKubun !== "0");
}
