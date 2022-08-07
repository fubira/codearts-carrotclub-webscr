import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import * as brain from 'brain.js';
import logger from 'logger';
import papa from 'papaparse';
import * as TateyamaV1 from 'v1/tateyama-v1/types';

const LEARNING_DIR = ".train";
const TRAIN_JSON = `${LEARNING_DIR}/train.json`;

function initializeNeuralNet(opts?: { init?: boolean }) {
  const net = new brain.NeuralNetwork({
    inputSize: 4,
    hiddenLayers: [10],
    outputSize: 1,
  });

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

  const dataset = rawData.map((data) => {
    const [ /* isScratch */, timeRate, timeDiff ] = data.splice(0, 3);

    return {
      input: [
        ...data
      ],
      output: {
        // timeRate,
        timeDiff
      },
    }
  }).filter((v) => v.input.length !== 0); 

  const randomDataset = dataset.sort(() => Math.random() - 0.5);

  if (randomDataset) {
    const total = randomDataset.length;
    let count = 0;

    while(dataset.length > 0) {
      const trainData = dataset.splice(0, 1000);
      net.train([...trainData]);

      count = count + trainData.length;
      console.log(`[${count} / ${total}] trained.`);
    }
  }

  finalizeNeuralNet(net);
}

async function run(rawData: number[][], header: string[][]) {
  const net = initializeNeuralNet();

  const dataset = rawData.map((data) => {
    data.splice(0, 3);

    return {
      input: [
        ...data
      ],
    }
  }).filter((v) => v.input.length !== 0); 


  if (dataset) {
    const result = dataset.map(({ input }) => net.run(input) as { timeRate: number, timeDiff: number });
    
    const list = result.map((value, index) => {
      const h = header[index];
      return {
        header: {
          raceId: `${h[0]}_${h[2]}_${h[3].padStart(2, '0')}R ${h[4]}`,
          horseId: `[${h[5].padStart(2, ' ')}:${h[6].padStart(2, ' ')}]`,
        },
        output: value,
      };
    });

    list
      .sort((a, b) => b.output.timeDiff - a.output.timeDiff)
      .sort((a, b) => a.header.raceId.localeCompare(b.header.raceId))
      .forEach((value) => {
        logger.info(`${value.header.raceId} ${value.header.horseId} - ${JSON.stringify(value.output)}`);
      });
  }

  finalizeNeuralNet(net);
}

function makeNormalizeBase(dataset: number[][]) {
  const base = Array.from(Array(dataset[0].length)).map(() => {
    return {
      max: Number.MIN_VALUE,
      min: Number.MAX_VALUE,
    };
  });

  dataset.forEach((line) => {
    line.forEach((cell, index) => {
      base[index].min = Math.min(base[index].min, cell);
      base[index].max = Math.max(base[index].max, cell);
    })
  });

  return base;
}

function normalizeDataset(dataset: number[][], base: { min: number, max: number}[]) {
  return dataset.map((line) => {
    return line.map((cell, index) => {
      const { min, max } = base[index];
      const normal = (cell - min) / (max - min);
      if (isNaN(cell) || cell === Infinity) {
        logger.info(cell, normal, min, max);
      }
      return normal;
    })
  });
}

export default async (trainCsvPath: string, testCsvPath: string, options: { train: boolean, test: boolean, init: boolean }) => {
  try {
    const trainCsv = papa.parse<TateyamaV1.Dataset[]>(readFileSync(trainCsvPath).toString(), { header: true });
    const testCsv = papa.parse<TateyamaV1.Dataset[]>(readFileSync(testCsvPath).toString(), { header: true });

    const trainHeader = trainCsv.data.map((line) => {
      return Object.values(line).slice(0, 7).map((v) => String(v));
    }).filter((v) => v.length > 0);
    const trainDataset = trainCsv.data.map((line) => {
      return Object.values(line).slice(7).map((v) => Number(v));
    }).filter((v) => v.length > 0);

    const testHeader = testCsv.data.map((line) => {
      return Object.values(line).slice(0, 7).map((v) => String(v));
    }).filter((v) => v.length > 0);
    const testDataset = testCsv.data.map((line) => {
      return Object.values(line).slice(7).map((v) => Number(v));
    }).filter((v) => v.length > 0);

    trainHeader;

    // 基準値を作る
    const dataNormalizeBase = makeNormalizeBase(trainDataset);
    console.log(dataNormalizeBase);

    // 値を0～1基準に変換する
    const normalizedTrainDataset = trainDataset && normalizeDataset(trainDataset, dataNormalizeBase);
    const normalizedTestDataset = testDataset && normalizeDataset(testDataset, dataNormalizeBase);

    if (options.train) {
      logger.info("train start.");
      await train(normalizedTrainDataset, options);
      logger.info("train complete.");
    }

    if (options.test) {
      logger.info("test start.");
      await run(normalizedTestDataset, testHeader);
      logger.info("test complete.");
    }

  } catch (err) {
    logger.error(err);
  }
}
