import 'dotenv/config'
import log4js from 'log4js';
import { readFileSync } from 'fs';
import { exit } from 'process';
import FastGlob from 'fast-glob';
import parse from 'node-html-parser';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import { RaceData, RaceInfo, DataCourse, DataEntry, CourseType, CourseDirection, CourseCondition, CourseWeather, HorseSex, DataTraining } from './types';
import dayjs from 'dayjs';

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

async function parseTraining(info: RaceInfo, trainingHtml: string): Promise<DataTraining[]> {
  // 調教画面のHTMLはタグが正しく閉じられていないので調整しておく
  trainingHtml.replace(
    /<table class="default cyokyo" id=""><tbody>/g,
    '</tbody></table><table class="default cyokyo" id=""><tbody>'
  );

  const root = parse(trainingHtml);

  /// レース情報取得
  const trainingBodyList = root.querySelectorAll('table.cyokyo > tbody');

  const result = trainingBodyList.map((tbody): DataTraining => {
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
      return dayjs(new Date(year, month-1, day)).format('YYYYMMDD');
    }

    const bracketId = Number(tbody.querySelector('td.waku p').textContent);
    const horseId = Number(tbody.querySelector('td.umaban').textContent);
    const horseName = tbody.querySelector('td.kbamei').textContent;
    const comment = tbody.querySelector('td.tanpyo').textContent;
    const status = tbody.querySelector('td.yajirusi').textContent;
    
    // 調教情報とタイムデータがHTML的に並列に並んでいて
    // まとめられないのでやむなくindexでそろえる
    const trainingInfoElements = tbody.querySelectorAll('dl.dl-table');
    const trainingDataElements = tbody.querySelectorAll('table.cyokyodata tbody');

    const logs = trainingDataElements.map((tbody, index) => {
      // 追切1本分の情報取得
      const trainingInfo = trainingInfoElements[index];

      // 情報枠 left(日付、コース、馬場状態)、right(コメント) の取得
      const infoLeft = trainingInfo.querySelector('dt.left');
      const infoRight = trainingInfo.querySelector('dt.right');
      const [
        trainingDate,
        trainingCourse,
        trainingCourseCondition
      ] = infoLeft.textContent.split(/\s/);
      const trainingComment = infoRight.textContent;

      // 追切1本分のタイム情報
      const trainingTimeList = tbody.querySelectorAll('tr.time td');
      const firstValue = trainingTimeList[0].textContent;

      let countValue = undefined;
      let lapValue = undefined;

      if (firstValue && firstValue.endsWith('回')) {
        // 先頭に回数のあるデータは坂路
        // [回数] [4F] [3F] [2F] [1F] [空白]
        countValue = Number(firstValue.replace('回', ''));
        lapValue = trainingTimeList.slice(1, -1).map((el) => Number(el.textContent));
      } else {
        // 先頭から数字が入っている、あるいは空のデータはウッドその他
        // [6F] [5F] [4F] [3F] [1F] [位置]
        countValue = 0;
        lapValue = trainingTimeList.slice(0, -1).map((el) => Number(el.textContent));
        const [last3, last1] = lapValue.slice(-2);
        const avg3 = last3 / 3;
        const lastPower = avg3 / last1;
        const diff = (avg3 - last1) / lastPower;

        const last2 = avg3 * 2 - diff;

        // 算出した2Fタイムを追加する
        lapValue.splice(-1, 0, last2);
        console.log({ lapValue, last1, last3, avg3, last2 });
      }

      const [positionElement] = trainingTimeList.slice(-1);
      const trainingCount = countValue;
      const trainingLapGap: Array<{ lap?: number, gap?: number }> = [];


      lapValue.forEach((value, index, array) => {
        const lap = Math.round(value * 10) / 10;
        const nextLap = (array.length > index) ? array[index + 1] : 0.0;
        const gap = nextLap ? Math.round((lap - nextLap) * 10 ) / 10 : lap;

        if (lap > 0) {
          trainingLapGap.push({ lap, gap });
        }
      });

      const trainingPosition = positionElement?.textContent;
      const trainingPartner = tbody.querySelector('tr.awase td.left')?.textContent;

      return {
        date: monthdayToDate(info.date, trainingDate),
        course: trainingCourse,
        condition: trainingCourseCondition,
        comment: trainingComment,
        count: trainingCount,
        position: trainingPosition,
        lap: trainingLapGap,
        partner: trainingPartner,
      };
    });

    return {
      bracketId,
      horseId,
      horseName,
      comment,
      status,
      logs,
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
  const trainings = await parseTraining(info, data.training);
  
  entries.map((entry) => {
    const training = trainings.find((t) => t.horseId === entry.horseId)
    entry.training = training;
  })

  console.log(JSON.stringify(course, null, 2));
  console.log(JSON.stringify(entries, null, 2));
}


FastGlob(`${args["root"]}/**/*.json`, { onlyFiles: true }).then((files) => {
  const sortedFiles = files.slice(0, 1);

  Promise.all(sortedFiles.map(async (file) => {
    await parseFile(file);
  }));
})
