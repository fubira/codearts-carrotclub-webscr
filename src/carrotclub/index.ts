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
    page.click('.btnlog'),
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
  const links = myHorseLinks; //.slice(0, 1);

  const removeTab = (str: string) => str?.replace(/[\t]+/g, "").replace(/[\n]+/g, "\n").replace(/\n\u3000/g, "　").trim(); 
  const removeNewline = (str: string) => str?.replace(/[\n\t]+/g, "").trim();

  const getHorsePageLatestInformation = async (link: string) => {
    const page = await browser.newPage();

    await Promise.all([
      page.goto(link),
      page.waitForNavigation(),
    ]);

    const head = await page.$("#umaHead h2");
    const nameProp = head && await head.getProperty("textContent");
    const nameValue = nameProp && await nameProp.jsonValue<string>();

    const topBlockList = await page.$$("#umaHead .topBlock li");
    const topBlockListProp = topBlockList && await Promise.all(topBlockList.map(async (item) => await item.getProperty("textContent")));
    const topBlockListValue = topBlockListProp && await Promise.all(topBlockListProp.map(async (prop) => await prop.jsonValue<string>()));
    const topBlockString = removeNewline(topBlockListValue?.join(" ")).replace(/'[\d/]*生/, "");

    const bottomBlockList = await page.$$("#umaHead .btmBlock li");
    const bottomBlockListProp = bottomBlockList && await Promise.all(bottomBlockList.map(async (item) => await item.getProperty("textContent")));
    const bottomBlockListValue = bottomBlockListProp && await Promise.all(bottomBlockListProp.map(async (prop) => await prop.jsonValue<string>()));
    const bottomBlockString = removeNewline(bottomBlockListValue?.join(" ")).replace(/\(BMS.*\)/, "");

    const textList = await page.$$("#umaKinkyo ul.KinkyoList");
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

  const getHorsePhotoLatestInformation = async (link: string) => {
    const page = await browser.newPage();

    await Promise.all([ page.goto(link), page.waitForNavigation(), ]);
    const head = await page.$("#umaHead h2");
    const nameProp = head && await head.getProperty("textContent");
    const nameValue = nameProp && await nameProp.jsonValue<string>();

    const photoLink = await page.$$("#umaPhoto ul.PhotoList a");
    const photoLinkUrlProp = photoLink && photoLink[0] && await photoLink[0].getProperty("href");
    const photoLinkUrlValue = removeTab(photoLinkUrlProp && await photoLinkUrlProp.jsonValue<any>());
    const photoLinkInfoProp = photoLink && photoLink[0] && await photoLink[0].getProperty("textContent");
    const photoLinkInfoValue = removeTab(photoLinkInfoProp && await photoLinkInfoProp.jsonValue<any>());

    await page.waitForTimeout(1000);

    return {
      link,
      name: `${nameValue} Photo`,
      info: photoLinkInfoValue,
      value: photoLinkUrlValue,
    };
  }

  const getHorseVideoLatestInformation = async (link: string) => {
    const page = await browser.newPage();

    await Promise.all([ page.goto(link), page.waitForNavigation(), ]);
    const head = await page.$("#umaHead h2");
    const nameProp = head && await head.getProperty("textContent");
    const nameValue = nameProp && await nameProp.jsonValue<string>();

    const videoPageLink = await page.$$("#umaMovie ul.MovieList a");
    const videoPageLinkUrlProp = videoPageLink && videoPageLink[0] && await videoPageLink[0].getProperty("href");
    const videoPageLinkUrlValue = removeTab(videoPageLinkUrlProp && await videoPageLinkUrlProp.jsonValue<any>());

    await Promise.all([ page.goto(videoPageLinkUrlValue), page.waitForNavigation(), ]);
    const videoTitleHead = await page.$("#content h2");
    const videoTitleProp = videoTitleHead && await videoTitleHead.getProperty("textContent");
    const videoTitleValue = videoTitleProp && await videoTitleProp.jsonValue<string>();

    const mp4Link = await page.$$("#content div.btnmp4 a");
    const mp4LinkUrlProp = mp4Link && mp4Link[0] && await mp4Link[0].getProperty("href");
    const mp4LinkUrlValue = removeTab(mp4LinkUrlProp && await mp4LinkUrlProp.jsonValue<any>());
    
    await page.waitForTimeout(1000);

    return {
      link,
      name: `${nameValue} Video`,
      info: videoTitleValue,
      value: mp4LinkUrlValue,
    };
  }

  const values = [];
  for (const link of links) {
    values.push(await getHorsePageLatestInformation(link));
    values.push(await getHorsePhotoLatestInformation(link));
    values.push(await getHorseVideoLatestInformation(link));
  }
  logger.info("page scraping complete.");

  browser.close();

  return values;
}
