import puppeteer from 'puppeteer';

import log4js from 'log4js';
import { Types } from '../../tateyama';
const logger = log4js.getLogger();

const randomWaitTime = (time: number) => time / 2 + Math.floor(Math.random() * (time / 2));  
const removeTab = (str: string) => str?.replace(/[\t]+/g, "").replace(/[\n]+/g, "\n").replace(/\n\u3000/g, "　").trim(); 

export const scraping = async (
  onGetCached: (info: Types.RaceInfo) => Types.RaceRawData,
  onWrite: (cache: Types.RaceData) => void,
  args: { [key: string]: any }
): Promise<void> => {
  const opts = {
    args: [
      args["no-sandbox"] && '--no-sandbox',
      args["proxy"] && `--proxy-server ${args["proxy"]}`,
    ].filter((v) => v),
  };
  const browser = await puppeteer.launch(opts);
  logger.info('Pupeteer Options: ', opts);

  const page = await browser.newPage();
  page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.3538.77 Safari/537.36');

  // login
  await page.goto(`https://s.keibabook.co.jp/login/login`);
  await page.type('input[name="login_id"]', args["site-id"] || "");
  await page.type('input[name="pswd"]', args["site-pass"] || "");
  await page.click('input[name="submitbutton"]');

  for (let month = 1; month <= 12; month ++) {
    if (args["month"] !== undefined && args["month"] !== `${month}`) {
      continue;
    }

    const yearMonth = `${args["year"]}${String(month).padStart(2, '0')}`;

    try {
      await page.waitForTimeout(randomWaitTime(500));
      await page.goto(`https://s.keibabook.co.jp/cyuou/nittei/${yearMonth}`);
    } catch (err) {
      continue;
    }

    // 指定した年月の全開催日を取得
    const holdElements = await page.$$("li > div");
    const holdInfoList = await Promise.all(
      holdElements.map(async (hold) => {
        const holdLinkElement = await hold.$("a");
        const holdLinkProps = holdLinkElement && await holdLinkElement.getProperty('href');
        const holdLinkValue = removeTab(holdLinkProps && await holdLinkProps.jsonValue<any>());
        const holdTextElement = await hold.$('p.keibajyo');
        const holdTextProps = holdLinkElement && await holdTextElement.getProperty('textContent');
        const holdTextValue = removeTab(holdTextProps && await holdTextProps.jsonValue<any>());

        return { link: holdLinkValue, text: holdTextValue };
      })
    );

    let wrote = 0;
    for (const holdInfo of holdInfoList) {
      // 空の開催はスキップする
      if (!holdInfo.link || !holdInfo.text) {
        continue;
      }

      const date = holdInfo.link?.slice(-10).slice(0, 8);
      const courseId = holdInfo.link?.slice(-2);
      const courseName = holdInfo.text;

      // 指定開催へ遷移
      try {
        await page.waitForTimeout(randomWaitTime(500));
        await page.goto(holdInfo.link);
      } catch (err) {
        logger.error(`${err}: ${holdInfo.link}`);
        continue;
      }
    
      // レースの検出
      const raceElements = await page.$$("td.left > a");

      const raceList = await Promise.all(raceElements.map(async (raceElement) => {
        const raceLinkProp = raceElement && await raceElement.getProperty('href');
        const raceLinkValue = removeTab(raceLinkProp && await raceLinkProp.jsonValue<any>());
        const raceTextProp = raceElement && await raceElement.getProperty('textContent');
        const raceTextValue = removeTab(raceTextProp && await raceTextProp.jsonValue<string>());
        return { link: raceLinkValue, title: raceTextValue };
      }));

      // レース取得順は念のためランダムに
      const sortedRaceList = raceList.sort(() => Math.random() - 0.5);
      for (const race of sortedRaceList) {
        if (!race.link || !race.title) {
          continue;
        }

        const raceNo = race.link.slice(-2);
        const raceTitle = race.title || "";

        // 指定レースへ遷移
        await page.waitForTimeout(randomWaitTime(500));
        await page.goto(race.link);

        // レース情報
        const raceInfo: Types.RaceInfo = {
          date: date,
          courseId: courseId,
          courseName: courseName,
          raceNo: raceNo,
          raceTitle: raceTitle
        };

        logger.info(`=== ${date} ${courseName}${raceNo}_${raceTitle} `);

        // 既に取得済みのデータを読み込む
        let cachedRawData: Types.RaceRawData;
        if (onGetCached) {
          cachedRawData = onGetCached(raceInfo);
        } 

        // 出馬表ページの取得
        const entriesLinkElement = await page.$('a[title="出馬表"]');
        const entriesLinkProp = entriesLinkElement && await entriesLinkElement.getProperty('href');
        const entriesLinkValue = removeTab(entriesLinkProp && await entriesLinkProp.jsonValue<any>());
        let entriesHtml = cachedRawData?.entries;

        if (!entriesHtml && entriesLinkValue) {
          logger.info(`出馬表を取得しています...`);
          await page.waitForTimeout(randomWaitTime(500));
          await page.goto(entriesLinkValue);
          entriesHtml = await page.content();
        }

        if (!entriesHtml) {
          logger.info(`> 出馬表データがありませんでした。このレースの取得を中止します`);
          // 出馬表データが取得できない場合、事前情報状態なのでスキップ
          continue;
        }

        // 調教ページの取得
        const trainingLinkElement = await page.$('a[title="調教"]');
        const trainingLinkProp = trainingLinkElement && await trainingLinkElement.getProperty('href');
        const trainingLinkValue = removeTab(trainingLinkProp && await trainingLinkProp.jsonValue<any>());
        let trainingHtml = cachedRawData?.training;

        if (!trainingHtml && trainingLinkValue) {
          logger.info(`調教を取得しています...`);
          await page.waitForTimeout(randomWaitTime(500));
          await page.goto(trainingLinkValue);
          trainingHtml = await page.content();
        }

        if (!trainingHtml) {
          // 調教データが取得できない場合、事前情報状態なのでスキップ
          logger.info(`> 調教データがありませんでした。このレースの取得を中止します`);
          continue;
        }
        
        // 血統ページの取得
        const bloodLinkElement = await page.$('a[title="血統表"]');
        const bloodLinkProp = bloodLinkElement && await bloodLinkElement.getProperty('href');
        const bloodLinkValue = removeTab(bloodLinkProp && await bloodLinkProp.jsonValue<any>());
        let bloodHtml = cachedRawData?.blood;

        if (!bloodHtml && bloodLinkValue) {
          logger.info(`血統表を取得しています...`);
          await page.waitForTimeout(randomWaitTime(500));
          await page.goto(bloodLinkValue);
          bloodHtml = await page.content();
        }

        if (!bloodHtml) {
          logger.info(`> 血統表データがありませんでした。このレースの取得を中止します`);
          // 血統データが取得できない場合、事前情報状態なのでスキップ
        }

        // 結果ページの取得
        const resultLinkElement = await page.$('a[title="レース結果"]');
        const resultLinkProp = resultLinkElement && await resultLinkElement.getProperty('href');
        const resultLinkValue = removeTab(resultLinkProp && await resultLinkProp.jsonValue<any>());
        let resultHtml = cachedRawData?.result;

        if (!resultHtml && resultLinkValue) {
          logger.info(`レース結果を取得しています...`);
          await page.waitForTimeout(randomWaitTime(500));
          await page.goto(resultLinkValue);
          resultHtml = await page.content();
        }

        if (!resultHtml) {
          // 結果データが取得できない場合は出走前だが問題なし
          // continue;
        }

        // 書き出し
        const raceRawData = {
          entries: entriesHtml,
          training: trainingHtml,
          blood: bloodHtml,
          result: resultHtml,
        }
        onWrite && onWrite({ info: raceInfo, data: raceRawData });

        wrote += 1;
      }
    }

    if (wrote > 0) {
      await page.waitForTimeout(randomWaitTime(5000));
    }
  }
  browser.close();
}
