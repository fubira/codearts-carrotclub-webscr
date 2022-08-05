import * as Tateyama from 'tateyama/v2';

function randomFactorValue() {
  return Math.random() > 0.5 ? 0.1 : 0;
}

/**
 * 比較条件と評価値を格納するValue型
 */
 interface ConditionCompareValue {
  [cond: Tateyama.ConditionType]: { 
    [comp: Tateyama.ComparableType]: number;
  }
}

/**
 * 評価項目に対する比較条件と、それに影響を与える状態項目の組み合わせ要素
 */
interface ValueFactorStoreType {
  [factor: Tateyama.ValueFactorID]: { 
    condition: ConditionCompareValue;
    stateFactor: Tateyama.StateFactorStore;
  };
}

/**
 * シリアライズしたValueFactorStoreの保存形式
 */
interface ValueFactorStoreSerializable {
  [key: Tateyama.ValueFactorID]: {
    conditionSerializable: ConditionCompareValue;
    stateFactorSerializable: string;
  }
}

/**
 * 全ての数値項目(ValueFactor)、比較対象、比較条件に紐づく評価値を格納するストアクラス
 */

 export class ValueFactorStore {
  private store: ValueFactorStoreType;

  constructor (store?: ValueFactorStoreType) {
    this.store = store || {};

    /**
     * 値がない要素については空データで初期設定を行う
     */
    Object.values(Tateyama.ValueFactorID).forEach(factor => {
      if (!this.store[factor]) {
        this.store[factor] = {
          condition: {},
          stateFactor: new Tateyama.StateFactorStore()
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

  public get(valueId: Tateyama.ValueFactorID, compType: Tateyama.ComparableType, condType: Tateyama.ConditionType, stateFactorIds: Tateyama.StateFactorID[]): number {
    const {
      condition,
      stateFactor
    } = this.store[valueId];

    const valueFactorValue = condition[condType][compType];
    if (valueFactorValue === 0) {
      return 0;
    }

    // 状態要素による加減点
    const stateFactorValue = stateFactorIds.map((id) => {
      return stateFactor.get(id) + 1.0;
    }).reduce((prev, curr) => prev * curr);

    return valueFactorValue * stateFactorValue;
  } 

  public set(valueId: Tateyama.ValueFactorID, compType: Tateyama.ComparableType, condType: Tateyama.ConditionType, value: number) {
    this.store[valueId].condition[condType][compType] = value;
  } 

  public static fromJSON(json: string) {
    const serialized = JSON.parse(json) as ValueFactorStoreSerializable;
    const store: ValueFactorStoreType = {};
    Object.keys(serialized).forEach((key) => {
      const {
        conditionSerializable,
        stateFactorSerializable,
      } = serialized[key];

      store[key] = {
        condition: conditionSerializable,
        stateFactor: Tateyama.StateFactorStore.fromJSON(stateFactorSerializable),
      };
    });

    return new ValueFactorStore(store);
  }

  public toJSON(): string {
    const serializable: ValueFactorStoreSerializable = {};

    Object.keys(this.store).forEach((key) => {
      serializable[key] = {
          conditionSerializable: this.store[key].condition,
          stateFactorSerializable: this.store[key].stateFactor.toJSON(),
        }
      }
    );    

    return JSON.stringify(serializable);
  }

}
