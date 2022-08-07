import puppeteer from 'puppeteer';

import { Scrape } from 'v1/scrape';
import logger from 'logger';

const randomWaitTime = (time: number) => time / 2 + Math.floor(Math.random() * (time / 2));  
const removeTab = (str: string) => str?.replace(/[\t]+/g, "").replace(/[\n]+/g, "\n").replace(/\n\u3000/g, "　").trim(); 

export interface KeibabookScrapingParams {
  year?: string;
  month?: string;
  day?: string

  noSandbox?: boolean;
  proxy?: string;
  userAgent?: string;

  siteId: string;
  sitePass: string;

  onSaveCache: (data: Scrape.ScrapeRaceData) => void;
  onLoadCache: (info: Scrape.ScrapeRaceInfo) => Scrape.ScrapeRaceRaw;
}


/**
 * Keibabook Smart ログイン処理の実行
 * @param page 
 * @param id 
 * @param password 
 */
async function pageKeibabookSmartLogin (page: puppeteer.Page, id: string, password: string) {
  await page.goto(`https://s.keibabook.co.jp/login/login`);
  await page.type('input[name="login_id"]', id || "");
  await page.type('input[name="pswd"]', password || "");

  await Promise.all([
    await page.click('input[name="submitbutton"]'),
    await page.waitForNetworkIdle(),
  ]);

  logger.info(`ユーザー[${id}]でログインしました`);

  const errorElement = await page.$("p.error_message");
  const errorElementProps = errorElement && await errorElement.getProperty('textContent');
  const errorText = removeTab(errorElementProps && await errorElementProps.jsonValue<any>());

  if (errorText) {
    throw Error('ログインできませんでした。ID/PASSWORDを確認してください')
  }
} 

/**
 * 開催日程の取得
 * @param page 
 */
async function pageKeibabookSmartRaceProgram (page: puppeteer.Page, yearMonth: string) {
  /**
   * 指定年月の開催日程一覧を取得
   */
  try {
    await page.goto(`https://s.keibabook.co.jp/cyuou/nittei/${yearMonth}`);
    await page.waitForTimeout(randomWaitTime(500));
  } catch (err) {
    return undefined;
  }

  const programElements = await page.$$("li > div");
  const programInfoList = await Promise.all(
    programElements.map(async (hold) => {
      const programLinkElement = await hold.$("a");
      const programLinkProps = programLinkElement && await programLinkElement.getProperty('href');
      const programLinkValue = removeTab(programLinkProps && await programLinkProps.jsonValue<any>());
      const programTextElement = await hold.$('p.keibajyo');
      const programTextProps = programLinkElement && await programTextElement.getProperty('textContent');
      const programTextValue = removeTab(programTextProps && await programTextProps.jsonValue<any>());

      const date = programLinkValue?.slice(-10).slice(0, 8);
      const courseId = programLinkValue?.slice(-2);
      const courseName = programTextValue;

      return {
        date,
        courseId,
        courseName,
        link: programLinkValue,
      };
    })
  );

  return programInfoList.filter((program) => program.link && program.courseName);
}

/**
 * レースページに移動し、各詳細データページのリンクアドレスを取得する
 * @param page 
 */
 async function pageKeibabookSmartDetailLink (page: puppeteer.Page, racePageLink: string) {
  // 指定レースへ遷移
  try {
    await page.goto(racePageLink);
    await page.waitForTimeout(randomWaitTime(500));
  } catch (err) {
    return undefined;
  }

  // 出馬表ページの取得
  const entriesLinkElement = await page.$('a[title="出馬表"]');
  const entriesLinkProp = entriesLinkElement && await entriesLinkElement.getProperty('href');
  const entriesLinkValue = removeTab(entriesLinkProp && await entriesLinkProp.jsonValue<any>());

  // 調教ページの取得
  const trainingLinkElement = await page.$('a[title="調教"]');
  const trainingLinkProp = trainingLinkElement && await trainingLinkElement.getProperty('href');
  const trainingLinkValue = removeTab(trainingLinkProp && await trainingLinkProp.jsonValue<any>());
  
  // 能力表ページの取得
  const detailLinkElement = await page.$('a[title="能力表(HTML)"]');
  const detailLinkProp = detailLinkElement && await detailLinkElement.getProperty('href');
  const detailLinkValue = removeTab(detailLinkProp && await detailLinkProp.jsonValue<any>());
  const detailIframeLinkValue = detailLinkValue.replace(/_html/, '_html_detail').concat('.html');
  
  // 血統ページの取得
  // const bloodLinkElement = await page.$('a[title="血統表"]');
  // const bloodLinkProp = bloodLinkElement && await bloodLinkElement.getProperty('href');
  // const bloodLinkValue = removeTab(bloodLinkProp && await bloodLinkProp.jsonValue<any>());

  // 結果ページの取得
  const resultLinkElement = await page.$('a[title="レース結果"]');
  const resultLinkProp = resultLinkElement && await resultLinkElement.getProperty('href');
  const resultLinkValue = removeTab(resultLinkProp && await resultLinkProp.jsonValue<any>());

  return {
    entriesLink: entriesLinkValue,
    trainingLink: trainingLinkValue,
    detailLink: detailIframeLinkValue,
    resultLink: resultLinkValue,
  }
}

