import logger from 'logger';
import FastGlob from 'fast-glob';
import cliProgress from 'cli-progress';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync, renameSync } from 'fs';

import { Result, DB, Data, AI } from 'tateyama';

async function saveForecasts(workDir: string, forecasts: AI.Forecast[]) {
  const forecastDir = `${workDir}/forecast/`;

  //
  // ディレクトリがなければ作っておく
  //
  if (!existsSync(forecastDir)) {
    mkdirSync(forecastDir, { recursive: true });
  }

  //
  // 新規追加と分かる形で保存
  //
  forecasts.forEach((f) => writeFileSync(`${forecastDir}/${f.name}.json.new`, f.toJSON()));

  //
  // 古いファイルを削除する
  //
  const oldFiles = await FastGlob(`${forecastDir}/*.json`, { onlyFiles: true });
  oldFiles.forEach((path) => rmSync(path));

  //
  // 新規追加ファイルを正規名に変更する
  //
  const newFiles = await FastGlob(`${forecastDir}/*.json.new`, { onlyFiles: true });
  newFiles.forEach((path) => renameSync(path, path.replace(/\.new$/, '')));
}

async function loadForecasts(workDir: string) {
  const forecastDir = `${workDir}/forecast/`;

  //
  // ディレクトリがなければ中断
  //
  if (!existsSync(workDir)) {
    return [];
  }

  //
  // .v2work/forecast/*.json を予想AIとして読み込む
  //
  const files = await FastGlob(`${forecastDir}/*.json`, { onlyFiles: true });

  const forecasts: AI.Forecast[] = files.map((file) => {
    const forecast = AI.Forecast.fromJSON(readFileSync(file).toString());
    // logger.info(`forecast [${forecast.name}] loaded.`);
    return forecast;
  });

  return forecasts;
}

async function cycle(cycleIndex: number, docs: Data.Race[], workDir: string, init: boolean) {
  const resultLogger = new Result.Logger();
  const MAX_RACE = 288;
  const MAX_FORECASTS = 32;
  let forecasts: AI.Forecast[] = [];

  try {
    // 保存された予想AIの読み込み
    if (!init) {
      forecasts = await loadForecasts(workDir);
    }

    // 空き枠はランダムで埋める
    while (forecasts.length < MAX_FORECASTS) {
      forecasts.push(new AI.Forecast());
    }
  } catch (err) {
    logger.error(err);
    return;
  }

  try {
    const races = docs.length > MAX_RACE ? MAX_RACE : docs.length;
    const randomDocs = docs.sort(() => Math.random() - 0.5);

    const progress = new cliProgress.SingleBar({ format: `# Cycle-${cycleIndex + 1} [{bar}] {percentage}% | {value}/{total}` });
    progress.start(races, 0);

    randomDocs.slice(0, races).forEach((race, index) => {
      forecasts.forEach((forecast) => {
        const forecastResult = forecast.forecast(race);
        forecast.addExp(race);
        const choice = AI.getForecastResultChoiced(forecastResult);
        resultLogger.bet(forecast.name, race._id, choice, race.result);
        progress.update(index);
      });
    });
    progress.stop();
  } catch (err) {
    logger.error(err);
  }

  try {
    const selections = resultLogger.getSelections(forecasts.map((f) => f.name), 7, 1);

    resultLogger.dump(selections);

    const good1 = forecasts.find((f) => f.name === selections[0].name);
    const good2 = forecasts.find((f) => f.name === selections[1].name);
    const good3 = forecasts.find((f) => f.name === selections[2].name);
    const good4 = forecasts.find((f) => f.name === selections[3].name);
    const good5 = forecasts.find((f) => f.name === selections[4].name);
    const good6 = forecasts.find((f) => f.name === selections[5].name);
    const good7 = forecasts.find((f) => f.name === selections[6].name);
    const worst = forecasts.find((f) => f.name === selections[7].name);

    const newForecasts = [
      // 親世代(上位5 + 最下位)をそのまま残す
      good1,
      good2,
      good3,
      good4,
      good5,
      good6,
      good7,
      worst,
      // 親世代を組み合わせた子孫を作る
      // 最下位を混ぜるのは遺伝子の固定化を防ぐため
      AI.Forecast.merge(good1, good2),
      AI.Forecast.merge(good1, good3),
      AI.Forecast.merge(good1, good4),
      AI.Forecast.merge(good1, good5),
      AI.Forecast.merge(good1, good6),
      AI.Forecast.merge(good1, good7),
      AI.Forecast.merge(good1, worst),
      AI.Forecast.merge(good2, good3),
      AI.Forecast.merge(good2, good4),
      AI.Forecast.merge(good2, good5),
      AI.Forecast.merge(good2, good6),
      AI.Forecast.merge(good2, good7),
      AI.Forecast.merge(good2, worst),
      AI.Forecast.merge(good3, good4),
      AI.Forecast.merge(good3, good5),
      AI.Forecast.merge(good3, good6),
      AI.Forecast.merge(good3, good7),
      AI.Forecast.merge(good3, worst),
      AI.Forecast.merge(good4, good5),
      AI.Forecast.merge(good4, good6),
      AI.Forecast.merge(good4, good7),
      AI.Forecast.merge(good4, worst),
      // ランダムを追加
      new AI.Forecast(),
      new AI.Forecast(),
    ];

    await saveForecasts(workDir, newForecasts);
  } catch (err) {
    logger.error(err);
  }
}

export default async (options: { workDir: string, cycle: string, init: boolean }) => {
  logger.info(options);
  const cycles = Number(options.cycle) || 1;
  const init = options.init;

  /*
  try {
    const { docs, warning } = await DB.query('.*');
    const filteredDocs = docs
      // resultのないdocsは学習には使えない
      .filter((doc) => !!doc.result)
      // 1着がある程度人気のものだけ学習
      .filter((doc) => doc.result.refund.win[0].amount < 1200);

    if (filteredDocs) {
      logger.info(`${filteredDocs.length}件のデータがマッチしました`);
    }
    if (warning) {
      logger.warn(warning);
    }

    for(let ii = 0; ii < cycles; ii = ii + 1) {
      await cycle(ii, filteredDocs, options.workDir, init);
      init = false;
    }
  } catch (err) {
    logger.error(err);
  }
  */
}
