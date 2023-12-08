import { readFileSync } from 'fs';
import { parse } from 'papaparse';
import { RA } from '../types';

export function loadCsvRA(): RA[] {
  const RAcsv = parse<RA>(readFileSync(".csv/RA.csv").toString(), {
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

  return RAcsv.data.filter((v) => v.RecordSpec === "RA" &&
    (v.DataKubun === "2" || v.DataKubun === "7" || v.DataKubun === "A" || v.DataKubun === "B")
  );
}