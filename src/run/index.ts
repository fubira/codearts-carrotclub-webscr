import logger from 'logger';
import FastGlob from 'fast-glob';
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

async function forecast(idRegex: string, forecasterName: string) {
  const resultLogger = new Result.Logger();

  // 保存された予想AIの読み込み
  const forecaster = await loadForecaster(forecasterName);

  const [Date, JyoCD, RaceNum] = idRegex.split(':');
  const Year = Date.slice(0, 4);
  const MonthDay = Date.slice(4);
  const param = {
    'jvid.Year': Year,
    'jvid.MonthDay': MonthDay,
    'jvid.JyoCD': JyoCD,
    'jvid.RaceNum': RaceNum,
  };

  try {
    const race = await (DB.RAModel.findOne({ 'head.DataKubun': '7', ...param }).exec());
    const entries = await (DB.SEModel.find({ 'head.DataKubun': '7', ...param }).exec());
    const payout = await (DB.HRModel.findOne({ ...param }).exec());

    console.log(param);

    const result = forecaster.run(entries);
    const choice = AI.getForecastResultChoiced(result);
    AI.dumpForecastResult(race, entries, choice);
    resultLogger.bet(choice, payout);
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

export default async (idRegex: string, options: { name: string }) => {

  // データベース接続
  await DB.connect();

  await forecast(idRegex, options.name);

  await DB.close();
}
