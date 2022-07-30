import 'dotenv/config'
import process from 'process';
import { Command } from 'commander';

import makedb from './makedb';
import dbutil from './dbutil';
import scrape from './scrape';
import dataset from './dataset';
import run from './brain';

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
  
    scrape(year, month, day, { ...options });
  });

  program
  .command('makedb')
  .description('スクレイピングデータのDB化')
  .option('-s, --source-dir <dir>', 'スクレイピングデータディレクトリの指定', ".site")
  .action((options) => {
    makedb(options);
    makedb({ ...options });
  });

program
  .command('dataset')
  .description('データセットの生成')
  .argument('<id_regex>', 'レースIDにマッチする正規表現文字列')
  .option('-o, --output <csv-file>', '出力ファイル', "output.csv")
  .action((str, options) => {
    console.log(str, options);
    dataset(str, { ...options });
  })

program
  .command('run')
  .description('機械学習の実行')
  .option('--init', '起動時に学習状況を初期化する', false)
  .option('-t, --train <csv-file>', '学習用データセットの指定', undefined)
  .option('-v, --test <csv-file>', '検証用データセットの指定', undefined)
  .action((options) => {
    run({ ...options });
  });

program
  .command('dbutil')
  .description('データベースの操作ツール')
  .argument('<sub-command>', 'string to sub command')
  .command('get')
  .description('DBからデータを取得')
  .argument('<id_regex>', 'レースIDにマッチする正規表現文字列')
  .action((str) => {
    dbutil('get', str);
  });

program.parse();