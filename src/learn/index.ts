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

  writeFileSync(`${forecasterDir}/${forecaster}.json`, forecaster.toJSON());
}

async function loadForecaster(forecasterName: string): AI.Forecaster {
  const forecasterDir = `.ai_work/forecaster/`;

  if (!existsSync(forecasterDir)) {
    return [];
  }

  if (forecasterName) {
    return AI.Forecast.fromJSON(readFileSync(forecasterName).toString());
  } else {
    const [firstFile] = await FastGlob(`${forecasterDir}/*.json`, { onlyFiles: true });
    return AI.Forecast.fromJSON(readFileSync(firstFile).toString());
  }
}

async function cycle(cycleIndex: number, forecasterName: string, init: boolean) {
  const resultLogger = new Result.Logger();
  let forecaster: AI.Forecast;

  try {
    // 保存された予想AIの読み込み
    if (!init) {
      forecaster = await loadForecaster(forecasterName);
    }

    const progress = new cliProgress.SingleBar({
      format: `# Cycle-${cycleIndex + 1} [{bar}] {percentage}% | {value}/{total}`
    });

    // データベース接続
    await DB.connect();

    // ランダムにレース情報を取得する
    const docs = await DB.RAModel.aggregate([{
      $sample: { size: 10 }
    }]) as DB.RA[];
    progress.start(docs.length, 0);

    docs.forEach(async (race, index) => {
      const forecastResult = forecaster.forecast(race);
      const choice = AI.getForecastResultChoiced(forecastResult);

      // 払戻情報を取得する
      const result = await DB.HRModel.findOne({ jvid: race.jvid }).exec();
      resultLogger.bet(choice, result);

      progress.update(index);
    });

    progress.stop();
  } catch (err) {
    logger.error(err);
    return;
  }

  try {
    resultLogger.dump();
    await saveForecaster(forecaster);
  } catch (err) {
    logger.error(err);
  }
}

export default async (options: { workDir: string, cycle: string, init: boolean }) => {
  logger.info(options);
  const cycles = Number(options.cycle) || 1;

  for(let ii = 0; ii < cycles; ii = ii + 1) {
    await cycle(ii, options.workDir, ii === 0 && options.init);
  }
}
