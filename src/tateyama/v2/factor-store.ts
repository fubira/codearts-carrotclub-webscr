import * as Tateyama from 'tateyama/v2';

function randomFactorValue() {
  return Math.random() > 0.5 ? 0.1 : 0;
}

/**
 * 全ての状態項目(StateFactor)に紐づく評価値を格納するストアクラス
 */

export class StateFactorStore {
  private store: { [key: Tateyama.StateFactorID]: number };

  constructor() {
    this.store = {};
    Object.values(Tateyama.StateFactorID).forEach(factor => {
      this.store[factor] = randomFactorValue();
    });
  }

  get(stateId: Tateyama.StateFactorID): number {
    return this.store[stateId];
  } 

  set(stateId: Tateyama.StateFactorID, value: number) {
    this.store[stateId] = value;
  } 
}

/**
 * 全ての数値項目(ValueFactor)、比較対象、比較条件に紐づく評価値を格納するストアクラス
 */

export class ValueFactorStore {
  private store: {
    [factor: Tateyama.ValueFactorID]: { 
      condition: {
        [cond: Tateyama.ConditionType]: { 
          [comp: Tateyama.ComparableType]: number;
        }
      };
      stateFactor: StateFactorStore;
    };
  };

  constructor () {
    this.store = {};
    Object.values(Tateyama.ValueFactorID).forEach(factor => {
      if (!this.store[factor]) {
        this.store[factor] = {
          condition: {},
          stateFactor: new StateFactorStore()
        };
      }

      Object.values(Tateyama.ConditionType).forEach(cond => {
        if (!this.store[factor].condition[cond]) {
          this.store[factor].condition[cond] = {};
        }

        Object.values(Tateyama.ComparableType).forEach(comp => {
          this.store[factor].condition[cond][comp] = randomFactorValue();
        });
      });
    });
  }

  get(valueId: Tateyama.ValueFactorID, compType: Tateyama.ComparableType, condType: Tateyama.ConditionType, stateFactorIds: Tateyama.StateFactorID[]): number {
    // 状態要素による加減点
    const stateFactor = stateFactorIds.map((id) => {
      return this.store[valueId].stateFactor.get(id) + 1.0;
    }).reduce((prev, curr) => prev * curr);

    return this.store[valueId].condition[condType][compType] * stateFactor;
  } 

  set(valueId: Tateyama.ValueFactorID, compType: Tateyama.ComparableType, condType: Tateyama.ConditionType, value: number) {
    this.store[valueId].condition[condType][compType] = value;
  } 
}
