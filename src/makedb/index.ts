import 'dotenv/config'
import dayjs from 'dayjs';
import glob from 'fast-glob';
import parse from 'node-html-parser';
import { readFileSync } from 'fs';

import { Scrape } from 'scrape';
import { DB, Data, Helper } from 'tateyama';

import logger from 'logger';

async function parseCourse(info: Scrape.ScrapeRaceInfo, entriesHtml: string): Promise<Data.Course> {
  const root = parse(entriesHtml);

  // レースコース情報取得
  const raceParams = root.querySelectorAll('div.racetitle_sub > p');
  const courseOpt = raceParams[0].textContent.trim(); 
  const courseInfo = raceParams[1].textContent.trim(); 

  const [courseDist, courseState, courseWeather] = courseInfo.split(/\s/);
  const [distance] = courseDist.match(/(\d+)/);
  const [type, direction] = courseState.match(/\((.*)・(.*)\)/);
  const [weather, condition] = courseWeather && (courseWeather.match(/(.*)・(.*)/)) || [];

  return {
    distance: Number(distance),
    type: type as Data.CourseType,
    id: Number(info.courseId),
    name: info.courseName,
    direction: direction as Data.CourseDirection,
    weather: weather as Data.CourseWeather,
    condition: condition as Data.CourseCondition,
    option: courseOpt,
  }
}

async function parseEntries(_info: Scrape.ScrapeRaceInfo, entriesHtml: string): Promise<Data.Entry[]> {
  const root = parse(entriesHtml);

  /// 馬情報取得
  const tbody = root.querySelector('table.syutuba_sp tbody');
  if (!tbody) {
    return;
  }

  const tr = tbody.querySelectorAll('tr');

  const result = tr.map((record): Data.Entry => {
    const bracketId = record.querySelector("td.waku > p")?.textContent.trim();
    const horseId = record.querySelector("td.umaban")?.textContent.trim();
    const horseName = record.querySelectorAll("td.left p")[0]?.textContent.trim();
    const horseSubInfo = record.querySelectorAll("td.left p")[1]?.textContent.trim();
    const weightInfo = record.querySelectorAll("td.lh1 p")[0]?.textContent.trim();
    const odds = record.querySelectorAll("td.lh1 p")[1]?.textContent.trim();
    const oddsRankInfo = record.querySelectorAll("td.lh1 p")[2]?.textContent.trim();

    const [, horseSex, horseAge, jockyName, handicap] = horseSubInfo.match(/(\S+?)(\d+)\s+(\S+?)\s+(\S+)/);
    const [horseWeight, horseWeightDiff] = weightInfo && (weightInfo.replace(/[()]/g, ' ').split(' ')) || [];
    const oddsRank = oddsRankInfo?.replace('人気', '');

    return {
      bracketId: Number(bracketId),
      horseId: Number(horseId),
      horseName: horseName,
      horseSex: horseSex as Data.HorseSex,
      horseAge: Number(horseAge),
      jockyName: jockyName,
      handicap: Number(handicap),
      horseWeight: Number(horseWeight),
      horseWeightDiff: horseWeightDiff && Number(horseWeightDiff),
      odds: (odds === "☆" && 50.0) || Number(odds),
      oddsRank: (oddsRank && Number(oddsRank)) || 0,
    }
  });

  // OddsRankがない場合自分で測る 
  result.sort((a, b) => a.odds - b.odds).forEach((a, index) => a.oddsRank === 0 && (a.oddsRank = index + 1));

  return result;
}

async function parseDetail(_info: Scrape.ScrapeRaceInfo, detailHtml: string): Promise<Data.Detail[]> {
  const root = parse(detailHtml);

  /// 馬情報取得
  const table = root.querySelector('table.noryoku');
  if (!table) {
    return;
  }
/*
  for (let id = 0; id < 18; id ++) {
    const tr = table.querySelector(`tr.js-umaban${String(id + 1).padStart(2, '0')}`);

    const horseId = tr.querySelector("td.umaban span")?.textContent.trim();
    const horseName = tr.querySelector("span.kbamei").textContent.trim();
    const horseSireName = tr.querySelector("span.tkbamei").textContent.trim();
    const horseBMSName = tr.querySelector("span.htlbamei_small").textContent.trim();
    const htotal = tr.querySelector("span.htotal").textContent.trim();
    const orderRecord = htotal.split('-').map((v) => Number(v));

    for (let resent = 0; resent < 3; resent = resent + 1) {
      const tdResent = tr.querySelector(`td.js-zensou${resent + 1}`);

      const urlDate = tdResent.querySelector('span.racemei a').getAttribute('href').split('/').slice(-1);
      urlDate

    }

    const odds = record.querySelectorAll("td.lh1 p")[1]?.textContent.trim();
    const oddsRankInfo = record.querySelectorAll("td.lh1 p")[2]?.textContent.trim();

  }
*/
  
  return [];
}

