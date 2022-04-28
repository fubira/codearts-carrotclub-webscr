import 'dotenv/config'
import log4js from 'log4js';
import { exit } from 'process';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { WebClient } from '@slack/web-api';

import { scraping, ScrapingDataType } from './carrotclub';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const logger = log4js.getLogger();

const options = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false }, 
  { name: 'force-send', type: Boolean, defaultValue: false }, 
  { name: 'no-send', type: Boolean, defaultValue: false }, 
  { name: 'no-sandbox', type: Boolean, defaultValue: false }, 
  { name: 'site-id', alias: 'i', type: String, defaultValue: process.env.SITE_ID || "" }, 
  { name: 'site-pass', alias: 'p', type: String, defaultValue: process.env.SITE_PASS || "" }, 
  { name: 'slack-token', alias: 't', type: String, defaultValue: process.env.SLACK_TOKEN || "" }, 
  { name: 'slack-channel', alias: 'c', type: String, defaultValue: process.env.SLACK_CHANNEL || "" }, 
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

if (!args["slack-token"]) {
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
  const text = (data.info)
    ? `*${data.name}* _${data.info}_ ${data.value}`
    : `*${data.name}* ${data.value}`;

  const client = new WebClient(args["slack-token"]);
  client.chat.postMessage({
    channel: args["slack-channel"],
    text
  });
}

scraping(args["site-id"], args["site-pass"], args["no-sandbox"]).then((scrData: Array<ScrapingDataType>) => {
  let cachedData: Array<ScrapingDataType> = []

  try {
    if (existsSync("./cached.dat")) {
      cachedData = JSON.parse(readFileSync("./cached.dat", { encoding: "utf-8" }));
    }
  } catch (e) {
    logger.error(e);
    exit(0);
  }

  try {
    scrData.forEach((latestData: ScrapingDataType) => {
      const cache: ScrapingDataType = cachedData.find((cachedValue) => (cachedValue.link === latestData.link) && (cachedValue.name === latestData.name));

      if (!cache || cache.value !== latestData.value || args["force-send"]) {
        logger.info("new data found: ", JSON.stringify(latestData));
        const sendData = JSON.parse(JSON.stringify(latestData));
        if (!args["no-send"]) {
          sendMessageToSlack(sendData);
        }
      }

      cachedData = cachedData.filter((cachedValue) => !((cachedValue.link === latestData.link) && (cachedValue.name === latestData.name)));
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
