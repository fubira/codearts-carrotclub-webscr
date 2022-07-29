import 'dotenv/config'
import process from 'process';
import { Command } from 'commander';

import scrape from './scraping';

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

program.parse();