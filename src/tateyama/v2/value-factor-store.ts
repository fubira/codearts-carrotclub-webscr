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

  public static toJSON(store: ValueFactorStore): string {
    return JSON.stringify(store);
  }

  public static fromJSON(json: string) {
    return new ValueFactorStore(JSON.parse(json));
  }
}
