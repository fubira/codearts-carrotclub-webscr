import { Types } from 'tateyama';

function calcTrainingLogScore(log: Types.DBTrainingLog): [number, number, number, number] {
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
    baseGap = [14.0, 13.0, 12.5, 12.0];
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

export function makeTrainingData(data: Types.DBRace) {
  const result = data.entries.map((entry) => {
    const horseId = entry.horseId;
    const totalOrders = Object.keys(data.result.detail).length;
    const horseResult = data.result.detail.find((v) => v.horseId === horseId)
    const resultOrder = horseResult.order;
    const resultOrderValue = (totalOrders - resultOrder) / totalOrders; 
    const entryLogGapArray: Array<number[]> = [[],[],[],[],[],[]];

    for (let index = 0; index < 4; index ++) {
      if (entry.training?.logs[index]) {
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

      output: {
        result: resultOrderValue,
      }
    };
  });

  return result;
}
