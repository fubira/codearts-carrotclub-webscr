import pouchdb from 'pouchdb';
import pouchdbFind from 'pouchdb-find';
import * as brain from 'brain.js';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';

import { exit } from 'process';
import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import { Types } from 'tateyama';
import logger from 'logger';

pouchdb.plugin(pouchdbFind);
const db = new pouchdb<Types.DataRace>('./.db');
logger

const options = [
  { name: 'help', alias: 'h', type: Boolean, defaultValue: false }, 
];
const args = commandLineArgs(options);

if (args["help"]) {
  console.log(commandLineUsage([{ header: 'webscr', optionList: options }]));
  exit(0);
}

const LEARNING_DIR = ".learning";
const TRAIN_JSON = `${LEARNING_DIR}/train.json`;

function initializeNeuralNet() {
  const net = new brain.NeuralNetwork();

  if (!existsSync(LEARNING_DIR)) {
    mkdirSync(LEARNING_DIR);
  }

  if (existsSync(TRAIN_JSON) && !args["clean"]) {
    const json = JSON.parse(readFileSync(TRAIN_JSON).toString());
    net.fromJSON(json);
  }

  return net; 
}

function finalizeNeuralNet(net: any) {
  const json = JSON.stringify(net.toJSON());

  writeFileSync(TRAIN_JSON, json);
}

function calcTrainingLogScore(log: Types.DataTrainingLog): [number, number, number, number] {
  let baseGap: number[] = [];
  if (log.course.includes('美南Ｗ')) {
    baseGap = [14.0, 13.3, 12.2, 11.0];
  } else if (log.course.includes('美坂')) {
    baseGap = [14.5, 13.0, 12.4, 11.9];
  } else if (log.course.includes('美Ｐ')) {
    baseGap = [13.6, 12.4, 11.2, 10.0];
  } else if (log.course.includes('栗ＣＷ')) {
    baseGap = [13.5, 12.5, 11.5, 11.0];
  } else if (log.course.includes('栗坂')) {
    baseGap = [14.5, 13.2, 12.5, 12.0];
  } else if (log.course.includes('芝')) {
    baseGap = [13.0, 12.5, 12.0, 11.0];
  } else if (log.course.includes('ダ')) {
    baseGap = [13.6, 12.8, 12.2, 11.5];
  } else if (log.course.includes('Ｗ')) {
    baseGap = [14.0, 13.5, 13.0, 12.5];
  } else {
    baseGap = [13.6, 12.8, 12.2, 11.5];
  }

  return [
    (baseGap[0] / (log.lap[2]?.gap || 20)) * 0.8,
    (baseGap[1] / (log.lap[3]?.gap || 20)) * 1.0,
    (baseGap[2] / (log.lap[4]?.gap || 20)) * 1.2,
    (baseGap[3] / (log.lap[5]?.gap || 20)) * 1.4
  ];
}

function makeTrainingData(data: Types.DataRace) {
  const result = data.entries.map((entry) => {
    const horseId = entry.horseId;
    const totalOrders = Object.keys(data.result.order).length;
    const resultOrder = data.result.order[horseId];
    const resultOrderValue = (totalOrders - resultOrder) / totalOrders; 
    const entryLogGapArray: Array<number[]> = [[],[],[],[],[],[]];

    for (let index = 0; index < 4; index ++) {
      if (entry.training.logs[index]) {
        entryLogGapArray[index] = calcTrainingLogScore(entry.training.logs[index]);
      } else {
        entryLogGapArray[index] = [0, 0, 0, 0];
      }
    }

    const entryLogGapFlat = entryLogGapArray?.flat(1) || [];

    return {
      input: [
        ...entryLogGapFlat,
      ],
      
      /*
      input: {
        // courseType: Helper.CourseTypeToNumber(data.course.type),
        // courseDistance: data.course.distance,
        // courseDirection: Helper.CourseDirectionToNumber(data.course.direction),
        // courseWeather: Helper.CourseWeatherToNumber(data.course.weather),
        courseCondition: Helper.CourseConditionToNumber(data.course.condition),

        entryHorseAge: entry.horseAge,
        entryHorseSex: Helper.HorseSexToNumber(entry.horseSex),
        entryHandicap: entry.handicap,
        // entryHorseWeight: entry.horseWeight,
        entryHorseWeightDiff: entry.horseWeightDiff,
        // entryOddsRank: entry.oddsRank,
        ...
      },
      */
      output: {
        result: resultOrderValue,
      }
    };
  });

  return result;
}

async function main() {
  const net = initializeNeuralNet();

  if (args["train"]) {
    const trainDocs = await db.find({ selector: { _id: { $regex: '20210[1-4].*' } } });
    const trainingData = trainDocs.docs.map((data: Types.DataRace) => makeTrainingData(data)).flat();
    console.log(trainingData);
    net.train(trainingData);
  }

  if (args["run"]) {
    const runDocs = await db.find({ selector: { _id: { $regex: '20220105.*' } } });
    runDocs.docs.forEach((data: Types.DataRace) => {
      const trainingData = makeTrainingData(data);
      logger.info(`${data._id}`);
      const outputList = trainingData.map((data) => net.run(data.input)) as { result: number }[];

      data.entries.sort((a, b) => outputList[b.horseId]?.result - outputList[a.horseId]?.result);
      data.entries.slice(0, 5).forEach((d) => {
        logger.info(`[${d.horseId} ${d.horseName}] ${JSON.stringify(outputList[d.horseId])}`);
      });

    });
  }
  finalizeNeuralNet(net);
}

main().catch((err) => {
  logger.error(err);
}).finally(() => {
  logger.info("done.");
});

/*
net.train([{
    input: [15, 14, 13, 12],
    output: { win : 1 }
  },
  {
    input: [13, 12, 12, 13],
    output: { win : 0.5}
  },
  {
    input: [14, 14, 14, 11],
    output: { win : 0.2 }
  },
  {
    input: [12, 12, 14, 14],
    output: { win : 0.1 }
  }
]);

const output = net.run([14, 14, 14, 12]);
logger.info(output);
logger.info(net.toJSON());

*/
