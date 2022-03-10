import 'dotenv/config'
import log4js from 'log4js';
import { exit } from 'process';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { WebClient } from '@slack/web-api';

import { scraping, ScrapingDataType } from './carrotclub';
import { readFileSync, writeFileSync } from 'fs';

const logger = log4js.getLogger();

const options = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false }, 
  { name: 'force', type: Boolean, defaultValue: false }, 
  { name: 'siteId', alias: 'i', type: String, defaultValue: process.env.SITE_ID || "" }, 
  { name: 'sitePass', alias: 'p', type: String, defaultValue: process.env.SITE_PASS || "" }, 
  { name: 'slackToken', alias: 't', type: String, defaultValue: process.env.SLACK_TOKEN || "" }, 
  { name: 'slackChannel', alias: 'c', type: String, defaultValue: process.env.SLACK_CHANNEL || "" }, 
];
const args = commandLineArgs(options);

if (args.help) {
  console.log(commandLineUsage([{ header: 'webscr', optionList: options }]));
  exit(0);
}

if (!args.siteId || !args.sitePass) {
  console.log("Please set Site ID and Password.");
  console.log(commandLineUsage([{ header: 'webscr', optionList: options }]));
  exit(0);
}

if (!args.slackToken) {
  console.log("Please set SlackToken.");
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

function sendMessageToSlack(data: ScrapingDataType) {
  const client = new WebClient(args.slackToken);
  client.chat.postMessage({ channel: args.slackChannel, text: `*${data.name}* _${data.info}_\n${data.value}` });
}

scraping(args.siteId, args.sitePass).then((scrData: Array<ScrapingDataType>) => {
  let cachedData: Array<ScrapingDataType> = []

  try {
    cachedData = JSON.parse(readFileSync("./cached.dat", { encoding: "utf-8" }));
  } catch (e) {
    logger.error(e);
    exit(0);
  }

  try {
    scrData.forEach((latestData) => {
      const cache = cachedData.find((cachedValue) => cachedValue.link === latestData.link);

      if (!cache || cache.name !== latestData.name || cache.value !== latestData.value || args.force) {
        logger.info("new data found: ", JSON.stringify(latestData));
        sendMessageToSlack(latestData);
      }

      cachedData = cachedData.filter((cachedValue) => cachedValue.link !== latestData.link);
      cachedData.push(latestData);
    })
  } catch (e) {
    logger.error(e);
    exit(0);
  }

  try {
    writeFileSync("./cached.dat", JSON.stringify(cachedData, null, 2));
  } catch (e) {
    logger.error(e);
    exit(0);
  }

  logger.info("complete.");
});
