import { writeFileSync } from 'fs';

import logger from 'logger';

import TateyamaDB from 'db';
import { Types, Helper } from 'tateyama';

const CSV_HEAD = [
  "# result time",
  "# result last3f",
  "# course turf",
  "# course dirt",
  "# course state firm",
  "# course state good",
  "# course state yielding",
  "# course state soft",
  "# course dir left",
  "# course dir right",
  "# course distance sprint",
  "# course distance mile",
  "# course distance middle",
  "# course distance long",
  "# entry male",
  "# entry female",
  "# entry gelding",
  "# entry weight",
  "# entry weight diff",
  "# entry handicap",
  "# entry present training course hakodate wood",
  "# entry present training course hakodate dirt",
  "# entry present training course hakodate turf",
  "# entry present training course sapporo dirt",
  "# entry present training course sapporo turf",
  "# entry present training course miho slope",
  "# entry present training course miho south wood",
  "# entry present training course miho south poly",
  "# entry present training course ritto cw",
  "# entry present training course ritto slope",
  "# entry present training course state firm",
  "# entry present training course state good",
  "# entry present training course state yielding",
  "# entry present training course state soft",
  "# entry present training lap 4F",
  "# entry present training lap 3F",
  "# entry present training lap 2F",
  "# entry present training lap 1F",
  "# entry present training gap 4F",
  "# entry present training gap 3F",
  "# entry present training gap 2F",
  "# entry present training gap 1F",
  "# entry present training accel",
  "# entry fastest training course hakodate wood",
  "# entry fastest training course hakodate dirt",
  "# entry fastest training course hakodate turf",
  "# entry fastest training course sapporo dirt",
  "# entry fastest training course sapporo turf",
  "# entry fastest training course miho slope",
  "# entry fastest training course miho south wood",
  "# entry fastest training course miho south poly",
  "# entry fastest training course ritto cw",
  "# entry fastest training course ritto slope",
  "# entry fastest training course state firm",
  "# entry fastest training course state good",
  "# entry fastest training course state yielding",
  "# entry fastest training course state soft",
  "# entry fastest training lap 4F",
  "# entry fastest training lap 3F",
  "# entry fastest training lap 2F",
  "# entry fastest training lap 1F",
  "# entry fastest training gap 4F",
  "# entry fastest training gap 3F",
  "# entry fastest training gap 2F",
  "# entry fastest training gap 1F",
  "# entry fastest training accel",
  "# entry last training course hakodate wood",
  "# entry last training course hakodate dirt",
  "# entry last training course hakodate turf",
  "# entry last training course sapporo dirt",
  "# entry last training course sapporo turf",
  "# entry last training course miho slope",
  "# entry last training course miho south wood",
  "# entry last training course miho south poly",
  "# entry last training course ritto cw",
  "# entry last training course ritto slope",
  "# entry last training course state firm",
  "# entry last training course state good",
  "# entry last training course state yielding",
  "# entry last training course state soft",
  "# entry last training lap 4F",
  "# entry last training lap 3F",
  "# entry last training lap 2F",
  "# entry last training lap 1F",
  "# entry last training gap 4F",
  "# entry last training gap 3F",
  "# entry last training gap 2F",
  "# entry last training gap 1F",
  "# entry last training accel",
];


/**
 * 1レースごとの出走馬データを変換
 * @param data 
 * @returns 
 */
