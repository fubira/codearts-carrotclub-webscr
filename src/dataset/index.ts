import { writeFileSync } from 'fs';

import logger from 'logger';

import TateyamaDB from 'db';
import { Types, Helper } from 'tateyama';

/**
 * 調教内容を区別するためのIDを作成
 * 調教場・馬場状態・調教コメントごとに同一のIDとなる
 * @param log 
 * @returns 
 */
function makeTrainingKey(log: Types.DBTrainingLog) {
  const comment = (
    log.comment.includes('一杯') && '一杯') ||
    ((log.comment.includes('強め') || log.comment.includes('仕掛')) && '強め') ||
    '馬なり';
  const condition = log.condition.slice(0, 1) || '良'
  const course = log.course

  return `${course}_${condition}_${comment}`;
}

/**
 * 調教タイム基準値の作成
 * @param docs 
 */
export function generateTrainingLapBase(docs: Types.DBRace[]) {
  const lapTotal: { [key: string]: Array<number>[] } = {};

  docs.forEach((doc) => {
    doc.entries.forEach((entry) => {
      entry.training.logs.forEach((log) => {
        if (!log) {
          return;
        }
        const id = makeTrainingKey(log);
        if (log.lap.length > 0) {
          lapTotal[id] = lapTotal[id] || [new Array<number>(), new Array<number>(), new Array<number>(), new Array<number>()];
          const last4f = log.lap.slice(-4);
          log.lap[0] && lapTotal[id][0].push(last4f[0].lap || 60);
          log.lap[1] && lapTotal[id][1].push(last4f[1].lap || 45);
          log.lap[2] && lapTotal[id][2].push(last4f[2].lap || 30);
          log.lap[3] && lapTotal[id][3].push(last4f[3].lap || 15);
        }
      });
    });
  });

  const result: { [key: string]: number[] } = {};

  /**
   * 調教IDごとの平均値をとる
   */
  Object.keys(lapTotal).map((trainingId) => {
    const lap0 = Helper.RoundTime(lapTotal[trainingId][0].reduce((prev, curr) => prev + curr, 0) / lapTotal[trainingId][0].length);
    const lap1 = Helper.RoundTime(lapTotal[trainingId][1].reduce((prev, curr) => prev + curr, 0) / lapTotal[trainingId][1].length);
    const lap2 = Helper.RoundTime(lapTotal[trainingId][2].reduce((prev, curr) => prev + curr, 0) / lapTotal[trainingId][2].length);
    const lap3 = Helper.RoundTime(lapTotal[trainingId][3].reduce((prev, curr) => prev + curr, 0) / lapTotal[trainingId][3].length);

    // console.log(`trainingId:${trainingId} length:${lapTotal[trainingId][0].length} value: ${[lap0, lap1, lap2, lap3]}`);
    result[trainingId] = [lap0, lap1, lap2, lap3];
  });

  return result;
}

