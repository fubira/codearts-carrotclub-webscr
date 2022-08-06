export * from './types';
export * from './helper';
import { AI } from 'tateyama';

const MAX_FACTOR_VALUE = 1.5;
const MIN_FACTOR_VALUE = -0.5

function factorValueMinMax(value: number) {
  return Math.min(Math.max(value, MIN_FACTOR_VALUE), MAX_FACTOR_VALUE);
}

function randomFactorValue() {
  return factorValueMinMax(Math.sqrt(Math.random() > 0.5 ? 0.1 : 0));
}

function addRandomFactorValue(value: number): number {
  return factorValueMinMax(value + Math.random() * 0.1);
}

function subRandomFactorValue(value: number): number {
  return factorValueMinMax(value - Math.random() * 0.1);
}

function modFactorValue(value: number): number {
  return factorValueMinMax(value / 1.1);
}

/**
 * StateFactorStoreのデータ形式
 */
export interface StateFactorDataType {
  [key: AI.StateFactorID]: { value: number; exp: number }
}

/**
 * 全ての状態項目(StateFactor)に紐づく評価値を格納するストアクラス
 * 
 * @note シリアライズを楽にするためにメソッドなしのデータクラスとする
 *       メソッドが必要な場合はstaticにすること
 */

export class StateFactorStore {
  private data: StateFactorDataType;

  constructor(data?: StateFactorDataType) {
    this.data = data || {};
    Object.values(AI.StateFactorID).forEach(factor => {
      this.data[factor] = { value: 0, exp: 0 };
    });
  }

  public static get(store: StateFactorStore, stateId: AI.StateFactorID): number {
    return store.data[stateId].value;
  } 

  public static set(store: StateFactorStore, stateId: AI.StateFactorID, value: number) {
    store.data[stateId].value = value;
  }

  public static addExp(store: StateFactorStore, stateId: AI.StateFactorID) {
    store.data[stateId].exp = store.data[stateId].exp + 1;
  }

  public static merge(base: StateFactorStore, ref: StateFactorStore): StateFactorStore {
    const newStateFactor = JSON.parse(JSON.stringify(base)) as StateFactorStore;
    const refStateFactor = JSON.parse(JSON.stringify(ref)) as StateFactorStore;

    Object.values(AI.StateFactorID).forEach(factor => {
      // 半分の確率で片方からパラメータをもらう
      if (Math.random() < 0.5) {
        newStateFactor.data[factor] = refStateFactor.data[factor];
      }

      // 的中経験のある値は加算する 的中なしの項目は減らす
      if (newStateFactor.data[factor].exp > 0) {
        newStateFactor.data[factor].value = addRandomFactorValue(newStateFactor.data[factor].value);
      } else {
        newStateFactor.data[factor].value = modFactorValue(newStateFactor.data[factor].value);
      }
      newStateFactor.data[factor].exp = 0;


      // 5%の確率で値を加算する
      if (Math.random() < 0.05) {
        newStateFactor.data[factor].value = addRandomFactorValue(newStateFactor.data[factor].value);
      }
      // 5%の確率で値を減産する
      if (Math.random() < 0.05) {
        newStateFactor.data[factor].value = subRandomFactorValue(newStateFactor.data[factor].value);
      }
      // 5%の確率で突然変異する
      if (Math.random() < 0.05) {
        // newStateFactor.data[factor].value = randomFactorValue();
      }
    });

    return newStateFactor;
  }

  public static toJSON(store: StateFactorStore): string {
    return JSON.stringify(store)
  }

  public static fromJSON(json: string): StateFactorStore {
    return new StateFactorStore(JSON.parse(json));
  }
}


