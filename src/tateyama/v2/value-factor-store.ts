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
 * 比較条件と評価値を格納するValue型
 */

interface ConditionCompareValue {
  [cond: Tateyama.ConditionType]: { 
    [comp: Tateyama.ComparableType]: number;
  }
}

/**
 * ValueFactorStoreのデータ形式
 *
 * 評価項目に対する比較条件と、それに影響を与える状態項目の組み合わせ要素
 */

interface ValueFactorDataType {
  [factor: Tateyama.ValueFactorID]: { 
    condition: ConditionCompareValue;
    stateFactor: Tateyama.StateFactorStore;
  };
}

/**
 * 全ての数値項目(ValueFactor)、比較対象、比較条件に紐づく評価値を格納するストアクラス
 * 
 * @note シリアライズを楽にするためにメソッドなしのデータクラスとする
 *       メソッドが必要な場合はstaticにすること
 * 
 */

 export class ValueFactorStore {
  private data: ValueFactorDataType;

  constructor (data?: ValueFactorDataType) {
    this.data = data || {};

    /**
     * 値がない要素については空データで初期設定を行う
     */
    Object.values(Tateyama.ValueFactorID).forEach(factor => {
      if (!this.data[factor]) {
        this.data[factor] = { condition: {}, stateFactor: new Tateyama.StateFactorStore() };
      }

      Object.values(Tateyama.ConditionType).forEach(cond => 
        Object.values(Tateyama.ComparableType).forEach(comp => 
          ValueFactorStore.set(this, factor, comp, cond, randomFactorValue())
        )
      );
    });
  }

  public static get(
    store: ValueFactorStore,
    valueId: Tateyama.ValueFactorID,
    compType: Tateyama.ComparableType,
    condType: Tateyama.ConditionType,
    stateFactorIds: Tateyama.StateFactorID[]
  ): number {
    const { condition, stateFactor } = store.data[valueId];

    const valueFactorValue = condition?.[condType]?.[compType];
    if (valueFactorValue === 0) {
      return 0;
    }

    // 状態要素による加減点
    const stateFactorValue = stateFactorIds.map((id) => {
      return Tateyama.StateFactorStore.get(stateFactor, id) + 1.0;
    }).reduce((prev, curr) => prev * curr);

    return valueFactorValue * stateFactorValue;
  } 

  public static set(
    store: ValueFactorStore,
    valueId: Tateyama.ValueFactorID,
    compType: Tateyama.ComparableType,
    condType: Tateyama.ConditionType,
    value: number
  ) {
    if (!store.data[valueId]) {
      store.data[valueId] = { condition: {}, stateFactor: new Tateyama.StateFactorStore() };
    }
    if (!store.data[valueId].condition[condType]) {
      store.data[valueId].condition[condType] = {};
    }

    store.data[valueId].condition[condType][compType] = value;
  } 

  public static merge(base: ValueFactorStore, ref: ValueFactorStore): ValueFactorStore {
    // deepcopyで新しいインスタンスを作る
    const newValueFactor = JSON.parse(JSON.stringify(base)) as ValueFactorStore;
    const refValueFactor = JSON.parse(JSON.stringify(ref)) as ValueFactorStore;

    Object.values(Tateyama.ValueFactorID).forEach(factor => 
      Object.values(Tateyama.ConditionType).forEach(cond => 
        Object.values(Tateyama.ComparableType).forEach(comp => {
          // 半分の確率で片方からパラメータをもらう
          if (Math.random() < 0.5) {
            newValueFactor.data[factor].condition[cond][comp] = 
              refValueFactor.data[factor].condition[cond][comp] 
          }
          // 5%の確率で値を加算する
          if (Math.random() < 0.05) {
            newValueFactor.data[factor].condition[cond][comp] = addRandomFactorValue(
              newValueFactor.data[factor].condition[cond][comp]
            );
          }
          // 5%の確率で値を減産する
          if (Math.random() < 0.05) {
            newValueFactor.data[factor].condition[cond][comp] = subRandomFactorValue(
              newValueFactor.data[factor].condition[cond][comp]
            );
          }
          // 5%の確率で突然変異する
          if (Math.random() < 0.05) {
            newValueFactor.data[factor].condition[cond][comp] = randomFactorValue();
          }

          newValueFactor.data[factor].stateFactor = Tateyama.StateFactorStore.merge(
            newValueFactor.data[factor].stateFactor,
            refValueFactor.data[factor].stateFactor
          );
        })
      )
    );

    return newValueFactor;
  }

  public static toJSON(store: ValueFactorStore): string {
    return JSON.stringify(store);
  }

  public static fromJSON(json: string) {
    return new ValueFactorStore(JSON.parse(json));
  }
}
