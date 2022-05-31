import puppeteer from 'puppeteer';

import log4js from 'log4js';
const logger = log4js.getLogger();

export interface ScrapingDataType {
  value: string;
  link: string;
  name: string;
  info: string;
}

export const scraping = async (id: string, password: string, noSandbox: boolean): Promise<Array<ScrapingDataType>> => {
  const browser = await puppeteer.launch({ args: noSandbox ? ['--no-sandbox'] : undefined });
  const page = await browser.newPage();

  // login
  await page.goto('https://carrotclub.net/');
  await page.type('input[name="ID"]', id || ""),
  await page.type('input[name="PW"]', password || ""),
  await Promise.all([
    page.click('.login-btn'),
    page.waitForNavigation(),
  ]);

  // find my horse list
  const myHorseElements: Array<puppeteer.ElementHandle> = await page.$$("#panel-1 .MHtd1");
  const myHorseLinks = await Promise.all(myHorseElements.map(async (element) => {
    const link = await element.$("a");
    const href = await link.getProperty("href");

    return await href.jsonValue<string>();
  }));

  // get links
  const links = myHorseLinks.slice(0, 1);

  const removeTab = (str: string) => str?.replace(/[\t]+/g, "").replace(/[\n]+/g, "\n").replace(/\n\u3000/g, "　").trim(); 
  const removeNewline = (str: string) => str?.replace(/[\n\t]+/g, "").trim();

  const getHorsePageLatestInformation = async (link: string) => {
    const page = await browser.newPage();

    await Promise.all([
      page.goto(link),
      page.waitForNavigation(),
    ]);

    const head = await page.$(".umaHead h1");
    const nameProp = head && await head.getProperty("textContent");
    const nameValue = nameProp && await nameProp.jsonValue<string>();

    const topBlockList = await page.$$(".umaHead p.uma-txt1");
    const topBlockListProp = topBlockList && await Promise.all(topBlockList.map(async (item) => await item.getProperty("textContent")));
    const topBlockListValue = topBlockListProp && await Promise.all(topBlockListProp.map(async (prop) => await prop.jsonValue<string>()));
    const topBlockString = removeNewline(topBlockListValue?.join(" ")).replace(/'[\d/]*生/, "");

    const umaHeadBlockList = await page.$$(".umaHead div");
    const bottomBlockListProp = umaHeadBlockList && await Promise.all(umaHeadBlockList.map(async (item) => await item.getProperty("textContent")));
    const bottomBlockListValue = bottomBlockListProp && await Promise.all(bottomBlockListProp.map(async (prop) => await prop.jsonValue<string>()));
    const bottomBlockInfoString = bottomBlockListValue &&  bottomBlockListValue[2];
    const bottomBlockString = removeNewline(bottomBlockInfoString).replace(/\(BMS.*\).*$/, '');

    const textList = await page.$$("ul.hose-lst1");
    const latestTextProp = textList && textList[0] && await textList[0].getProperty("textContent");
    const latestTextValue = removeTab(latestTextProp && await latestTextProp.jsonValue<any>());
    
    await page.waitForTimeout(1000);

    return {
      link,
      name: nameValue,
      info: `${topBlockString} ${bottomBlockString}`,
      value: latestTextValue,
    };
  }

  const getHorsePageLatestPhoto = async (link: string) => {
    const page = await browser.newPage();

    await Promise.all([ page.goto(link), page.waitForNavigation(), ]);
    const head = await page.$(".umaHead h1");
    const nameProp = head && await head.getProperty("textContent");
    const nameValue = nameProp && await nameProp.jsonValue<string>();

    const photoInfo = await page.$$("ul.hose-lst4horse h3");
    const photoInfoProp = photoInfo && photoInfo[0] && await photoInfo[0].getProperty("textContent");
    const photoInfoValue = removeTab(photoInfoProp && await photoInfoProp.jsonValue<any>());

    const photoLink = await page.$$("ul.hose-lst4horse a");
    const photoLinkUrlProp = photoLink && photoLink[0] && await photoLink[0].getProperty("href");
    const photoLinkUrlValue = removeTab(photoLinkUrlProp && await photoLinkUrlProp.jsonValue<any>());

    await page.waitForTimeout(1000);

    return {
      link,
      name: `${nameValue} Photo`,
      info: photoInfoValue,
      value: photoLinkUrlValue,
    };
  }

  const getHorsePageLatestVideo = async (link: string) => {
    const page = await browser.newPage();

    await Promise.all([ page.goto(link), page.waitForNavigation(), ]);
    const head = await page.$(".umaHead h1");
    const nameProp = head && await head.getProperty("textContent");
    const nameValue = nameProp && await nameProp.jsonValue<string>();

    const videoInfo = await page.$$("ul.hose-lst4horse-movie_3 li");
    const videoInfoProp = videoInfo && videoInfo[0] && await videoInfo[0].getProperty("textContent");
    const videoInfoValue = removeTab(videoInfoProp && await videoInfoProp.jsonValue<any>());

    const mp4Link = await page.$$("ul.hose-lst4horse-movie_3 a");
    const mp4LinkUrlProp = mp4Link && mp4Link[0] && await mp4Link[0].getProperty("href");
    const mp4LinkUrlValue = removeTab(mp4LinkUrlProp && await mp4LinkUrlProp.jsonValue<any>());
    
    await page.waitForTimeout(1000);

    return {
      link,
      name: `${nameValue} Video`,
      info: videoInfoValue,
      value: mp4LinkUrlValue,
    };
  }

  const values = [];
  for (const link of links) {
    values.push(await getHorsePageLatestInformation(link));
    values.push(await getHorsePageLatestPhoto(link));
    values.push(await getHorsePageLatestVideo(link));
  }
  logger.info("page scraping complete.");

  browser.close();

  return values;
}
