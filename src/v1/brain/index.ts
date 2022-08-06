import * as brain from 'brain.js';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import logger from 'logger';

const LEARNING_DIR = ".train";
const TRAIN_JSON = `${LEARNING_DIR}/train.json`;

function initializeNeuralNet(opts?: { init?: boolean, dry?: boolean }) {
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

export default async (options: { init: boolean, trainData: string, testData: string }) => {
  try {
    const net = initializeNeuralNet({
      init: options.init
    });

    const trainJSON = options.trainData && JSON.parse(readFileSync(options.trainData).toString());
    const testJSON = options.testData && JSON.parse(readFileSync(options.testData).toString());
    

    if (trainJSON) {
      net.train(trainJSON);
    }

    if (testJSON) {
      net.run(testJSON);
    }

    finalizeNeuralNet(net);
  } catch (err) {
    logger.error(err);
  } finally {
    logger.info("train complete.");
  }
}
