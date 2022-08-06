import 'dotenv/config'
import fs from 'fs';

import { Scrape } from 'tateyama';
import logger from 'logger';

import { scraping, KeibabookScrapingParams } from './keibabook';

export default (year: string | undefined, month: string | undefined, day: string | undefined, options: any) => {
  /**
   * キャッシュ用ファイルパスの取得
   * @param race 
   * @returns 
   */
  const getRaceCachePath = (info: Scrape.ScrapeRaceInfo) => {
    const dir = `${options.outputDir}/${info.date}`;
    const fileName = `${info.courseName}${String(info.raceNo).padStart(2, '0')}_${info.raceTitle}`;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return `${dir}/${fileName}.json`;
  }

  /**
   * 該当ページの既に取得済みのスクレイピング結果を返すハンドラ
   * 
   * @param info
   */
  const onLoadCache = (info: Scrape.ScrapeRaceInfo): Scrape.ScrapeRaceRaw => {
    const path = getRaceCachePath(info);
    let raw: Scrape.ScrapeRaceRaw;
    if (options.update) {
      return undefined;
    }

    if (fs.existsSync(path)) {
      try {
        const json = fs.readFileSync(path);
        const raceData = JSON.parse(json.toString()) as Scrape.ScrapeRaceData;

        raw = raceData.rawHTML;
      } catch (err) {
        logger.error(err);
      }
    }

    return raw;
  }

  /**
   * スクレイピング結果を保存するハンドラ
   * @param data 
   */
  const onSaveCache = (data: Scrape.ScrapeRaceData) => {
    try {
      fs.writeFileSync(getRaceCachePath(data), JSON.stringify(data, undefined, 2));
    } catch (err) {
      logger.error(err);
    }
  }

  /**
   * スクレイピング処理の実行
   */
  const params: KeibabookScrapingParams = {
    year,
    month,
    day,
    ...options,

    onSaveCache,
    onLoadCache,
  }

  scraping(params).catch((err)=> {
    logger.error(err);
  }).finally(() => {
    logger.info("complete.");
  });

}