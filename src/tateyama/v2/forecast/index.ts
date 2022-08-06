export * from './types';
export * from './helper';
export * from './state-factor';
export * from './value-factor';

import phonetic from 'phonetic';
import { Forecast, DB } from 'tateyama';

import * as Tateyama from 'tateyama';

export class ForecastAI {
  private valueFactorIds = Object.values(Forecast.ValueFactorID);
  private conditionTypes = Object.values(Forecast.ConditionType);
  private comparableTypes = Object.values(Forecast.ComparableType);
  private params: Tateyama.Forecast.ForecastParams;

  constructor () {
    this.params = {
      name: phonetic.generate({ syllables: 2, compoundSimplicity: 6, phoneticSimplicity: 6 }),
      family: phonetic.generate({ syllables: 2, compoundSimplicity: 6, phoneticSimplicity: 6 }),
      generation: 0,
      store: new Forecast.ValueFactorStore()
    };
  }

  public get name(): string {
    return `${this.params.family}${this.params.name}_${this.params.generation}`;
  }

  /**
   * 自己の持つ評価関数(ValueFactorStore)をもとにDBRaceを評価した予想結果を返す
   * 
   * @param race 
   */
  public forecast(race: DB.DBRace) {
    const raceStateFactorIds = Forecast.getRaceStateFactor(race);

    /**
     * すべてのパラメータからValueFactorを算出する
     */
    const entryValueFactors = race.entries.map((entry) => {
      const horseStateFactorIds = Forecast.getHorseStateFactor(entry);

      const stateFactorIds = [
        ...raceStateFactorIds,
        ...horseStateFactorIds
      ];

      let forecastValue = 0;

      this.valueFactorIds.forEach((valueId) => 
        this.conditionTypes.forEach((condType) =>
          this.comparableTypes.forEach((compType) => {
            forecastValue = forecastValue + (
              Forecast.matchValueFactor(race, entry.horseId, valueId, condType, compType)
                ? Forecast.ValueFactorStore.get(this.params.store, valueId, compType, condType, stateFactorIds) : 0
              );
          })
        )
      );

      return {
        horseId: entry.horseId,
        horseName: entry.horseName,
        odds: entry.odds,
        forecastValue,
      };
    });

    /**
     * 出走全馬の予想レートの合計を取得
     */
    const totalValueFactor = entryValueFactors.map((v) => v.forecastValue).reduce((prev, curr) => prev + curr) || 1;

    /**
     *  出走全馬のオッズ勝率合計を算出
     *  (テラ銭分があるので1にならない)
     */
    const totalWinRate = race.entries.map((e) => Forecast.OddsToWinRate(e.odds)).reduce((prev, curr) => prev + curr);

    /**
     * 成形
     */
    const result = entryValueFactors.map((valueFactor) => {
      const forecastWinRate = (valueFactor.forecastValue * 100 / totalValueFactor);
      const oddsWinRate = (Forecast.OddsToWinRate(valueFactor.odds) * 100) / totalWinRate;
      const benefitRate = (forecastWinRate / oddsWinRate);

      return { ...valueFactor, forecastWinRate, oddsWinRate, benefitRate };
    }).sort((a, b) => b.forecastValue - a.forecastValue);

    return result;
  }

  /**
   * 的中に関連した要素に経験値を加算する
   * 
   * @param race 
   */
   public addExp(race: DB.DBRace) {
    const raceStateFactorIds = Forecast.getRaceStateFactor(race);

    const top3detail = race.result.detail.slice(0, 3);
    const top3horseId = top3detail.map((v) => v.horseId);
    const top3entry = race.entries.filter((e) => top3horseId.includes(e.horseId));

    top3entry.forEach((entry) => {
      const horseStateFactorIds = Forecast.getHorseStateFactor(entry);
      const stateFactorIds = [ ...raceStateFactorIds, ...horseStateFactorIds];

      this.valueFactorIds.forEach((valueId) => 
        this.conditionTypes.forEach((condType) =>
          this.comparableTypes.forEach((compType) => {
            Forecast.matchValueFactor(race, entry.horseId, valueId, condType, compType) &&
              Forecast.ValueFactorStore.addExp(this.params.store, valueId, compType, condType, stateFactorIds);
          })
        )
      );
    });
  }

  public static merge(parentBase: ForecastAI, parentRef: ForecastAI): ForecastAI {
    const newForecast = new ForecastAI();
    newForecast.params.family = parentBase.params.family;
    newForecast.params.generation = (parentBase.params.generation || 0) + 1;
    newForecast.params.store = Forecast.ValueFactorStore.merge(parentBase.params.store, parentRef.params.store);
    return newForecast;
  }

  /**
   * JSON デシリアライザ
   * @param json 
   * @returns 
   */
  public static fromJSON(json: string): ForecastAI {
    const obj = new ForecastAI();
    obj.params = JSON.parse(json) as Tateyama.Forecast.ForecastParams;
    return obj;
  }

  /**
   * JSON シリアライザ
   * @returns 
   */
  public toJSON(): string {
    return JSON.stringify(this.params, null, 2);
  }
}
