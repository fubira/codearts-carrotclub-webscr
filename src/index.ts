import 'dotenv/config'
import log4js from 'log4js';
import { exit } from 'process';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import { scraping, ScrapingInfoType, ScrapingDataType } from './keibabook';
import { mkdirSync, writeFileSync, existsSync } from 'fs';

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
 * 該当ページのスクレイピングを実行するかのチェック
 * 
 * @param info 
 * @returns trueならば実行 falseならば処理をスキップ
 */
const onCheck = (info: ScrapingInfoType) => {
  const { date, courseName, raceNo, raceTitle } = info;
  const dir = `./data/${date}`;
  const fileName = `${courseName}${String(raceNo).padStart(2, '0')}_${raceTitle}`;

  return !existsSync(`${dir}/${fileName}.json`);
}

const onWrite = (info: ScrapingInfoType, data: ScrapingDataType) => {
  const { date, courseName, raceNo, raceTitle } = info;
  const dir = `./data/${date}`;
  const fileName = `${courseName}${String(raceNo).padStart(2, '0')}_${raceTitle}`;
  logger.info(`${dir}/${fileName}`);

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(`${dir}/${fileName}.json`, JSON.stringify({info, data}, undefined, 2));
}

scraping(onCheck, onWrite, args).catch((err)=> {
  logger.error(err);
}).finally(() => {
  logger.info("complete.");
});