export function generateDataset(data: Types.DBRace) {
  const isCourseTurf = data.course.type === '芝' ? 1 : 0;
  const isCourseDirt = data.course.type === 'ダート' ? 1 : 0;
  const isCourseConditionFirmStandard = data.course.condition === '良' ? 1 : 0;
  const isCourseConditionGood = data.course.condition === '稍重' ? 1 : 0;
  const isCourseConditionYieldingMuddy = data.course.condition === '重' ? 1 : 0;
  const isCourseConditionSoftSloppy = data.course.condition === '不良' ? 1 : 0;

  const isCourseDirectionLeft = data.course.direction === '左' ? 1 : 0;
  const isCourseDirectionRight = data.course.direction === '右' ? 1 : 0;
  const isCourseDistanceSprint = (data.course.distance <= 1400) ? 1 : 0;
  const isCourseDistanceMile = (data.course.distance >= 1400 && data.course.distance) <= 1800 ? 1 : 0;
  const isCourseDistanceMiddle = (data.course.distance >= 1800 && data.course.distance) <= 2200 ? 1 : 0;
  const isCourseDistanceLong = (data.course.distance >= 2200) ? 1 : 0;

  const result = data.entries.map((entry) => {
    const horseId = entry.horseId;
    const result = data.result.detail.find((d) => d.horseId === horseId);
    if (!result) {
      return;
    }
    const resultLast3fSec = result.last3fSec;
    const resultTimeSec = result.timeSec;
    
    const isHorseMale = entry.horseSex === '牡' ? 1 : 0;
    const isHorseFemale = entry.horseSex === '牝' ? 1 : 0; 
    const isHorseGelding = entry.horseSex === 'セン' ? 1 : 0; 
    const horseWeight = entry.horseWeight;
    const horseWeightDiff = entry.horseWeightDiff;
    const horseHandicap = entry.handicap;

    const presentTraining = entry.training.logs.slice(-1)[0];
    const fastestTraining = entry.training.logs.sort((a, b) => a.lap[0]?.lap - b.lap[0]?.lap )[0];
    const lastTraining = entry.training.logs[0];

    const sumTrainingAccel = (lapgap: Types.DBLapGap[]) => {
      return Helper.RoundTime(lapgap.map((p, index) => p.accel * (1 + index / 10))?.reduce((prev, curr) => prev + curr, 0));
    }

    const isPresentTrainingCourseHakodateWood = presentTraining.course.includes('函館Ｗ') ? 1 : 0;
    const isPresentTrainingCourseHakodateDirt = presentTraining.course.includes('函館ダ') ? 1 : 0;
    const isPresentTrainingCourseHakodateTurf = presentTraining.course.includes('函館芝') ? 1 : 0;
    const isPresentTrainingCourseSapporoDirt = presentTraining.course.includes('札幌ダ') ? 1 : 0;
    const isPresentTrainingCourseSapporoTurf = presentTraining.course.includes('札幌芝') ? 1 : 0;
    const isPresentTrainingCourseMihoSlope = presentTraining.course.includes('美坂') ? 1 : 0;
    const isPresentTrainingCourseMihoSouthW = presentTraining.course.includes('南Ｗ') ? 1 : 0;
    const isPresentTrainingCourseMihoSouthP = presentTraining.course.includes('南Ｐ') ? 1 : 0;
    const isPresentTrainingCourseRittoCWood = presentTraining.course.includes('栗ＣＷ') ? 1 : 0;
    const isPresentTrainingCourseRittoSlope = presentTraining.course.includes('栗坂') ? 1 : 0;
    const isPresentTrainingConditionFirm = presentTraining.condition === '良' ? 1 : 0;
    const isPresentTrainingConditionGood = presentTraining.condition === '稍重' ? 1 : 0;
    const isPresentTrainingConditionYielding = presentTraining.condition === '重' ? 1 : 0;
    const isPresentTrainingConditionSoft = presentTraining.condition === '不良' ? 1 : 0;

    const presentTraningLap = presentTraining.lap.slice(-4);
    const presentTraningLap1f = presentTraningLap[0]?.lap || 99.0;
    const presentTraningLap2f = presentTraningLap[1]?.lap || 99.0;
    const presentTraningLap3f = presentTraningLap[2]?.lap || 99.0;
    const presentTraningLap4f = presentTraningLap[3]?.lap || 99.0;
    const presentTraningLapGap1f = presentTraningLap[0]?.gap || 99.0;
    const presentTraningLapGap2f = presentTraningLap[1]?.gap || 99.0;
    const presentTraningLapGap3f = presentTraningLap[2]?.gap || 99.0;
    const presentTraningLapGap4f = presentTraningLap[3]?.gap || 99.0;
    const presentTraningAccel = sumTrainingAccel(presentTraningLap);

    const isFastestTrainingCourseHakodateWood = fastestTraining.course.includes('函館Ｗ') ? 1 : 0;
    const isFastestTrainingCourseHakodateDirt = fastestTraining.course.includes('函館ダ') ? 1 : 0;
    const isFastestTrainingCourseHakodateTurf = fastestTraining.course.includes('函館芝') ? 1 : 0;
    const isFastestTrainingCourseSapporoDirt = fastestTraining.course.includes('札幌ダ') ? 1 : 0;
    const isFastestTrainingCourseSapporoTurf = fastestTraining.course.includes('札幌芝') ? 1 : 0;
    const isFastestTrainingCourseMihoSlope = fastestTraining.course.includes('美坂') ? 1 : 0;
    const isFastestTrainingCourseMihoSouthW = fastestTraining.course.includes('南Ｗ') ? 1 : 0;
    const isFastestTrainingCourseMihoSouthP = fastestTraining.course.includes('南Ｐ') ? 1 : 0;
    const isFastestTrainingCourseRittoCWood = fastestTraining.course.includes('栗ＣＷ') ? 1 : 0;
    const isFastestTrainingCourseRittoSlope = fastestTraining.course.includes('栗坂') ? 1 : 0;
    const isFastestTrainingConditionFirm = fastestTraining.condition === '良' ? 1 : 0;
    const isFastestTrainingConditionGood = fastestTraining.condition === '稍重' ? 1 : 0;
    const isFastestTrainingConditionYielding = fastestTraining.condition === '重' ? 1 : 0;
    const isFastestTrainingConditionSoft = fastestTraining.condition === '不良' ? 1 : 0;

    const fastestTraningLap = fastestTraining.lap.slice(-4);
    const fastestTraningLap1f = fastestTraningLap[0]?.lap || 99.0;
    const fastestTraningLap2f = fastestTraningLap[1]?.lap || 99.0;
    const fastestTraningLap3f = fastestTraningLap[2]?.lap || 99.0;
    const fastestTraningLap4f = fastestTraningLap[3]?.lap || 99.0;
    const fastestTraningLapGap1f = fastestTraningLap[0]?.gap || 99.0;
    const fastestTraningLapGap2f = fastestTraningLap[1]?.gap || 99.0;
    const fastestTraningLapGap3f = fastestTraningLap[2]?.gap || 99.0;
    const fastestTraningLapGap4f = fastestTraningLap[3]?.gap || 99.0;
    const fastestTraningAccel = sumTrainingAccel(fastestTraningLap);

    const isLastTrainingCourseHakodateWood = lastTraining.course.includes('函館Ｗ') ? 1 : 0;
    const isLastTrainingCourseHakodateDirt = lastTraining.course.includes('函館ダ') ? 1 : 0;
    const isLastTrainingCourseHakodateTurf = lastTraining.course.includes('函館芝') ? 1 : 0;
    const isLastTrainingCourseSapporoDirt = lastTraining.course.includes('札幌ダ') ? 1 : 0;
    const isLastTrainingCourseSapporoTurf = lastTraining.course.includes('札幌芝') ? 1 : 0;
    const isLastTrainingCourseMihoSlope = lastTraining.course.includes('美坂') ? 1 : 0;
    const isLastTrainingCourseMihoSouthW = lastTraining.course.includes('南Ｗ') ? 1 : 0;
    const isLastTrainingCourseMihoSouthP = lastTraining.course.includes('南Ｐ') ? 1 : 0;
    const isLastTrainingCourseRittoCWood = lastTraining.course.includes('栗ＣＷ') ? 1 : 0;
    const isLastTrainingCourseRittoSlope = lastTraining.course.includes('栗坂') ? 1 : 0;
    const isLastTrainingConditionFirm = lastTraining.condition === '良' ? 1 : 0;
    const isLastTrainingConditionGood = lastTraining.condition === '稍重' ? 1 : 0;
    const isLastTrainingConditionYielding = lastTraining.condition === '重' ? 1 : 0;
    const isLastTrainingConditionSoft = lastTraining.condition === '不良' ? 1 : 0;

    const lastTraningLap = lastTraining.lap.slice(-4);
    const lastTraningLap1f = lastTraningLap[0]?.lap || 99.0;
    const lastTraningLap2f = lastTraningLap[1]?.lap || 99.0;
    const lastTraningLap3f = lastTraningLap[2]?.lap || 99.0;
    const lastTraningLap4f = lastTraningLap[3]?.lap || 99.0;
    const lastTraningLapGap1f = lastTraningLap[0]?.gap || 99.0;
    const lastTraningLapGap2f = lastTraningLap[1]?.gap || 99.0;
    const lastTraningLapGap3f = lastTraningLap[2]?.gap || 99.0;
    const lastTraningLapGap4f = lastTraningLap[3]?.gap || 99.0;
    const lastTraningAccel = sumTrainingAccel(lastTraningLap);

    return [
      resultTimeSec,
      resultLast3fSec,
      isCourseTurf,
      isCourseDirt,
      isCourseConditionFirmStandard,
      isCourseConditionGood,
      isCourseConditionYieldingMuddy,
      isCourseConditionSoftSloppy,
      isCourseDirectionLeft,
      isCourseDirectionRight,
      isCourseDistanceSprint,
      isCourseDistanceMile,
      isCourseDistanceMiddle,
      isCourseDistanceLong,
      isHorseMale,
      isHorseFemale,
      isHorseGelding,
      horseWeight,
      horseWeightDiff,
      horseHandicap,
      isPresentTrainingCourseHakodateWood,
      isPresentTrainingCourseHakodateDirt,
      isPresentTrainingCourseHakodateTurf,
      isPresentTrainingCourseSapporoDirt,
      isPresentTrainingCourseSapporoTurf,
      isPresentTrainingCourseMihoSlope,
      isPresentTrainingCourseMihoSouthW,
      isPresentTrainingCourseMihoSouthP,
      isPresentTrainingCourseRittoCWood,
      isPresentTrainingCourseRittoSlope,
      isPresentTrainingConditionFirm,
      isPresentTrainingConditionGood,
      isPresentTrainingConditionYielding,
      isPresentTrainingConditionSoft,
      presentTraningLap1f,
      presentTraningLap2f,
      presentTraningLap3f,
      presentTraningLap4f,
      presentTraningLapGap1f,
      presentTraningLapGap2f,
      presentTraningLapGap3f,
      presentTraningLapGap4f,
      presentTraningAccel,
      isFastestTrainingCourseHakodateWood,
      isFastestTrainingCourseHakodateDirt,
      isFastestTrainingCourseHakodateTurf,
      isFastestTrainingCourseSapporoDirt,
      isFastestTrainingCourseSapporoTurf,
      isFastestTrainingCourseMihoSlope,
      isFastestTrainingCourseMihoSouthW,
      isFastestTrainingCourseMihoSouthP,
      isFastestTrainingCourseRittoCWood,
      isFastestTrainingCourseRittoSlope,
      isFastestTrainingConditionFirm,
      isFastestTrainingConditionGood,
      isFastestTrainingConditionYielding,
      isFastestTrainingConditionSoft,
      fastestTraningLap1f,
      fastestTraningLap2f,
      fastestTraningLap3f,
      fastestTraningLap4f,
      fastestTraningLapGap1f,
      fastestTraningLapGap2f,
      fastestTraningLapGap3f,
      fastestTraningLapGap4f,
      fastestTraningAccel,
      isLastTrainingCourseHakodateWood,
      isLastTrainingCourseHakodateDirt,
      isLastTrainingCourseHakodateTurf,
      isLastTrainingCourseSapporoDirt,
      isLastTrainingCourseSapporoTurf,
      isLastTrainingCourseMihoSlope,
      isLastTrainingCourseMihoSouthW,
      isLastTrainingCourseMihoSouthP,
      isLastTrainingCourseRittoCWood,
      isLastTrainingCourseRittoSlope,
      isLastTrainingConditionFirm,
      isLastTrainingConditionGood,
      isLastTrainingConditionYielding,
      isLastTrainingConditionSoft,
      lastTraningLap1f,
      lastTraningLap2f,
      lastTraningLap3f,
      lastTraningLap4f,
      lastTraningLapGap1f,
      lastTraningLapGap2f,
      lastTraningLapGap3f,
      lastTraningLapGap4f,
      lastTraningAccel,
    ];
  });

  return result;
}


export default async (idReg: string, options: { output: string }) => {
 
  try {
    const { docs, warning } = await TateyamaDB.query(idReg);

    if (options.output) {
        if (docs) {
        logger.info(`${docs.length}件のデータがマッチしました`);
      }
      if (warning) {
        logger.warn(warning);
      }
    }

    const headerCsv = `${CSV_HEAD.join(',')}\n`;
    writeFileSync(options.output, headerCsv, { flag: "w" });
    
    while (docs.length > 0) {
      const data = docs.splice(0, 100);
      const line = data.flatMap((d) => generateDataset(d));
      const csv = line.map((v) => v.join(',')).join('\n');

      if (options.output) {
        writeFileSync(options.output, csv, { flag: "a+" });
      } else {
        console.log(csv);
      }
    }


  } catch (err) {
    logger.error(err);
  }
}
