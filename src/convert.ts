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

async function parseTraining(info: RaceInfo, trainingHtml: string): Promise<any[]> {
  // 調教画面のHTMLはタグが正しく閉じられていないので調整しておく
  trainingHtml.replace(
    /<table class="default cyokyo" id=""><tbody>/g,
    '</tbody></table><table class="default cyokyo" id=""><tbody>'
  );

  const root = parse(trainingHtml);

  /// レース情報取得
  const trainingBodyList = root.querySelectorAll('table.cyokyo > tbody');

  const result = trainingBodyList.map((tbody): any => {
    // 2桁の月日に年を足す
    function monthdayToDate(yeardate: string, monthday: string) {
      let year = yeardate && Number(yeardate.slice(0, 4));
      const raceMonth = yeardate && Number(yeardate.slice(4, 6));

      const [tm, td] = (monthday || '').split('/');
      const month = tm && Number(tm) || 0;
      const day = td && Number(td) || 0;

      if (month > raceMonth) {
        year = year - 1;
      }
      return `${year}/${month}/${day}`;
    }

    const bracketId = Number(tbody.querySelector('td.waku p').textContent);
    const horseId = Number(tbody.querySelector('td.umaban').textContent);
    const horseName = tbody.querySelector('td.kbamei').textContent;
    const comment = tbody.querySelector('td.tanpyo').textContent;
    const status = tbody.querySelector('td.yajirusi').textContent;

    const trainingHeaderList = tbody.querySelectorAll('dl.dl-table');
    const trainingDataList = tbody.querySelectorAll('table.cyokyodata tbody');
    const trainingData = trainingDataList.map((tbody, index) => {
      const trainingHeader = trainingHeaderList[index];
      const headerLeft = trainingHeader.querySelector('dt.left');
      const headerRight = trainingHeader.querySelector('dt.right');
      const [trainingDate, trainingCourse, trainingCourseCondition] = headerLeft.textContent.split(/\s/);
      const trainingComment = headerRight.textContent;
      
      const trainingTimeList = tbody.querySelectorAll('tr.time td');
      const firstValue = trainingTimeList[0].textContent;

      let trainingCount = 1;
      if (firstValue && firstValue.endsWith('回')) {
        trainingTimeList.shift();
        trainingCount = Number(firstValue.replace('回', ''));
      }

      const [trainingCourseElement] = trainingTimeList.slice(-1);
      const trainingRapList = trainingTimeList.slice(0, -1);
      const trainingPosition = trainingCourseElement?.textContent;
  
      const trainingRap = trainingRapList.map((td) => {
        return (td.textContent && Number(td.textContent)) || null;
      });
      const trainingPartner = tbody.querySelector('tr.awase td.left')?.textContent;

      return {
        trainingDate: monthdayToDate(info.date, trainingDate),
        trainingCourse,
        trainingCourseCondition,
        trainingComment,
        trainingCount,
        trainingPosition,
        trainingRap,
        trainingPartner,
      };
    });

    return {
      bracketId,
      horseId,
      horseName,
      comment,
      status,
      trainingData
    };
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
  const training = await parseTraining(info, data.training); 

  console.log(JSON.stringify(course, null, 2));
  console.log(JSON.stringify(entries, null, 2));
  console.log(JSON.stringify(training, null, 2));
}


FastGlob(`${args["root"]}/**/*.json`, { onlyFiles: true }).then((files) => {
  const sortedFiles = files.slice(0, 1);

  Promise.all(sortedFiles.map(async (file) => {
    await parseFile(file);
  }));
})
