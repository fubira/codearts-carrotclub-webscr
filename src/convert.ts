import 'dotenv/config'
import log4js from 'log4js';
import { exit } from 'process';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import { scraping, ScrapingInfoType, ScrapingDataType } from './keibabook';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import FastGlob from 'fast-glob';

const logger = log4js.getLogger();

const options = [
  { name: 'root', desc: "Root dir of data",  type: String, multiple: true, defaultOption: true },
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false }, 
];
const args = commandLineArgs(options);

if (args["help"]) {
  console.log(commandLineUsage([{ header: 'convert', optionList: options }]));
  exit(0);
}

if (!args["root"]) {
  console.log(commandLineUsage([{ header: 'convert', optionList: options }]));
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

async function parseFile(file: string) {

}


FastGlob(`${args["root"]}/**/*.json`, { onlyFiles: true }).then((files) => {
  const sortedFiles = files.slice(0, 5);

  Promise.all(sortedFiles.map(async (file) => {
    await parseFile(file);
  }));
})
