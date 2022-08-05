import * as Tateyama from 'tateyama/v2';

function randomFactorValue() {
  return Math.random() > 0.5 ? 0.1 : 0;
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

  public static toJSON(store: StateFactorStore): string {
    return JSON.stringify(store)
  }

  public static fromJSON(json: string): StateFactorStore {
    return new StateFactorStore(JSON.parse(json));
  }
}


