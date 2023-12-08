import 'dotenv/config'
import logger from 'logger';
import { Command } from 'commander';
import learn from './command/learn';
import run from './command/run';

const program = new Command();

program.name('tateyama');

program
  .command('learn')
  .description('Tateyama v2 学習実行')
  .option('-c, --cycle <cycle>', '学習サイクルの指定', "100")
  .option('-d, --name <name>', '予想AI名', 'forecaster')
  .option('-i, --init', '学習を最初からやり直す', false)
  .action((options) => {
    try {
      learn({ ...options });
    } catch (err) {
      logger.error(err);
    }
  });

  program
  .command('run')
  .description('Tateyama v2 予想実行')
  .argument('<id_regex>', 'レースIDにマッチする正規表現文字列')
  .option('-d, --name <name>', '予想AI名', 'forecaster')
  .action((idRegex, options) => {
    try {
      run(idRegex, { ...options });
    } catch (err) {
      logger.error(err);
    }
  })

program.parse();
