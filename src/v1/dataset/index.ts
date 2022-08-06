import { writeFileSync, readFileSync } from 'fs';
import papa from 'papaparse';
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
    const lap0 = Helper.Round2(lapTotal[trainingId][0].reduce((prev, curr) => prev + curr, 0) / lapTotal[trainingId][0].length);
    const lap1 = Helper.Round2(lapTotal[trainingId][1].reduce((prev, curr) => prev + curr, 0) / lapTotal[trainingId][1].length);
    const lap2 = Helper.Round2(lapTotal[trainingId][2].reduce((prev, curr) => prev + curr, 0) / lapTotal[trainingId][2].length);
    const lap3 = Helper.Round2(lapTotal[trainingId][3].reduce((prev, curr) => prev + curr, 0) / lapTotal[trainingId][3].length);

    // console.log(`trainingId:${trainingId} length:${lapTotal[trainingId][0].length} value: ${[lap0, lap1, lap2, lap3]}`);
    result[trainingId] = [lap0, lap1, lap2, lap3];
  });

  return result;
}

function getTrainingBaseTime(log: Types.DBTrainingLog) {
  let result = [14.0, 13.0, 12.0, 12.0];
  if (log?.course.includes('美南Ｗ')) {
    result = [13.5,13,12.5,12];
  }
  else if (log?.course.includes('美坂')) {
    result = [14.5,13.5,13.0,12.5];
  }
  else if (log?.course.includes('栗ＣＷ')) {
    result = [13.5,13.0,12.5,11.5];
  }
  else if (log?.course.includes('栗坂')) {
    result = [13.5,13.0,12.5,12.0];
  }
  else if (log?.course.includes('美Ｐ')) {
    result = [13.0,12.5,11.5,11.0];
  }
  else if (log?.course.includes('芝')) {
    result = [13,12.5,12.0,11.5];
  }
  else if (log?.course.includes('ダ')) {
    result = [13.5,13.0,12.5,12.0];
  }
  else if (log?.course.includes('Ｗ')) {
    result = [14.0,13.5,13.0,12.5];
  }
  
  if (log?.comment.includes('馬なり')) {
    result = result.map(v => v * 1.05);
  }
  
  if (log?.condition.includes('重')) {
    result = result.map(v => v * 1.1);
  }
  if (log?.condition.includes('稍')) {
    result = result.map(v => v * 1.05);
  }

  return result;
}