async function parseTraining(info: Scrape.ScrapeRaceInfo, trainingHtml: string): Promise<Data.Training[]> {
  // 調教画面のHTMLはタグが正しく閉じられていないので調整しておく
  trainingHtml.replace(
    /<table class="default cyokyo" id=""><tbody>/g,
    '</tbody></table><table class="default cyokyo" id=""><tbody>'
  );

  const root = parse(trainingHtml);

  /// レース情報取得
  const trainingBodyList = root.querySelectorAll('table.cyokyo > tbody');

  const result = trainingBodyList.map((tbody): Data.Training => {
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
        // 2Fは補完してデータとしては4F-1Fを使う
        countValue = 0;
        lapValue = trainingTimeList.slice(2, -1).map((el) => Number(el.textContent));
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
      const trainingLapGap: Array<Data.TrainingLap> = [];

      let prevGap = 0;
      lapValue.forEach((value, index, array) => {
        const lap = Helper.Round2(value);
        const nextLap = (array.length > index) ? array[index + 1] : 0.0;
        const gap = nextLap ? Helper.Round2(lap - nextLap) : lap;
        const accel = prevGap !== 0 ? Helper.Round2(prevGap - gap) : 0;

        if (lap > 0) {
          trainingLapGap.push({ lap, gap, accel });
          prevGap = gap;
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

async function parseResult(info: Scrape.ScrapeRaceInfo, resultHtml: string): Promise<Data.Result> {
  if (!resultHtml) {
    logger.warn('結果がありません: ', info.date, info.courseName, info.raceNo, info.raceTitle);
    return;
  }
  const root = parse(resultHtml);

  /// レース情報取得
  const resultOrderBody = root.querySelector('table.seiseki tbody');
  const orderList = resultOrderBody.querySelectorAll('tr');

  // 勝ち馬のタイム
  let winningTime = 0.0;

  const detail: Data.ResultDetail[] = orderList.map((tr, index) => {
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
    const timeText = tdTimeValues[0].textContent;
    const timeSec = TimeStringToSec(timeText);
    const last3fText = tdTimeValues[1].textContent === '大差' ? '(60.0)': tdTimeValues[1].textContent;
    const last3fSec = TimeStringToSec(last3fText.replace(/[()]/g, ''));
    if (index === 0) {
      winningTime = timeSec;
    }
    const timeDiffSec = timeSec - winningTime; 

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
      timeDiffSec,
    };
  }).sort((a, b) => a.horseId - b.horseId);

  const resultRefundBodyList = root.querySelectorAll('table.kako-haraimoshi > tbody');

  const refund: Data.ResultRefund = {};
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


async function parseScrapeFile(file: string): Promise<Data.Race> {
  const dataJson = readFileSync(file);
  const { rawHTML, ...data } = JSON.parse(dataJson.toString()) as Scrape.ScrapeRaceData;

  logger.info(`${data.date} ${data.courseName}(${data.courseId}) ${data.raceNo}R ${data.raceTitle}`);

  if (rawHTML.entries.includes("このレースは中止になりました")) {
    return undefined;
  }

  const course = await parseCourse(data, rawHTML.entries);
  const entries = await parseEntries(data, rawHTML.entries);
  const details = await parseDetail(data, rawHTML.detail);
  const trainings = await parseTraining(data, rawHTML.training);
  const result = await parseResult(data, rawHTML.result);

  if (!trainings) {
    return undefined;
  }
  
  entries.map((entry) => {
    const training = trainings.find((t) => t.horseId === entry.horseId)
    entry.training = training;
    const detail = details.find((t) => t.horseId === entry.horseId)
    entry.detail = detail;
  })

  const id = `${data.date}:${data.courseId}:${data.raceNo}`;
  return {
    _id: id,
    date: data.date,
    raceNo: Number(data.raceNo),
    raceTitle: data.raceTitle,
    course,
    entries,
    result
  };
}

export default async (options: any) => {
  const sourceDir = options.sourceDir;
  const dateDir = options.date || '**'
  console.log(dateDir, options);

  const db = await DB.instance();
  const files = await glob(`${sourceDir}/${dateDir}/*.json`, { onlyFiles: true });
  
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

  await DB.close();
}
