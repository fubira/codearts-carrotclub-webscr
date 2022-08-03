import StateFactorID from './types/state';
import ValueFactorID from './types/value';
import ConditionType from 'tateyama/v2/types/condition';
import ComparableType from 'tateyama/v2/types/comparable';

function randomFactorValue() {
  return Math.random() > 0.5 ? 0.1 : 0;
}

/**
 * 全ての状態項目(StateFactor)に紐づく評価値を格納するストアクラス
 */

export class StateFactorStore {
  private store: { [key: StateFactorID]: number };

  constructor() {
    this.store = {};
    Object.values(StateFactorID).forEach(factor => {
      this.store[factor] = randomFactorValue();
    });
  }

  get(stateId: StateFactorID): number {
    return this.store[stateId];
  } 

  set(stateId: StateFactorID, value: number) {
    this.store[stateId] = value;
  } 
}

/**
 * 全ての数値項目(ValueFactor)、比較対象、比較条件に紐づく評価値を格納するストアクラス
 */

export class ValueFactorStore {
  private store: {
    [factor: ValueFactorID]: { 
      condition: {
        [cond: ConditionType]: { 
          [comp: ComparableType]: number;
        }
      };
      stateFactor: StateFactorStore;
    };
  };

  constructor () {
    this.store = {};
    Object.values(ValueFactorID).forEach(factor => {
      if (!this.store[factor]) {
        this.store[factor] = {
          condition: {},
          stateFactor: new StateFactorStore()
        };
      }

      Object.values(ConditionType).forEach(cond => {
        if (!this.store[factor].condition[cond]) {
          this.store[factor].condition[cond] = {};
        }

        Object.values(ComparableType).forEach(comp => {
          this.store[factor].condition[cond][comp] = randomFactorValue();
        });
      });
    });
  }

  get(valueId: ValueFactorID, compType: ComparableType, condType: ConditionType): number {
    return this.store[valueId].condition[compType][condType];
  } 

  set(valueId: ValueFactorID, compType: ComparableType, condType: ConditionType, value: number) {
    this.store[valueId].condition[compType][condType] = value;
  } 
}
