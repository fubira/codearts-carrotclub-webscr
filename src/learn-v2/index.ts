import logger from 'logger';
import TateyamaDB from 'db';

import * as Tateyama from 'tateyama/v2';
import { writeFileSync, mkdirSync, existsSync, readFileSync, rmSync, renameSync } from 'fs';
import FastGlob from 'fast-glob';

async function saveForecasts(workDir: string, forecasts: Tateyama.Forecast[]) {
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

  const forecasts: Tateyama.Forecast[] = files.map((file) => {
    const forecast = Tateyama.Forecast.fromJSON(readFileSync(file).toString());
    logger.info(`forecast [${forecast.name}] loaded.`);
    return forecast;
  });

  return forecasts;
}

async function cycle(workDir: string, init: boolean) {
  const betLogger = new Tateyama.BetLogger();
  const MAX_RACE = 1000;
  const MAX_FORECASTS = 24;
  let forecasts: Tateyama.Forecast[] = [];

  try {
    // 保存された予想AIの読み込み
    if (!init) {
      forecasts = await loadForecasts(workDir);
    }

    // 空き枠はランダムで埋める
    while (forecasts.length < MAX_FORECASTS) {
      forecasts.push(new Tateyama.Forecast());
    }
  } catch (err) {
    logger.error(err);
    return;
  }

  try {
    const { docs, warning } = await TateyamaDB.query('.*');

    if (docs) {
      logger.info(`${docs.length}件のデータがマッチしました`);
    }
    if (warning) {
      logger.warn(warning);
    }

    const races = docs.length > MAX_RACE ? MAX_RACE : docs.length;
    const randomDocs = docs.sort(() => Math.random() - 0.5);

    randomDocs.slice(0, races).forEach((race, index) => {
      forecasts.forEach((forecast) => {
        const choice = Tateyama.getForecastResultChoiced(forecast.forecast(race));
        betLogger.bet(forecast.name, race._id, choice, race.result);
      });

      index % 100 === 0 && logger.info(`${index}/${races}`);
    });

  } catch (err) {
    logger.error(err);
  }

  try {
    const selections = betLogger.getSelections(forecasts.map((f) => f.name), 5, 1);

    betLogger.dump(selections);

    const good1 = forecasts.find((f) => f.name === selections[0].name);
    const good2 = forecasts.find((f) => f.name === selections[1].name);
    const good3 = forecasts.find((f) => f.name === selections[2].name);
    const good4 = forecasts.find((f) => f.name === selections[3].name);
    const good5 = forecasts.find((f) => f.name === selections[4].name);
    const worst = forecasts.find((f) => f.name === selections[5].name);

    const newForecasts = [
      // 親世代(上位5 + 最下位)をそのまま残す
      good1,
      good2,
      good3,
      good4,
      good5,
      worst,
      // 親世代を組み合わせた子孫を作る
      // 最下位を混ぜるのは遺伝子の固定化を防ぐため
      Tateyama.Forecast.merge(good1, good2),
      Tateyama.Forecast.merge(good1, good3),
      Tateyama.Forecast.merge(good1, good4),
      Tateyama.Forecast.merge(good1, good5),
      Tateyama.Forecast.merge(good1, worst),
      Tateyama.Forecast.merge(good2, good3),
      Tateyama.Forecast.merge(good2, good4),
      Tateyama.Forecast.merge(good2, good5),
      Tateyama.Forecast.merge(good2, worst),
      Tateyama.Forecast.merge(good3, good4),
      Tateyama.Forecast.merge(good3, good5),
      Tateyama.Forecast.merge(good3, worst),
      Tateyama.Forecast.merge(good4, good5),
      Tateyama.Forecast.merge(good4, worst),
      // ランダムを追加
      new Tateyama.Forecast(),
      new Tateyama.Forecast(),
      new Tateyama.Forecast(),
      new Tateyama.Forecast(),
    ];

    saveForecasts(workDir, newForecasts);
  } catch (err) {
    logger.error(err);
  }
}


export default async (options: { workDir: string, cycle: string, init: boolean }) => {
  logger.info(options);

  const cycles = Number(options.cycle) || 1;

  for(let ii = 0; ii < cycles; ii = ii + 1) {
    await cycle(options.workDir, options.init);
  }
}
