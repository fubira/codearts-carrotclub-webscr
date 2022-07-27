import 'dotenv/config'
import log4js from 'log4js';
import { exit } from 'process';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import { scraping, ScrapingInfoType, ScrapingDataType } from './keibabook';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';

const logger = log4js.getLogger();

const options = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false }, 
  { name: 'no-sandbox', type: Boolean, defaultValue: false }, 
  { name: 'site-id', alias: 'i', type: String, defaultValue: process.env.SITE_ID || "" }, 
  { name: 'site-pass', alias: 'p', type: String, defaultValue: process.env.SITE_PASS || "" }, 
  { name: 'proxy', alias: 'x', type: String, defaultValue: process.env.HTTP_PROXY || "" }, 
  { name: 'year', alias: 'y', type: String, defaultValue: `${new Date().getFullYear()}` }, 
];
const args = commandLineArgs(options);

if (args["help"]) {
  console.log(commandLineUsage([{ header: 'webscr', optionList: options }]));
  exit(0);
}

if (!args["site-id"] || !args["site-pass"]) {
  console.log("Please set Site ID and Password.");
  console.log(commandLineUsage([{ header: 'webscr', optionList: options }]));
  exit(0);
}

log4js.configure({
  appenders: {
    out: {
      type: 'stdout'
    },
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'debug'
    }
  }
});

/**
 * 該当ページの既に取得済みのスクレイピング結果を返すハンドラ
 * 
 * @param info 
 */
const onGetCached = (info: ScrapingInfoType): ScrapingDataType => {
  const { date, courseName, raceNo, raceTitle } = info;
  const dir = `./data/${date}`;
  const fileName = `${courseName}${String(raceNo).padStart(2, '0')}_${raceTitle}`;
  const data = readFileSync(`${dir}/${fileName}.json`);

  try {
    const json = JSON.parse(data.toString())?.data as ScrapingDataType;
    return json;
  } catch (err) {
    logger.error(err);
  }

  return undefined;
}

/**
 * スクレイピング結果を保存するハンドラ
 * @param info 
 * @param data 
 */
const onWrite = (info: ScrapingInfoType, data: ScrapingDataType) => {
  const { date, courseName, raceNo, raceTitle } = info;
  const dir = `./data/${date}`;
  const fileName = `${courseName}${String(raceNo).padStart(2, '0')}_${raceTitle}`;

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(`${dir}/${fileName}.json`, JSON.stringify({info, data}, undefined, 2));
}

scraping(onGetCached, onWrite, args).catch((err)=> {
  logger.error(err);
}).finally(() => {
  logger.info("complete.");
});