export function generateDatasetAll(docs: Types.DBRace[]): Types.Dataset[] {
  return docs.flatMap((data) => {
    /**
     * 基本情報
     *
     * 学習には無関係
     * 確認のための分類・情報表示用
     */
    const infoDate = data.date;
    const infoCourseId = data.courseId;
    const infoCourse = data.courseName;
    const infoRaceNo = data.raceNo;
    const infoRaceTitle = data.raceTitle;

    /**
     * 相対値比較のために最大値, 合計値を取っておく
     */
    const maxHandicap = data.entries.sort((a, b) => b.handicap - a.handicap)[0].handicap;

    const totalWinningRate = data.entries.map((e) => Helper.CalcWinningRate(e.odds)).reduce((prev, curr) => prev + curr);

    const result = data.entries.map((entry) => {
  
      const infoBracketId = entry.bracketId;
      const infoHorseId = entry.horseId;

      /**
       * 結果情報
       *
       * 答えとなるデータ
       *
       */
      const result = data.result.detail.find((d) => d.horseId === infoHorseId);
      const outputScratch = (!result || !result.timeSec) ? 1 : 0
      const outputTimeRate = Helper.CalcTimeRate(result.timeSec, data.course.distance);
      const outputTimeDiffSec = Helper.Round2(Math.min(result.timeDiffSec, 10));

      /**
       * 入力情報
       *
       * 学習に使用されるデータ
       */

      /** @note 体重差は新馬・海外帰りなどで空になる場合がある  */
      const inputHorseWeightDiff = entry.horseWeightDiff || 0;

      /** ハンデはそのレースの最大からの相対値で取得する */
      const inputHorseHandicap = (entry.handicap + (entry.horseSex === "牝" ? 2 : 0)) - maxHandicap;
      
      /** オッズから基準勝率を割り出す */
      const inputHorseWinPercent = Helper.Round2((Helper.CalcWinningRate(entry.odds) * 100) / totalWinningRate);

      const inputHorseWinRank = entry.oddsRank; 

      /** 直前追切 */
      const presentTraining = entry.training?.logs.slice(-1)[0];
      const presentTrainingId = presentTraining && makeTrainingKey(presentTraining);
      const presentBaseTime = getTrainingBaseTime(presentTraining);
      const presentBaseTime3f = presentBaseTime.slice(-3).reduce((p, c) => p + c);
      const inputPresentTrainingAccel3f = (presentTraining && presentTraining.lap[1]) ? Helper.Round2(presentTraining.lap.slice(-4)[1].accel) : 0;
      const inputPresentTrainingAccel2f = (presentTraining && presentTraining.lap[2]) ? Helper.Round2(presentTraining.lap.slice(-4)[2].accel) : 0;
      const inputPresentTrainingAccel1f = (presentTraining && presentTraining.lap[3]) ? Helper.Round2(presentTraining.lap.slice(-4)[3].accel) : 0;
      const inputPresentTrainingDiff3f = (presentTraining && presentTraining.lap[1]) ? Helper.Round2(presentBaseTime[1] - presentTraining.lap.slice(-4)[1].gap) : 0;
      const inputPresentTrainingDiff2f = (presentTraining && presentTraining.lap[2]) ? Helper.Round2(presentBaseTime[2] - presentTraining.lap.slice(-4)[2].gap) : 0;
      const inputPresentTrainingDiff1f = (presentTraining && presentTraining.lap[3]) ? Helper.Round2(presentBaseTime[3] - presentTraining.lap.slice(-4)[3].gap) : 0;
      const presentStartTimeDiff = presentTraining && ((presentTraining.lap[1]?.lap || presentBaseTime3f) - presentBaseTime3f);
      const inputPresentTrainingAccel = (presentTraining) ? Helper.Round2(presentTraining.lap.slice(-3).map((v) => v.accel).reduce((p, c) => p + c, 0) - presentStartTimeDiff) : 0;

      const fastestTraining = entry.training?.logs.slice(1).sort((a, b) => a.lap[3]?.lap - b.lap[3]?.lap )[0];
      const fastestTrainingId = fastestTraining && makeTrainingKey(fastestTraining);
      const fastestBaseTime = getTrainingBaseTime(fastestTraining);
      const fastestBaseTime3f = fastestBaseTime.slice(-3).reduce((p, c) => p + c);
      const inputFastestTrainingAccel3f = (fastestTraining && fastestTraining.lap[1]) ? Helper.Round2(fastestTraining.lap.slice(-4)[1].accel) : 0;
      const inputFastestTrainingAccel2f = (fastestTraining && fastestTraining.lap[2]) ? Helper.Round2(fastestTraining.lap.slice(-4)[2].accel) : 0;
      const inputFastestTrainingAccel1f = (fastestTraining && fastestTraining.lap[3]) ? Helper.Round2(fastestTraining.lap.slice(-4)[3].accel) : 0;
      const inputFastestTrainingDiff3f = (fastestTraining && fastestTraining.lap[1]) ? Helper.Round2(fastestBaseTime[1] - fastestTraining.lap.slice(-4)[1].gap) : 0;
      const inputFastestTrainingDiff2f = (fastestTraining && fastestTraining.lap[2]) ? Helper.Round2(fastestBaseTime[2] - fastestTraining.lap.slice(-4)[2].gap) : 0;
      const inputFastestTrainingDiff1f = (fastestTraining && fastestTraining.lap[3]) ? Helper.Round2(fastestBaseTime[3] - fastestTraining.lap.slice(-4)[3].gap) : 0;
      const fastestStartTimeDiff = fastestTraining && ((fastestTraining.lap[1]?.lap || fastestBaseTime3f) - fastestBaseTime3f);
      const inputFastestTrainingAccel = (fastestTraining) ? Helper.Round2(fastestTraining.lap.slice(-3).map((v) => v.accel).reduce((p, c) => p + c, 0) - fastestStartTimeDiff) : 0;
      // console.log(entry.horseName, JSON.stringify(presentTraining), inputPresentTrainingAccel);
      // console.log(entry.horseName, JSON.stringify(entry.training?.logs.sort((a, b) => b.lap[3]?.lap - a.lap[3]?.lap )));
      const inputTrainingAccel = Math.max(inputFastestTrainingAccel, inputPresentTrainingAccel);
  /*
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
  */
      return {
        infoDate,
        infoCourseId,
        infoCourse,
        infoRaceNo,
        infoRaceTitle,
        infoBracketId,
        infoHorseId,
        outputScratch,
        outputTimeRate,
        outputTimeDiffSec,
        inputHorseWeightDiff,
        inputHorseHandicap,
        inputHorseWinRank,
        // inputHorseWinPercent,
        // inputTrainingAccel,
                /*
        inputPresentTrainingAccel3f,
        inputPresentTrainingAccel2f,
        inputPresentTrainingAccel1f,
        */
        // inputPresentTrainingDiff3f,
        inputPresentTrainingAccel,
        /*
        inputPresentTrainingDiff2f,
        inputPresentTrainingDiff1f,
        */
        // inputFastestTrainingDiff3f,
        inputFastestTrainingAccel,
        /*
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
        */
      };
    }).filter((v) => v.outputScratch !== 1);
    return result;
  });
}

