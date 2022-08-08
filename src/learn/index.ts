import logger from 'logger';
import FastGlob from 'fast-glob';
import cliProgress from 'cli-progress';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

import { Result, DB, AI } from 'tateyama';

async function saveForecaster(forecaster: AI.Forecaster) {
  const forecasterDir = `.ai_work/forecaster/`;

  if (!existsSync(forecasterDir)) {
    mkdirSync(forecasterDir, { recursive: true });
  }
  writeFileSync(`${forecasterDir}/${forecaster.name}.json`, forecaster.toJSON());
}

async function loadForecaster(forecasterName: string): Promise<AI.Forecaster> {
  const forecasterDir = `.ai_work/forecaster/`;

  if (forecasterName) {
    return AI.Forecaster.fromJSON(readFileSync(`${forecasterDir}/${forecasterName}.json`).toString());
  } else {
    const [firstFile] = await FastGlob(`${forecasterDir}/*.json`, { onlyFiles: true });
    return AI.Forecaster.fromJSON(readFileSync(firstFile).toString());
  }
}

async function cycle(forecasterName: string, init: boolean) {
  let forecaster: AI.Forecaster;

  try {
    // 保存された予想AIの読み込み
    if (!init) {
      forecaster = await loadForecaster(forecasterName);
    }
  } catch (err) {
    console.log(err);
  }

  if (!forecaster) {
    forecaster = new AI.Forecaster(forecasterName);
  }

  try {
    // ランダムにレース情報を取得する
    const docs = await DB.RAModel.aggregate([{
      $match: { 'head.DataKubun': '7' }
    },{
      $sample: { size: 1 }
    }]) as DB.RA[];

    const races = docs;
    const entries = await Promise.all(
      docs.flatMap(async (race) => await DB.SEModel.find({ 'head.DataKubun': '7', jvid: race.jvid }).exec())
    );

    forecaster.train(races, entries.flat());
  } catch (err) {
    logger.error(err);
    return;
  }

  try {
    // resultLogger.dump();
    await saveForecaster(forecaster);
  } catch (err) {
    logger.error(err);
  }
}

export default async (options: { name: string, cycle: string, init: boolean }) => {
  const cycles = Number(options.cycle) || 1;

  const progress = new cliProgress.SingleBar({});
  progress.start(cycles, 0);

  // データベース接続
  await DB.connect();

  for(let ii = 0; ii < cycles; ii = ii + 1) {
    await cycle(options.name, ii === 0 && options.init);
    progress.update(ii);
  }

  DB.close();

  progress.stop();
}