/**
 * 指定したページを取得する
 * @param page 
 */
async function pageKeibabookSmartReadHtml (page: puppeteer.Page, link: string, cached: string) {
  // 出馬表ページの取得
  let html = cached;

  if (!html && link) {
    await page.goto(link);
    await page.waitForTimeout(randomWaitTime(500));
    html = await page.content();
  }

  if (!html) {
    // throw Error('HTMLの取得に失敗しました');
  }

  return html;
}

export const scraping = async (params: KeibabookScrapingParams): Promise<void> => {
  /**
   * Puppeteerの初期設定
   */
  const opts = {
    args: [
      params.noSandbox && '--no-sandbox',
      params.proxy && `--proxy-server ${params.proxy}`,
    ].filter((v) => v),
  };
  logger.info('Pupeteer Options: ', opts);

  const browser = await puppeteer.launch(opts);
  const page = await browser.newPage();
  params.userAgent && page.setUserAgent(params.userAgent);

  /**
   * Keibabook smartにログインする
   * 
   * @note ログインできない場合は重要な情報が取れないため中断する
   */
  try {
    await pageKeibabookSmartLogin(page, params.siteId, params.sitePass);
  } catch (err) {
    logger.error(err);
    browser.close();
    return;
  }

  /**
   * 取得する年月日情報を生成
   * 
   * 年は指定必須
   * 月日が未指定ならば指定年の全ての月日、
   * 日が未指定ならば指定年月の全ての日のデータを取得する
   */
  const rangeYear = params.year && Number(params.year);
  const rangeMonth = params.month && Number(params.month);
  const rangeDay = params.day && Number(params.day);

  logger.info(`取得範囲: ${rangeYear}.${rangeMonth || "*"}.${rangeDay || "*"}`);

  /**
   * データ取得ループ
   */
  for (let month = 1; month <= 12; month ++) {
    if (rangeMonth && (rangeMonth !== month)) {
      console.log(rangeMonth, month, rangeMonth !== month);
      continue;
    }

    /**
     * 指定年月の開催日程一覧を取得
     */
     const rangeYearMonth = `${rangeYear}${String(month).padStart(2, '0')}`;
     const raceProgramList = await pageKeibabookSmartRaceProgram(page, rangeYearMonth);

    let wrote = 0;
    for (const raceProgram of raceProgramList) {
      if (rangeDay && (rangeDay !== Number(raceProgram.date.slice(-2)))) {
        console.log(rangeDay, Number(raceProgram.date.slice(-2)));
        continue;
      }

      // 指定開催へ遷移
      try {
        await page.goto(raceProgram.link);
        await page.waitForTimeout(randomWaitTime(500));
      } catch (err) {
        logger.error(`${err}: ${raceProgram.link}`);
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
        logger.info(`=== ${raceProgram.date} ${raceProgram.courseName} ${raceNo} ${raceTitle} `);

        // 指定レースページの詳細情報リンク取得
        const pageLinks = await pageKeibabookSmartDetailLink(page, race.link);

        // レース情報
        const raceInfo: Scrape.ScrapeRaceInfo = {
          date: raceProgram.date,
          courseId: raceProgram.courseId,
          courseName: raceProgram.courseName,
          raceNo: raceNo,
          raceTitle: raceTitle
        };

        // 既に取得済みのデータを読み込む
        let cachedRaw: Scrape.ScrapeRaceRaw;
        if (params.onLoadCache) {
          cachedRaw = params.onLoadCache(raceInfo);
        } 

        // HTMLの取得
        try {
          const entriesHtml = await pageKeibabookSmartReadHtml(page, pageLinks.entriesLink, cachedRaw?.entries);
          const trainingHtml = await pageKeibabookSmartReadHtml(page, pageLinks.trainingLink, cachedRaw?.training);
          const detailHtml = await pageKeibabookSmartReadHtml(page, pageLinks.detailLink, null);
          const resultHtml = await pageKeibabookSmartReadHtml(page, pageLinks.resultLink, cachedRaw?.result);
          // const bloodHtml = await pageKeibabookSmartReadHtml(page, pageLinks.bloodLink, cachedRaw?.blood);

          params.onSaveCache && params.onSaveCache({
            ...raceInfo,
            rawHTML: {
              entries: entriesHtml,
              training: trainingHtml,
              detail: detailHtml,
              result: resultHtml,
            }
          });

          wrote += 1;
        } catch (err) {
          logger.warn(`${err}: このレースのデータ取得を中止します`);
        }
      }
    }

    if (wrote > 0) {
      await page.waitForTimeout(randomWaitTime(10000));
    }
  }
  browser.close();
}