/**
 * 基準データセットCSVを読み込む
 * @param baseDataPath 
 * @returns 
 */
function readBaseDataset(baseDataPath: string) {
  if (!baseDataPath) {
    return undefined;
  }

  const baseFile = readFileSync(baseDataPath);
  const { data } = papa.parse<string[]>(baseFile.toString());
  return data;
}

/**
 * データセットCSVを出力する
 * 
 * @param outputPath 
 * @param dataset 
 */
function writeDataset(outputPath: string, dataset: any[]) {
  if (dataset.length <= 0) {
    return;
  }

  /**
   * 確認用にヘッダを書き出しておく
   */
  const header = Object?.keys(dataset[0]).map((h) => `${h}`).join(',');
  writeFileSync(outputPath, `${header}\n`, { flag: "w" });
 
  /**
   * 一定量ずつファイル出力
   */
  while (dataset.length > 0) {
    const trainData = dataset.splice(0, 100);

    const csv = trainData.map((v) => `${Object.values(v).join(',')}\n`).join('');
    if (outputPath) {
      writeFileSync(outputPath, csv, { flag: "a+" });
    } else {
      console.log(csv);
    }
  }
}

 /**
  * 異常値がないかを調べる
  * @param dataset 
  */
function verifyDataset(dataset: any[]) {
  dataset.forEach((line, index) => {
    Object.keys(line).forEach((key) => {
      if (key.startsWith('info')) {
        // infoで始まる項目は学習用データじゃないのでskip
        return;
      }
      
      const cell = line[key];

      if (cell === null || cell === undefined) {
        logger.warn(`[${index}] <${key}> 値が空です。 {${cell}}`);
        return;
      }
      if (isNaN(cell) || cell === Infinity) {
        logger.warn(`[${index}] <${key}> 数値が異常です。 {${cell}}`);
        return;
      }
    })

  })
} 


export default async (idReg: string, options: { output: string, base: string }) => {
  /**
   * 指定範囲のデータをDBから取得
   */
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
   * 基準データCSVを読み込む
   * 
   * (検証データ作成時、学習データの平均値を基準にする)
   */
  const baseDataset = readBaseDataset(options.base);

  /**
   * 学習データセットを作成
   */
  const dataset = generateDatasetAll(docs);

  /**
   * 異常値がないかを検証
   */
  verifyDataset(dataset);

  /**
   * データセットファイルの出力
   */
  writeDataset(options.output, dataset);
}
