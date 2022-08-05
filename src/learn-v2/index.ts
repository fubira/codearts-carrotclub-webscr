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


export default async (options: { workDir: string, cycle: string, init: boolean }) => {
  logger.info(options);

  const betLogger = new Tateyama.BetLogger();
  const MAX_RACE = 100;
  const MAX_FORECASTS = 10;
  let forecasts: Tateyama.Forecast[] = [];

  try {
    // 保存された予想AIの読み込み
    if (!options.init) {
      forecasts = await loadForecasts(options.workDir);
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
    const randomDocs = docs; //.sort(() => Math.random() - 0.5);

    randomDocs.slice(0, races).forEach((race, index) => {
      forecasts.forEach((forecast) => {
        const choice = Tateyama.getForecastResultChoiced(forecast.forecast(race));
        betLogger.bet(forecast.name, race._id, choice, race.result);
      });

      index % 100 === 0 && logger.info(`${index}/${races}`);
    });

    betLogger.displayStats(forecasts.map((f) => f.name));
    // Tateyama.dumpTimeCountLog();

  } catch (err) {
    logger.error(err);
  }

  try {
    saveForecasts(options.workDir, forecasts);
  } catch (err) {
    logger.error(err);
  }
}
