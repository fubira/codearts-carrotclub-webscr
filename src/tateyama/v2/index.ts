export * from './state';
import StateFactorID from './state';
import ValueFactorID from './value';
import ConditionType from 'tateyama/v2/condition';
import ComparableType from 'tateyama/v2/comparable';

/**
 * 全てのStateFactorIDに対する要素への掛け率
 */
 export type StateFactor = { [key in StateFactorID]: number };

 /**
  * 全てのValueFactorIDに対する比較条件と評価値の定義
  */
export type ValueFactor = { [key in ValueFactorID]: {
  // 要素の比較対象
  comparable: ComparableType;

  // 要素の比較条件
  condition: ConditionType;

  // マッチした条件に対して加算される評価値
  rate: number;

  // 固定要素が評価値に与える影響値
  stateFactor: StateFactor;
}};