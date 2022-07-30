import * as brain from 'brain.js';
import { existsSync, readFileSync } from 'fs';

import { Types } from 'tateyama';
import logger from 'logger';
import TateyamaDB from 'db';
import { makeTrainingData } from 'brain/data';

const LEARNING_DIR = ".train";
const TRAIN_JSON = `${LEARNING_DIR}/train.json`;

function initializeNeuralNet() {
  const net = new brain.NeuralNetwork();

  if (existsSync(TRAIN_JSON)) {
    const json = JSON.parse(readFileSync(TRAIN_JSON).toString());
    net.fromJSON(json);
  }

  return net; 
}

function finalizeNeuralNet(_net: any) {
  _net;
}

export default async (idReg: string) => {
  try {
    const db = await TateyamaDB.instance();

    const net = initializeNeuralNet();
  

    const { docs, warning } = await db.find({
      selector: { _id: { $regex: idReg } }
    });
    if (docs) {
      logger.info(`${docs.length}件のデータがマッチしました`);
    }
    if (warning) {
      logger.warn(warning);
    }
  
    docs.forEach((data: Types.DBRace) => {
      const trainingData = makeTrainingData(data);

      logger.info(`${data.date} ${data.courseName} ${data.raceNo} ${data.raceTitle}`);

      // 該当するレースの全頭に対して着順予測を実行
      const outputList = trainingData.map((td) => net.run(td.input)) as { result: number }[];

      data.entries.sort((a, b) => outputList[b.horseId]?.result - outputList[a.horseId]?.result);
      data.entries.slice(0, 8).forEach((d) => {
        logger.info(`[${d.horseId} ${d.horseName}] ${JSON.stringify(outputList[d.horseId])}`);
      });
    })

    finalizeNeuralNet(net);
  } catch (err) {
    logger.error(err);
  } finally {
    logger.info("train done.");
  }
}
