import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import * as brain from 'brain.js';
import logger from 'logger';

const LEARNING_DIR = ".train";
const TRAIN_JSON = `${LEARNING_DIR}/train.json`;

function initializeNeuralNet(opts?: { init?: boolean, dry?: boolean }) {
  const net = new brain.NeuralNetwork();

  if (!existsSync(LEARNING_DIR)) {
    mkdirSync(LEARNING_DIR);
  }

  if (existsSync(TRAIN_JSON) && !opts?.init) {
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


async function train(rawData: number[][], options: { init: boolean }) {
  const net = initializeNeuralNet({
    init: options.init
  });

  const data = rawData.map((d) => {
    d.shift();
    const time = d.shift();
    d.shift();
    return {
      input: [ ...d ],
      output: { time: time }
    }
  }).filter((v) => v.input.length !== 0); 

  if (data) {
    net.train([...data]);
  }

  finalizeNeuralNet(net);
}

async function run(rawData: number[][]) {
  const net = initializeNeuralNet();

  const data = rawData.map((d, index) => {
    d.shift();
    const time = d.shift();
    d.shift();

    return {
      index: index + 1,
      input: [ ...d ],
      output: { time: time }
    }
  }) 

  if (data) {

    const result = data.map(({ input }) => net.run(input) as { time: number, l3f: number });
    
    const list = result.map((value, index) => { return { id: index + 1, output: value } });

    list.sort((a, b) => b.output.time - a.output.time).forEach((value) => {
      logger.info(`${value.id} - ${JSON.stringify(value.output)}`);
    })
  }

  finalizeNeuralNet(net);
}


export default async (options: { train?: string, test?: string, init: boolean }) => {
  try {
    const trainCsv = (options.train) && readFileSync(options.train).toString();
    const testCsv = (options.test) && readFileSync(options.test).toString();
 
    const normalize = (data: number[][], dataOther?: number[][]) => {
      const all = [...data, ...dataOther];
      const columns = all[0].length;
      const min: number[] = Array(columns);
      const max: number[] = Array(columns);
      all.forEach((line) => {
        line.forEach((column, index) => {
          min[index] = Math.min(min[index] || Number.MAX_VALUE, column);
          max[index] = Math.max(max[index] || Number.MIN_VALUE, column);
        })
      });
      
      for (let ci = 0; ci < columns; ci ++) {
        if (min[ci] === 0 && max[ci] === 0) {
          max[ci] = 1;
          min[ci] = 0;
        }
        if (min[ci] === max[ci]) {
          max[ci] = min[ci] + 1;
        }
      }

      for (const line of data) {
        for (let ii = 0; ii < line.length; ii ++) {
          line[ii] = (line[ii] - min[ii]) / (max[ii] - min[ii]);
        }
      }
      return data;
    }
    const trainCsvline = trainCsv?.split(/\r?\n/g).filter((line) => !line.startsWith('#'));
    const trainRawData = trainCsvline?.map((l) => l.split(',').map((v) => Number(v)));

    const trainNormalizedData = trainRawData && normalize(trainRawData);
    const testCsvline = testCsv?.split(/\r?\n/g).filter((line) => !line.startsWith('#'));
    const testRawData = testCsvline?.map((l) => l.split(',').map((v) => Number(v)));
    const testNormalizedData = testRawData && normalize(testRawData, trainRawData);

    if (trainNormalizedData) {
      logger.info("train start.");
      train(trainNormalizedData, options);
      logger.info("train complete.");
    }
    if (testNormalizedData) {
      logger.info("test start.");
      run(testNormalizedData);
      logger.info("test complete.");
    }

  } catch (err) {
    logger.error(err);
  }
}
