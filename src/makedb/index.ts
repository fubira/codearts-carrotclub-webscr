import 'dotenv/config'
import dayjs from 'dayjs';
import glob from 'fast-glob';
import parse from 'node-html-parser';
import { readFileSync } from 'fs';

import TateyamaDB from 'db';
import logger from 'logger';

import { Types } from 'tateyama';

async function parseCourse(_info: Types.ScrapeRaceInfo, entriesHtml: string): Promise<Types.DBCourse> {
  const root = parse(entriesHtml);

  // レースコース情報取得
  const raceParams = root.querySelectorAll('div.racetitle_sub > p');
  const courseOpt = raceParams[0].textContent.trim(); 
  const courseInfo = raceParams[1].textContent.trim(); 

  const [courseDist, courseState, courseWeather] = courseInfo.split(/\s/);
  const [distance] = courseDist.match(/(\d+)m/);
  const [type, direction] = courseState.match(/\((.*)・(.*)\)/);
  const [weather, condition] = courseWeather.match(/(.*)・(.*)/);

  return {
    distance: Number(distance),
    type: type as Types.CourseType,
    direction: direction as Types.CourseDirection,
    weather: weather as Types.CourseWeather,
    condition: condition as Types.CourseCondition,
    option: courseOpt,
  }
}

