/**
 * レース固定要素の定義
 */
const TrainingStateFactorID = {
  // 競馬場
  TrainingCourseMihoWood: "trainingcourse/mihowood",
  TrainingCourseMihoSlope: "trainingcourse/mihoslope",
  TrainingCourseMihoPoly: "trainingcourse/mihopoly",

  // コース状態タイプ
  TrainingCourseConditionFirm: "trainingcoursecondition/firm",
  TrainingCourseConditionGood: "trainingcoursecondition/good",
  TrainingCourseConditionWorthThanGood: "trainingcoursecondition/worthgood",
  TrainingCourseConditionWorthThanYielding: "trainingcoursecondition/worthyielding",
  TrainingCourseConditionWorthThanHeavy: "trainingcoursecondition/worthheavy",
}

type TrainingStateFactorID = typeof TrainingStateFactorID[keyof typeof TrainingStateFactorID];

export default TrainingStateFactorID;
