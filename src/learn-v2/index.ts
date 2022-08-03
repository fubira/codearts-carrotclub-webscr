import * as Tateyama from 'tateyama/v2';
import logger from 'logger';

export default async (idReg: string, options: { workDir: string, cycle: string, init: boolean }) => {
  try {
    logger.info(idReg, options);

    const aistore = new Tateyama.ValueFactorStore();
    console.log(JSON.stringify(aistore, null, 2));

  } catch (err) {
    logger.error(err);
  }
}
