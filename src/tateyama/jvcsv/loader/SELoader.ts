import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { SE } from '../types';

export function loadCsvSE(): SE[] {
  const SEcsv = parse<SE>(readFileSync(".csv/SE.csv").toString(), {
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

  return SEcsv.data.filter((v) => v.RecordSpec === "SE" &&
    (v.DataKubun === "2" || v.DataKubun === "7" || v.DataKubun === "A" || v.DataKubun === "B")
  );
}