/**
 * 比較条件
 */
const ConditionType = {
  // 以上
  $gte: "$gte",

  // 以下
  $lte: "$lte",

  // 同じ
  $eq: "$eq",

  // 違う
  $ne: "$ne",

  // おおむね同じ
  $eqa: "$eqa",

  // かなり差がある
  $nea: "$nea",
}

type ConditionType = typeof ConditionType[keyof typeof ConditionType];

export default ConditionType;
