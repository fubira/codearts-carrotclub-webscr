import 'dotenv/config'
import log4js from 'log4js';
import { exit } from 'process';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import { scraping } from './keibabook';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { Types } from '../tateyama';

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
const onGetCached = (info: Types.RaceInfo): Types.RaceRawData => {
  const { date, courseName, raceNo, raceTitle } = info;
  const dir = `./data/${date}`;
  const fileName = `${courseName}${String(raceNo).padStart(2, '0')}_${raceTitle}`;

  if (existsSync(`${dir}/${fileName}.json`)) {
    try {
      const data = readFileSync(`${dir}/${fileName}.json`);
      const rawData = JSON.parse(data.toString())?.data as Types.RaceRawData;
      return rawData;
    } catch (err) {
      logger.error(err);
    }
  }

  return undefined;
}

/**
 * スクレイピング結果を保存するハンドラ
 * @param data 
 */
const onWrite = (data: Types.RaceData) => {
  const { date, courseName, raceNo, raceTitle } = data.info;
  const dir = `./data/${date}`;
  const fileName = `${courseName}${String(raceNo).padStart(2, '0')}_${raceTitle}`;

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(`${dir}/${fileName}.json`, JSON.stringify(data, undefined, 2));
}

scraping(onGetCached, onWrite, args).catch((err)=> {
  logger.error(err);
}).finally(() => {
  logger.info("complete.");
});

