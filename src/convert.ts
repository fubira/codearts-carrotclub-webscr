import 'dotenv/config'
import log4js from 'log4js';
import { readFileSync } from 'fs';
import { exit } from 'process';
import FastGlob from 'fast-glob';
import parse from 'node-html-parser';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import { RaceData, RaceInfo, DataCourse, DataEntry, CourseType, CourseDirection, CourseCondition, CourseWeather, HorseSex } from './types';

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

async function parseCourse(info: RaceInfo, entriesHtml: string): Promise<DataCourse> {
  const root = parse(entriesHtml);

  /// レースコース情報取得
  const raceParams = root.querySelectorAll('div.racetitle_sub > p');
  const courseOpt = raceParams[0].textContent.trim(); 
  const courseInfo = raceParams[1].textContent.trim(); 

  const [,
    distance,
    type,
    direction,
    weather,
    condition
  ] = courseInfo.match(/(\d+)m\s\((.+)・(.+)\)\s(.+)・(.+?)\s/);

  return {
    id: Number(info.courseId),
    name: info.courseName,
    distance: Number(distance),
    type: type as CourseType,
    direction: direction as CourseDirection,
    weather: weather as CourseWeather,
    condition: condition as CourseCondition,
    option: courseOpt,
  }
}

async function parseEntries(entriesHtml: string): Promise<DataEntry[]> {
  const root = parse(entriesHtml);

  /// レース情報取得
  const raceParams = root.querySelectorAll('div.racetitle_sub > p');
  const raceOpt = raceParams[0].textContent.trim(); 
  const raceCourseInfo = raceParams[1].textContent.trim(); 

  const [,
    courseDistance,
    courseType,
    courseDirection,
    courseAir,
    courseStat
  ] = raceCourseInfo.match(/(\d+)m\s\((.+)・(.+)\)\s(.+)・(.+?)\s/);

  console.log(raceOpt, courseDistance, courseType, courseDirection, courseAir, courseStat);

  /// 馬情報取得
  const tbody = root.querySelector('table.syutuba_sp tbody');

  if (!tbody) {
    return;
  }

  const tr = tbody.querySelectorAll('tr');

  const result = tr.map((record): DataEntry => {
    const bracketId = record.querySelector("td.waku > p").textContent.trim();
    const horseId = record.querySelector("td.umaban").textContent.trim();
    const horseName = record.querySelectorAll("td.left p")[0].textContent.trim();
    const horseSubInfo = record.querySelectorAll("td.left p")[1].textContent.trim();
    const weightInfo = record.querySelectorAll("td.lh1 p")[0].textContent.trim();
    const odds = record.querySelectorAll("td.lh1 p")[1].textContent.trim();
    const oddsRankInfo = record.querySelectorAll("td.lh1 p")[2].textContent.trim();

    const [, horseSex, horseAge, jockyName, handicap] = horseSubInfo.match(/(\S+?)(\d+)\s+(\S+?)\s+(\S+)/);
    const [horseWeight, horseWeightDiff] = weightInfo.replace(/[()]/g, ' ').split(' ');
    const oddsRank = oddsRankInfo.replace('人気', '');

    return {
      bracketId: Number(bracketId),
      horseId: Number(horseId),
      horseName: horseName,
      horseSex: horseSex as HorseSex,
      horseAge: Number(horseAge),
      jockyName: jockyName,
      handicap: Number(handicap),
      horseWeight: Number(horseWeight),
      horseWeightDiff: horseWeightDiff && Number(horseWeightDiff),
      odds: Number(odds),
      oddsRank: Number(oddsRank),
    }
  });

  return result;
}

async function parseFile(file: string) {
  const dataJson = readFileSync(file);
  const { data, info } = JSON.parse(dataJson.toString()) as RaceData;

  logger.info('-------------');
  logger.info(`${info.date} ${info.courseName}(${info.courseId}) ${info.raceNo}R ${info.raceTitle}`);

  const course = await parseCourse(info, data.entries);
  const entries = await parseEntries(data.entries);

  console.log(JSON.stringify(course));
  console.log(JSON.stringify(entries));
}


FastGlob(`${args["root"]}/**/*.json`, { onlyFiles: true }).then((files) => {
  const sortedFiles = files.slice(0, 20);

  Promise.all(sortedFiles.map(async (file) => {
    await parseFile(file);
  }));
})
