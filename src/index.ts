import 'dotenv/config'
import process from 'process';
import { Command } from 'commander';

import makedb from './makedb';
import dbutil from './dbutil';
import scrape from './scrape';
import train from './brain/train';
import run from './brain/run';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.3538.77 Safari/537.36';

const program = new Command();

program.name('tateyama')

program
  .command('scrape')
  .description('レース情報スクレイピング')
  .argument('<string>', '取得期間 YYYY or YYYYMM or YYYYMMDD', undefined, `${new Date().getFullYear()}`)
  .option('-o, --output-dir', '出力ディレクトリの指定', ".site")
  .option('-i, --site-id', 'KeibaBook Smart ユーザーID', process.env.SITE_ID || "")
  .option('-p, --site-pass', 'KeibaBook Smart ユーザーパスワード', process.env.SITE_PASS || "")
  .option('--proxy', 'プロキシ指定', process.env.HTTP_PROXY || "")
  .option('--user-agent', 'ユーザーエージェント指定', USER_AGENT || "")
  .option('--no-sandbox', 'スクレイピング時にChromeのサンドボックスを使用しない')
  .action((str, options) => {
    const range = `${str}` || `${new Date().getFullYear()}`
    const year = range.slice(0, 4);
    const month = range.slice(4, 6);
    const day = range.slice(6, 8);
  
    scrape(year, month, day, options);
  });

program
  .command('makedb')
  .description('スクレイピングデータのDB化')
  .option('-s, --source-dir', 'スクレイピングデータディレクトリの指定', ".site")
  .action((options) => {
    makedb(options);
  })

program
  .command('train')
  .description('機械学習の実行')
  .argument('<id_regx>', '学習に使用するレースIDにマッチする正規表現文字列')
  .option('--init', '起動時に学習データを初期化する', false)
  .option('--dry', 'データ生成の実を行い、学習を実行しない', false)
  .action((str, options) => {
    console.log(options);
    train(str, options);
  })

program
  .command('run')
  .description('学習データをもとに予測を実行')
  .argument('<id_regx>', '予測対象のレースIDにマッチする正規表現文字列')
  .option('--init', '起動時に学習データを初期化する', false)
  .action((str) => {
    run(str);
  })

program
  .command('dbutil')
  .description('データベースの操作ツール')
  .argument('<sub-command>', 'string to sub command')
  .command('get')
  .description('DBからデータを取得')
  .argument('<id_regex>', 'レースIDにマッチする正規表現文字列')
  .action((str) => {
    console.log(str);
    dbutil('get', str);
  })

program.parse();