import * as Tateyama from 'tateyama/v2';

function randomFactorValue() {
  return Math.random() > 0.5 ? 0.1 : 0;
}


interface StateFactorStoreType {
  [key: Tateyama.StateFactorID]: number
}

type StateFactorStoreSerializable = StateFactorStoreType;

/**
 * 全ての状態項目(StateFactor)に紐づく評価値を格納するストアクラス
 */

export class StateFactorStore {
  private store: StateFactorStoreType;

  constructor(store?: StateFactorStoreType) {
    this.store = store || {};
    Object.values(Tateyama.StateFactorID).forEach(factor => {
      this.store[factor] = randomFactorValue();
    });
  }

  public get(stateId: Tateyama.StateFactorID): number {
    return this.store[stateId];
  } 

  public set(stateId: Tateyama.StateFactorID, value: number) {
    this.store[stateId] = value;
  }

  public static fromJSON(json: string) {
    const serialized = JSON.parse(json) as StateFactorStoreSerializable;
    const store: StateFactorStoreType = {};

    Object.keys(serialized).forEach((key) => {
      store[key] = serialized[key];
    });

    return new StateFactorStore(store);
  }

  public toJSON(): string {
    const serializable: StateFactorStoreSerializable = {};

    Object.keys(this.store).forEach((key) => {
      serializable[key] = this.store[key]
    });

    return JSON.stringify(serializable);
  }
}


