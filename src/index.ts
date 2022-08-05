import 'dotenv/config'
import process from 'process';
import { Command } from 'commander';
import logger from 'logger';

import makedb from './makedb';
import dbutil from './dbutil';
import scrape from './scrape';
import dataset from './dataset';
import tensor from './tensor';
import learningV2 from './learn-v2';
import runV2 from './run-v2';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.3538.77 Safari/537.36';

const program = new Command();

program.name('tateyama');

program
  .command('scrape')
  .description('レース情報スクレイピング')
  .argument('<string>', '取得期間 YYYY or YYYYMM or YYYYMMDD', undefined, `${new Date().getFullYear()}`)
  .option('-o, --output-dir <dir>', '出力ディレクトリの指定', ".site")
  .option('-i, --site-id <id>', 'KeibaBook Smart ユーザーID', process.env.SITE_ID || "")
  .option('-p, --site-pass <password>', 'KeibaBook Smart ユーザーパスワード', process.env.SITE_PASS || "")
  .option('--proxy <proxy_url>', 'プロキシ指定', process.env.HTTP_PROXY || "")
  .option('--user-agent <user_agent>', 'ユーザーエージェント指定', USER_AGENT || "")
  .option('--no-sandbox', 'スクレイピング時にChromeのサンドボックスを使用しない')
  .action((str, options) => {
    const range = `${str}` || `${new Date().getFullYear()}`
    const year = range.slice(0, 4);
    const month = range.slice(4, 6);
    const day = range.slice(6, 8);

    try {
      scrape(year, month, day, { ...options });
    } catch (err) {
      logger.error(err);
    }
  });

  program
  .command('makedb')
  .description('スクレイピングデータのDB化')
  .option('-s, --source-dir <dir>', 'スクレイピングデータディレクトリの指定', ".site")
  .action((options) => {
    try {
      makedb({ ...options });
    } catch (err) {
      logger.error(err);
    }
  });

program
  .command('v1dataset')
  .description('データセットの生成')
  .argument('<id_regex>', 'レースIDにマッチする正規表現文字列')
  .option('-o, --output <output_csv>', '出力ファイル名を指定する', 'output.csv')
  .option('-b, --base <base_csv>', '検証データを作成する際、基準となる学習データセットCSVを指定する')
  .action((idRegex, options) => {
    try {
      dataset(idRegex, { ...options });
    } catch (err) {
      logger.error(err);
    }
  })

program
  .command('v1run')
  .description('機械学習の実行')
  .argument('<train-csv>', '学習データセットCSV')
  .argument('<test-csv>', '検証データセットCSV')
  .option('--init', '起動時に学習状況を初期化する', false)
  .option('-t, --no-train', '学習を行わない')
  .option('-v, --no-test', '検証を行わない')
  .action((trainCsv, testCsv, options) => {
    try {
      tensor(trainCsv, testCsv, { ...options });
    } catch (err) {
      logger.error(err);
    }
  });

program
  .command('dbutil')
  .description('データベースの操作ツール')
  .argument('<sub-command>', 'string to sub command')
  .command('get')
  .description('DBからデータを取得')
  .argument('<id_regex>', 'レースIDにマッチする正規表現文字列')
  .action((str) => {
    try {
      dbutil('get', str);
    } catch (err) {
      logger.error(err);
    }
  });

  program
  .command('learn')
  .description('Tateyama v2 学習実行')
  .option('-d, --work-dir <work_dir>', 'ワークディレクトリの指定', '.v2work')
  .option('-c, --cycle <cycle>', '学習サイクルの指定', "100")
  .option('-i, --init', '学習を最初からやり直す', false)
  .action((options) => {
    try {
      learningV2({ ...options });
    } catch (err) {
      logger.error(err);
    }
  });

  program
  .command('run')
  .description('Tateyama v2 予想実行')
  .argument('<id_regex>', 'レースIDにマッチする正規表現文字列')
  .argument('<forecast>', '予想AI名')
  .option('-d, --work-dir <work_dir>', 'ワークディレクトリの指定', '.v2work')
  .action((idRegex, forecast, options) => {
    try {
      runV2(idRegex, forecast, { ...options });
    } catch (err) {
      logger.error(err);
    }
  })


program.parse();