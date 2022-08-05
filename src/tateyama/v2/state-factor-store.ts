import * as Tateyama from 'tateyama/v2';

const MAX_FACTOR_VALUE = 2.5;
const MIN_FACTOR_VALUE = -0.5

function factorValueMinMax(value: number) {
  return Math.min(Math.max(value, MIN_FACTOR_VALUE), MAX_FACTOR_VALUE);
}

function randomFactorValue() {
  return factorValueMinMax(Math.sqrt(Math.random() * Math.random()));
}

function addRandomFactorValue(value: number): number {
  return factorValueMinMax(value + Math.random() * 0.1);
}

function subRandomFactorValue(value: number): number {
  return factorValueMinMax(value - Math.random() * 0.1);
}

/**
 * StateFactorStoreのデータ形式
 */
export interface StateFactorDataType {
  [key: Tateyama.StateFactorID]: number
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
    Object.values(Tateyama.StateFactorID).forEach(factor => {
      this.data[factor] = randomFactorValue();
    });
  }

  public static get(store: StateFactorStore, stateId: Tateyama.StateFactorID): number {
    return store.data[stateId];
  } 

  public static set(store: StateFactorStore, stateId: Tateyama.StateFactorID, value: number) {
    store.data[stateId] = value;
  }

  public static merge(base: StateFactorStore, ref: StateFactorStore): StateFactorStore {
    const newStateFactor = JSON.parse(JSON.stringify(base)) as StateFactorStore;
    const refStateFactor = JSON.parse(JSON.stringify(ref)) as StateFactorStore;

    Object.values(Tateyama.StateFactorID).forEach(factor => {
      // 半分の確率で片方からパラメータをもらう
      if (Math.random() < 0.5) {
        newStateFactor.data[factor] = refStateFactor.data[factor];
      }
      // 5%の確率で値を加算する
      if (Math.random() < 0.05) {
        newStateFactor.data[factor] = addRandomFactorValue(newStateFactor.data[factor]);
      }
      // 5%の確率で値を減産する
      if (Math.random() < 0.05) {
        newStateFactor.data[factor] = subRandomFactorValue(newStateFactor.data[factor]);
      }
      // 5%の確率で突然変異する
      if (Math.random() < 0.05) {
        newStateFactor.data[factor] = randomFactorValue();
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


