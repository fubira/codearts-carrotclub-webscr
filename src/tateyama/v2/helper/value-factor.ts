import logger from 'logger';
import * as Tateyama from 'tateyama/v2';
import * as TateyamaV1 from 'tateyama/v1/types/database';

const compare = (value: number, comparable: number, cond: Tateyama.ConditionType) => {
  if (cond === Tateyama.ConditionType.$eq) {
    return value === comparable;
  }
  if (cond === Tateyama.ConditionType.$ne) {
    return value != comparable;
  }
  if (cond === Tateyama.ConditionType.$gte) {
    return value <= comparable;
  }
  if (cond === Tateyama.ConditionType.$lte) {
    return value >= comparable;
  }
  if (cond === Tateyama.ConditionType.$eqa) {
    return value >= comparable;
  }
  return false;
}

/**
 * 指定された比較タイプの使用する比較基準関数を返す。
 *
 * @param type 
 * @returns 
 */
const getComparsionFunc = (type: Tateyama.ComparableType): ((values: number[]) => number) => {
  const max = (values: number[]): number => Math.max(...values);
  const min = (values: number[]): number => Math.min(...values);
  const avg = (values: number[]): number => values.reduce((a, b) => a + b) / values.length;

  if (type.endsWith('max')) {
    return max;
  }
  if (type.endsWith('min')) {
    return min;
  }

  return avg;
}

const getAggregateFunc = (type: Tateyama.ComparableType, value: (target: TateyamaV1.DBEntry) => number): (entries: TateyamaV1.DBEntry[]) => number[] => {
  if (type.startsWith('allcurrent')) {
    return (entries: TateyamaV1.DBEntry[]) => entries.map((e) => value(e));
  }
  if (type.startsWith('allprev')) {
    logger.warn(`getAggregateFunc - ${type} is unimplemented`);
    return (entries: TateyamaV1.DBEntry[]) => entries.map((e) => value(e));
  }
  if (type.startsWith('allprev2r')) {
    logger.warn(`getAggregateFunc - ${type} is unimplemented`);
    return (entries: TateyamaV1.DBEntry[]) => entries.map((e) => value(e));
  }
  if (type.startsWith('allprev3r')) {
    logger.warn(`getAggregateFunc - ${type} is unimplemented`);
    return (entries: TateyamaV1.DBEntry[]) => entries.map((e) => value(e));
  }
  if (type.startsWith('selfprev')) {
    logger.warn(`getAggregateFunc - ${type} is unimplemented`);
    return (entries: TateyamaV1.DBEntry[]) => entries.map((e) => value(e));
  }
  if (type.startsWith('selfprev2r')) {
    logger.warn(`getAggregateFunc - ${type} is unimplemented`);
    return (entries: TateyamaV1.DBEntry[]) => entries.map((e) => value(e));
  }
  if (type.startsWith('selfprev3r')) {
    logger.warn(`getAggregateFunc - ${type} is unimplemented`);
    return (entries: TateyamaV1.DBEntry[]) => entries.map((e) => value(e));
  }
}

export function matchValueFactor(
  race: TateyamaV1.DBRace,
  horseId: number,
  id: Tateyama.ValueFactorID,
  cond: Tateyama.ConditionType,
  comp: Tateyama.ComparableType
): boolean {
  const entry = race.entries[horseId];

  switch (id) {
    case Tateyama.ValueFactorID.EntryHandicap: {
      const value = entry.handicap;
      const aggrFunc = getAggregateFunc(comp, (target) => target.handicap);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryOdds: {
      const value = entry.odds;
      const aggrFunc = getAggregateFunc(comp, (target) => target.odds);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryOddsWinRate: {
      const value = entry.odds;
      const aggrFunc = getAggregateFunc(comp, (target) => target.odds);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryOddsRank: {
      const value = entry.oddsRank;
      const aggrFunc = getAggregateFunc(comp, (target) => target.oddsRank);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryHeavy: {
      const value = entry.horseWeight;
      const aggrFunc = getAggregateFunc(comp, (target) => target.horseWeight);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryHeavyDiff: {
      const value = entry.horseWeightDiff;
      const aggrFunc = getAggregateFunc(comp, (target) => target.horseWeightDiff);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryResultRuns: {
      const value = entry.horseWeightDiff;
      const aggrFunc = getAggregateFunc(comp, (target) => target.horseWeightDiff);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryResultWins: {
      const value = entry.horseWeightDiff;
      const aggrFunc = getAggregateFunc(comp, (target) => target.horseWeightDiff);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryResultTopTwo: {
      const value = entry.horseWeightDiff;
      const aggrFunc = getAggregateFunc(comp, (target) => target.horseWeightDiff);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }

    case Tateyama.ValueFactorID.EntryResultTopThree: {
      const value = entry.horseWeightDiff;
      const aggrFunc = getAggregateFunc(comp, (target) => target.horseWeightDiff);
      const compFunc = getComparsionFunc(comp);
      return compare(value, compFunc(aggrFunc(race.entries)), cond);
    }
  }
}
