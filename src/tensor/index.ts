import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import * as brain from 'brain.js';
import logger from 'logger';

const LEARNING_DIR = ".train";
const TRAIN_JSON = `${LEARNING_DIR}/train.json`;

function initializeNeuralNet(opts?: { init?: boolean }) {
  const net = new brain.NeuralNetwork({
    hiddenLayers: [100, 40],
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

  const data = rawData.map((d) => {
    d.shift();
    const timeDiff = d.shift();
    d.shift();

    return {
      input: [ ...d ],
      output: { timeDiff: timeDiff }
    }
  }).filter((v) => v.input.length !== 0).sort(() => Math.random() - 0.5); 

  if (data) {
    const total = data.length;

    for (let count = 0; count < data.length; count += 100) {
      const trainData = data.slice(count, count + 100);
      net.train([...trainData]);
      console.log(`[${count} / ${total}] trained.`);
    }
  }

  finalizeNeuralNet(net);
}

async function run(rawData: number[][]) {
  const net = initializeNeuralNet();

  const data = rawData.map((d, index) => {
    d.shift();
    d.shift();
    d.shift();

    return {
      index: index + 1,
      input: [ ...d ],
      output: { timeDiff: 0 }
    }
  }) .filter((v) => v.input.length !== 0);

  if (data) {
    const result = data.map(({ input }) => net.run(input) as { timeDiff: number });
    
    const list = result.map((value, index) => { return { id: index + 1, output: value } });

    list.sort((a, b) => b.output.timeDiff - a.output.timeDiff).forEach((value) => {
      logger.info(`${value.id} - ${JSON.stringify(value.output)}`);
    })
  }

  finalizeNeuralNet(net);
}

function verifyRawData(data: number[][]) {
  data.map((line, lineIndex) => {
    line.map((cell, cellIndex) => {
      if (cell === null) {
        logger.warn(line);
        throw Error(`空のセルが存在します。 (${lineIndex} / ${cellIndex}})`)
      }
      if (isNaN(cell) || cell === Infinity) {
        logger.warn(line);
        throw Error(`数値が異常です。 (line: ${lineIndex} / cell: ${cellIndex}})`)
      }
    });
  })
} 

export default async (trainCsvPath: string, testCsvPath: string, options: { train: boolean, test: boolean, init: boolean }) => {
  try {
    const trainCsv = readFileSync(trainCsvPath).toString();
    const testCsv = readFileSync(testCsvPath).toString();
 
    const normalize = (data: number[][], dataOther?: number[][]) => {
      const all = [...data, ...dataOther];
      const columns = all[0].length;
      const min: number[] = Array(columns);
      const max: number[] = Array(columns);
      all.forEach((line) => {
        line.forEach((cell, index) => {
          min[index] = Math.min(min[index] || Number.MAX_VALUE, cell);
          max[index] = Math.max(max[index] || Number.MIN_VALUE, cell);
        })
      });
      
      for (let ci = 0; ci < columns; ci ++) {
        if (min[ci] === max[ci]) {
          max[ci] = min[ci] + 1;
        }
      }

      for (const line of data) {
        for (let ii = 0; ii < line.length; ii ++) {
          const cell = (line[ii] - min[ii]) / (max[ii] - min[ii]);
          if (isNaN(cell) || cell === Infinity) {
            logger.info(cell, line[ii], min[ii], max[ii]);
          }

          line[ii] = cell;
        }
      }
      return data;
    }
    const trainCsvline = trainCsv?.split(/\r?\n/g).filter((line) => !line.startsWith('#'));
    const trainRawData = trainCsvline?.map((l) => l.split(',').map((v) => Number(v)));

    const testCsvline = testCsv?.split(/\r?\n/g).filter((line) => !line.startsWith('#'));
    const testRawData = testCsvline?.map((l) => l.split(',').map((v) => Number(v)));

    const trainNormalizedData = trainRawData && normalize(trainRawData, testRawData);
    const testNormalizedData = testRawData && normalize(testRawData, trainRawData);

    verifyRawData(trainRawData);
    verifyRawData(testRawData);

    if (options.train) {
      logger.info("train start.");
      train(trainNormalizedData, options);
      logger.info("train complete.");
    }
    if (options.test) {
      logger.info("test start.");
      run(testNormalizedData);
      logger.info("test complete.");
    }

  } catch (err) {
    logger.error(err);
  }
}
