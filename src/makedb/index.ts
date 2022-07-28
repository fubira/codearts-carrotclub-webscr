import 'dotenv/config'
import pouchdb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';
import log4js from 'log4js';
import { readFileSync } from 'fs';
import { exit } from 'process';
import FastGlob from 'fast-glob';
import parse from 'node-html-parser';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';

import { Types } from '../tateyama';
import dayjs from 'dayjs';

pouchdb.plugin(pouchdbFind);
const logger = log4js.getLogger();

const options = [
  { name: 'source', alias: 's', desc: "Source dir of site data", type: String, defaultValue: "./.site" },
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false }, 
];
const args = commandLineArgs(options);

if (args["help"]) {
  console.log(commandLineUsage([{ header: 'convert', optionList: options }]));
  exit(0);
}

if (!args["source"]) {
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

async function parseCourse(info: Types.RaceInfo, entriesHtml: string): Promise<Types.DataCourse> {
  const root = parse(entriesHtml);

  /// レースコース情報取得
  const raceParams = root.querySelectorAll('div.racetitle_sub > p');
  const courseOpt = raceParams[0].textContent.trim(); 
  const courseInfo = raceParams[1].textContent.trim(); 

  const [courseDist, courseState, courseWeather] = courseInfo.split(/\s/);
  const [distance] = courseDist.match(/(\d+)m/);
  const [type, direction] = courseState.match(/\((.*)・(.*)\)/);
  const [weather, condition] = courseWeather.match(/(.*)・(.*)/);

  return {
    id: Number(info.courseId),
    name: info.courseName,
    distance: Number(distance),
    type: type as Types.CourseType,
    direction: direction as Types.CourseDirection,
    weather: weather as Types.CourseWeather,
    condition: condition as Types.CourseCondition,
    option: courseOpt,
  }
}

async function parseEntries(entriesHtml: string): Promise<Types.DataEntry[]> {
  const root = parse(entriesHtml);

  /// 馬情報取得
  const tbody = root.querySelector('table.syutuba_sp tbody');

  if (!tbody) {
    return;
  }

  const tr = tbody.querySelectorAll('tr');

  const result = tr.map((record): Types.DataEntry => {
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
      horseSex: horseSex as Types.HorseSex,
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

async function parseTraining(info: Types.RaceInfo, trainingHtml: string): Promise<Types.DataTraining[]> {
  // 調教画面のHTMLはタグが正しく閉じられていないので調整しておく
  trainingHtml.replace(
    /<table class="default cyokyo" id=""><tbody>/g,
    '</tbody></table><table class="default cyokyo" id=""><tbody>'
  );

  const root = parse(trainingHtml);

  /// レース情報取得
  const trainingBodyList = root.querySelectorAll('table.cyokyo > tbody');

  const result = trainingBodyList.map((tbody): Types.DataTraining => {
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

async function parseResult(info: Types.RaceInfo, resultHtml: string): Promise<Types.DataResult> {
  if (!resultHtml) {
    logger.warn('結果がありません: ', info.date, info.courseName, info.raceNo, info.raceTitle);
    return;
  }
  const root = parse(resultHtml);

  /// レース情報取得
  const resultOrderBody = root.querySelector('table.seiseki tbody');
  const orderList = resultOrderBody.querySelectorAll('tr');
  const order = orderList.map((tr, index) => {
    const horseId = Number(tr.querySelector('td.umaban').textContent)
    return { [index + 1]: horseId };
  });

  const resultRefundBodyList = root.querySelectorAll('table.kako-haraimoshi > tbody');

  const refund: Types.DataResultRefund = {};
  resultRefundBodyList.forEach((tbody) => {
    const refs = tbody.querySelectorAll('tr');

    refs.forEach((tr) => {
      const [typeElement, idsElement, valueElement] = tr.querySelectorAll('td');
      const type = typeElement.textContent.trim();
      const idsContent = idsElement.innerHTML.trim().split(/<br>/);
      const valuesContent = valueElement.innerHTML.trim().split(/<br>/);

      const ids = idsContent.map((v) => v.split('-').map((n) => Number(n)));
      const values = valuesContent.map((v) => Number(v.replace(/[円,]/g, '').trim()));

      if (type === '単勝') {
        refund.win = (refund.win || []).concat(ids.map((horseId, index) => { return { horseId: horseId[0], amount: values[index] } }));
      }
      if (type === '複勝') {
        refund.place = (refund.place || []).concat(ids.map((horseId, index) => { return { horseId: horseId[0], amount: values[index] } }));
      }
      if (type === '馬連') {
        refund.quinella = (refund.quinella || []).concat(ids.map((horseId, index) => { return { horseId: [horseId[0], horseId[1]], amount: values[index] } }));
      }
      if (type === '馬単') {
        refund.exacta = (refund.exacta || []).concat(ids.map((horseId, index) => { return { horseId: [horseId[0], horseId[1]], amount: values[index] } }));
      }
      if (type === 'ワイド') {
        refund.quinellaPlace = (refund.quinellaPlace || []).concat(ids.map((horseId, index) => { return { horseId: [horseId[0], horseId[1]], amount: values[index] } }));
      }
      if (type === '3連複') {
        refund.trio = (refund.trio || []).concat(ids.map((horseId, index) => { return { horseId: [horseId[0], horseId[1], horseId[2]], amount: values[index] } }));
      }
      if (type === '3連単') {
        refund.trifecta = (refund.trifecta || []).concat(ids.map((horseId, index) => { return { horseId: [horseId[0], horseId[1], horseId[2]], amount: values[index] } }));
      }
    });
  });

  return {
    order,
    refund,
  };
}


async function parseFile(file: string) {
  const dataJson = readFileSync(file);
  const { data, info } = JSON.parse(dataJson.toString()) as Types.RaceData;

  logger.info(`${info.date} ${info.courseName}(${info.courseId}) ${info.raceNo}R ${info.raceTitle}`);

  if (data.entries.includes("このレースは中止になりました")) {
    return { cancelled: true }
  }
  const course = await parseCourse(info, data.entries);
  const entries = await parseEntries(data.entries);
  const trainings = await parseTraining(info, data.training);
  const result = await parseResult(info, data.result);

  if (!result || !trainings) {
    console.log('skipped: ', JSON.stringify(course));
    return { cancelled: true };
  }
  
  entries.map((entry) => {
    const training = trainings.find((t) => t.horseId === entry.horseId)
    entry.training = training;
  })

  const id = `${info.date}:${info.courseId}:${info.raceNo}`;
  return {
    _id: id,
    course,
    entries,
    result
  };
}


FastGlob(`${args["source"]}/**/*.json`, { onlyFiles: true }).then(async (files) => {
  const db = new pouchdb('./.db');
  const sortedFiles = files;

  for (const file of sortedFiles) {
    const data = await parseFile(file);
    if (data.cancelled) {
      continue;
    }

    await db.get(data._id).then(async (value) => {
      const _rev = value._rev;
      await db.put({ _rev, ...data });
    }).catch(async () => {
      await db.put(data);
    });
  }

  db.createIndex({ index: { fields: ["course.date"] } });
  db.createIndex({ index: { fields: ["training.horseName"] } });
  db.close();
})
