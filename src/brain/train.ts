import * as brain from 'brain.js';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';

import TateyamaDB from 'db';
import logger from 'logger';

import { Types } from 'tateyama';
import { makeTrainingData } from 'brain/data';

const LEARNING_DIR = ".train";
const TRAIN_JSON = `${LEARNING_DIR}/train.json`;

function initializeNeuralNet(opts?: { init?: boolean }) {
  const net = new brain.NeuralNetwork();

  if (!existsSync(LEARNING_DIR)) {
    mkdirSync(LEARNING_DIR);
  }

  if (existsSync(TRAIN_JSON) && !opts.init) {
    const trainJSON = readFileSync(TRAIN_JSON).toString();

    try {
      net.fromJSON(JSON.parse(trainJSON));
    } catch (err) {
      logger.error(err);
    }
  }

  return net; 
}

function finalizeNeuralNet(net: any) {
  const json = JSON.stringify(net.toJSON());

  writeFileSync(TRAIN_JSON, json);
}


export default async (idReg: string, options: { init: boolean }) => {
  try {
    const db = await TateyamaDB.instance();
    const net = initializeNeuralNet({
      init: options.init
    });
  
    const { docs, warning } = await db.find({
      selector: { _id: { $regex: idReg } }
    });
    warning && logger.warn(warning);
    logger.info(`${docs.length}件のデータがマッチしました`);

    const trainingData = docs.map((data: Types.DBRace) => makeTrainingData(data)).flat();
    net.train(trainingData);

    finalizeNeuralNet(net);
  } catch (err) {
    logger.error(err);
  } finally {
    logger.info("train done.");
  }
}