export function generateDatasetAll(docs: Types.DBRace[], lapAvg: { [trainingId: string]: number[]}) {
  return docs.flatMap((data) => {
    const result = data.entries.map((entry) => {
      const horseId = entry.horseId;
      const result = data.result.detail.find((d) => d.horseId === horseId);

      /**
       * 競争成績を含む情報
       * 学習時には取り除いておかないとデータが狂う
       */
      const resultScratch = (!result || !result.timeSec) ? 1 : 0
      const resultTimeRate = Helper.CalcTimeRate(result.timeSec, data.course.distance);
      const resultTimeDiffSec = Helper.RoundTime(result.timeDiffSec);

      const horseWeightDiff = entry.horseWeightDiff;
      const horseHandicap = entry.handicap;
  
      const presentTraining = entry.training?.logs.slice(-1)?.[0];
      const presentTrainingId = presentTraining && makeTrainingKey(presentTraining);
      const presentTrainingBase = presentTraining && lapAvg[presentTrainingId];
      const fastestTraining = entry.training?.logs.slice(1).sort((a, b) => a.lap[1]?.lap - b.lap[1]?.lap )[0];
      const fastestTrainingId = fastestTraining && makeTrainingKey(fastestTraining);
      const fastestTrainingBase = fastestTraining && lapAvg[fastestTrainingId];
      const lastTraining = entry.training?.logs.slice(1)?.[0];
      const lastTrainingId = lastTraining && makeTrainingKey(lastTraining);
      const lastTrainingBase = lastTraining && lapAvg[lastTrainingId];
  
      const presentTrainingDiff4f = (presentTraining && presentTraining.lap[0]) ? Helper.RoundTime(presentTraining.lap.slice(-4)[0].lap - presentTrainingBase[0]) : 0;
      const presentTrainingDiff3f = (presentTraining && presentTraining.lap[1]) ? Helper.RoundTime(presentTraining.lap.slice(-4)[1].lap - presentTrainingBase[1]) : 0;
      const presentTrainingDiff2f = (presentTraining && presentTraining.lap[2]) ? Helper.RoundTime(presentTraining.lap.slice(-4)[2].lap - presentTrainingBase[2]) : 0;
      const presentTrainingDiff1f = (presentTraining && presentTraining.lap[3]) ? Helper.RoundTime(presentTraining.lap.slice(-4)[3].lap - presentTrainingBase[3]) : 0;
  
      const fastestTrainingDiff4f = (fastestTraining && fastestTraining.lap[0]) ? Helper.RoundTime(fastestTraining.lap.slice(-4)[0].lap - fastestTrainingBase[0]) : 0;
      const fastestTrainingDiff3f = (fastestTraining && fastestTraining.lap[1]) ? Helper.RoundTime(fastestTraining.lap.slice(-4)[1].lap - fastestTrainingBase[1]) : 0;
      const fastestTrainingDiff2f = (fastestTraining && fastestTraining.lap[2]) ? Helper.RoundTime(fastestTraining.lap.slice(-4)[2].lap - fastestTrainingBase[2]) : 0;
      const fastestTrainingDiff1f = (fastestTraining && fastestTraining.lap[3]) ? Helper.RoundTime(fastestTraining.lap.slice(-4)[3].lap - fastestTrainingBase[3]) : 0;
  
      const lastTrainingDiff4f = (lastTraining && lastTraining.lap[0]) ? Helper.RoundTime(lastTraining.lap.slice(-4)[0].lap - lastTrainingBase[0]) : 0;
      const lastTrainingDiff3f = (lastTraining && lastTraining.lap[1]) ? Helper.RoundTime(lastTraining.lap.slice(-4)[1].lap - lastTrainingBase[1]) : 0;
      const lastTrainingDiff2f = (lastTraining && lastTraining.lap[2]) ? Helper.RoundTime(lastTraining.lap.slice(-4)[2].lap - lastTrainingBase[2]) : 0;
      const lastTrainingDiff1f = (lastTraining && lastTraining.lap[3]) ? Helper.RoundTime(lastTraining.lap.slice(-4)[3].lap - lastTrainingBase[3]) : 0;
  
      return {
        resultScratch,
        resultTimeRate,
        resultTimeDiffSec,
        horseWeightDiff,
        horseHandicap,
        presentTrainingDiff4f: 0 && presentTrainingDiff4f,
        presentTrainingDiff3f,
        presentTrainingDiff2f,
        presentTrainingDiff1f,
        fastestTrainingDiff4f: 0 && fastestTrainingDiff4f,
        fastestTrainingDiff3f,
        fastestTrainingDiff2f,
        fastestTrainingDiff1f,
        lastTrainingDiff4f: 0 && lastTrainingDiff4f,
        lastTrainingDiff3f,
        lastTrainingDiff2f,
        lastTrainingDiff1f,
      };
    });
    return result;
  });
}

export default async (idReg: string, options: { output: string }) => {
 
  try {
    const { docs, warning } = await TateyamaDB.query(idReg);

    if (options.output) {
        if (docs) {
        logger.info(`${docs.length}件のデータがマッチしました`);
      }
      if (warning) {
        logger.warn(warning);
      }
    }
    
    /**
     * 調教タイム基準値を生成
     */
    const lapbase = generateTrainingLapBase(docs);

    /**
     * 学習データセットを作成
     */
    const dataset = generateDatasetAll(docs, lapbase);

    for (let count = 0; count < dataset.length; count = count + 100) {
      const trainData = dataset.slice(count, count + 100);

      // 最初のみヘッダを出力
      if (count === 0) {
        const header = Object.keys(trainData[0]).map((h) => `#${h}`).join(',');
        writeFileSync(options.output, `${header}\n`, { flag: "w" });
      }

      // CSVを出力
      const csv = trainData.map((v) => `${Object.values(v).join(',')}\n`).join('');
      if (options.output) {
        writeFileSync(options.output, csv, { flag: "a+" });
      } else {
        console.log(csv);
      }
    }
  } catch (err) {
    logger.error(err);
  }
}