async function parseEntries(_info: Types.ScrapeRaceInfo, entriesHtml: string): Promise<Types.DBEntry[]> {
  const root = parse(entriesHtml);

  /// 馬情報取得
  const tbody = root.querySelector('table.syutuba_sp tbody');
  if (!tbody) {
    return;
  }

  const tr = tbody.querySelectorAll('tr');

  const result = tr.map((record): Types.DBEntry => {
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

async function parseTraining(info: Types.ScrapeRaceInfo, trainingHtml: string): Promise<Types.DBTraining[]> {
  // 調教画面のHTMLはタグが正しく閉じられていないので調整しておく
  trainingHtml.replace(
    /<table class="default cyokyo" id=""><tbody>/g,
    '</tbody></table><table class="default cyokyo" id=""><tbody>'
  );

  const root = parse(trainingHtml);

  /// レース情報取得
  const trainingBodyList = root.querySelectorAll('table.cyokyo > tbody');

  const result = trainingBodyList.map((tbody): Types.DBTraining => {
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
      const infoPrevious = trainingInfo.querySelectorAll('dt');
      const infoLeft = trainingInfo.querySelector('dt.left');
      const infoRight = trainingInfo.querySelector('dt.right');
      const [
        trainingDate,
        trainingCourse,
        trainingCourseCondition
      ] = infoLeft.textContent.split(/\s/);
      const trainingComment = infoRight.textContent;
      const trainingPrev = infoPrevious[0].textContent.includes("前回");

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
      const trainingLapGap: Array<Types.DBLapGap> = [];

      let totalGap = 0;
      lapValue.forEach((value, index, array) => {
        const lap = Math.round(value * 10) / 10;
        const nextLap = (array.length > index) ? array[index + 1] : 0.0;
        const gap = nextLap ? Math.round((lap - nextLap) * 10 ) / 10 : lap;

        if (lap > 0) {
          totalGap = Math.round((totalGap + gap) * 10) / 10;
          trainingLapGap.push({ lap, gap, totalGap });
        }
      });

      const trainingPosition = positionElement?.textContent;
      const trainingPartner = tbody.querySelector('tr.awase td.left')?.textContent;

      return {
        date: monthdayToDate(info.date, trainingDate),
        previous: trainingPrev,
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

async function parseResult(info: Types.ScrapeRaceInfo, resultHtml: string): Promise<Types.DBResult> {
  if (!resultHtml) {
    logger.warn('結果がありません: ', info.date, info.courseName, info.raceNo, info.raceTitle);
    return;
  }
  const root = parse(resultHtml);

  /// レース情報取得
  const resultOrderBody = root.querySelector('table.seiseki tbody');
  const orderList = resultOrderBody.querySelectorAll('tr');
  const detail: Types.DBResultDetail[] = orderList.map((tr) => {
    const TimeStringToSec = (timeStr: string) => {
      const time = timeStr.trim();

      // 競争中止等で空になる場合がある
      if (!time.trim()) {
        return 0;
      }

      // "9.99.9" という時間表示を秒に直す
      const [, minStr, secStr] = timeStr.trim().match(/([0-9]+)?\.?([0-9][0-9]\.[0-9])/);
      const min = (minStr && Number(minStr)) || 0;
      const sec = (secStr && Number(secStr)) || 0;
      return min * 60 + sec;
    }

    const tds = tr.querySelectorAll('td');

    const tdOrder = tds[0];
    const tdHorseId = tds[2];
    const tdHorseInfo = tds[4];
    const tdTime = tds[5];
    const tdTimeValues = tdTime.querySelectorAll('p');

    const order = Number(tdOrder.textContent);
    const horseId = Number(tdHorseId.textContent)
    const timeSec = TimeStringToSec(tdTimeValues[0].textContent);
    const last3fSec = TimeStringToSec(tdTimeValues[1].textContent.replace(/[()]/g, ''));

    //
    // 道中ポジションを数値に変換する
    //
    // 不利を受けた際の位置取りは丸囲い数値で表示されるため、数字に戻すには変換が必要
    //
    const getPeriodPosition = (pstr: string) => {
      const str = pstr
        .replace(/[\u2460-\u2468]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x242F)) // ①-⑨
        .replace(/[\u2469-\u2472]/g, (ch) => `1${String.fromCharCode(ch.charCodeAt(0) - 0x2439)}`); // ⑩-⑲
      return Number(str);
    }
    // 道中不利があったかどうか
    const getPeriodDamage = (pstr: string): boolean => {
      return !!pstr.match(/[\u2460-\u2472]/);
    }
    const periodElement = tdHorseInfo.querySelectorAll('ul.tuka li').filter((v) => v.textContent);
    const period = periodElement.map((p) => {
      const position = getPeriodPosition(p.textContent);
      const disadvantage = getPeriodDamage(p.textContent);
      return { position, ...disadvantage && { disadvantage } };
    });

    return {
      horseId,
      order,
      period,
      timeSec,
      last3fSec,
    };
  }).sort((a, b) => a.horseId - b.horseId);

  const resultRefundBodyList = root.querySelectorAll('table.kako-haraimoshi > tbody');

  const refund: Types.DBResultRefund = {};
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
    detail,
    refund,
  };
}


async function parseScrapeFile(file: string): Promise<Types.DBRace> {
  const dataJson = readFileSync(file);
  const { rawHTML, ...data } = JSON.parse(dataJson.toString()) as Types.ScrapeRaceData;

  logger.info(`${data.date} ${data.courseName}(${data.courseId}) ${data.raceNo}R ${data.raceTitle}`);

  if (rawHTML.entries.includes("このレースは中止になりました")) {
    return undefined;
  }

  const course = await parseCourse(data, rawHTML.entries);
  const entries = await parseEntries(data, rawHTML.entries);
  const trainings = await parseTraining(data, rawHTML.training);
  const result = await parseResult(data, rawHTML.result);

  if (!result || !trainings) {
    return undefined;
  }
  
  entries.map((entry) => {
    const training = trainings.find((t) => t.horseId === entry.horseId)
    entry.training = training;
  })

  const id = `${data.date}:${data.courseId}:${data.raceNo}`;
  return {
    _id: id,
    date: data.date,
    courseId: Number(data.courseId),
    courseName: data.courseName,
    raceNo: Number(data.raceNo),
    raceTitle: data.raceTitle,
    course,
    entries,
    result
  };
}


export default async (options: any) => {
  const sourceDir = options.sourceDir;

  const db = await TateyamaDB.instance();
  const files = await glob(`${sourceDir}/**/*.json`, { onlyFiles: true });
  
  for (const file of files) {
    const data = await parseScrapeFile(file);

    if (!data) {
      continue;
    }

    try {
      const { _rev } = await db.get(data._id);

      await db.put({ _rev, ...data });
    } catch (err) {
      await db.put({ ...data });
    }
  }

  await TateyamaDB.close();
}
