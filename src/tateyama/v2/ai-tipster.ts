import phonetic from 'phonetic';
import { DBRace } from 'tateyama/v1/types/database';
import * as Tateyama from 'tateyama/v2';

export interface TipsterParams {
  name: string;
  store: Tateyama.ValueFactorStore;
}

export class Tipster {
  private params: TipsterParams;

  constructor () {
    this.params.name = phonetic.generate({ syllables: 3 });
    this.params.store = new Tateyama.ValueFactorStore();
  }

  public get name(): string {
    return this.name;
  }

  /**
   * 自己の持つ評価関数(ValueFactorStore)をもとにDBRaceを評価した予想結果を返す
   * 
   * @param race 
   */
  public forecast(race: DBRace) {
    const setStateFactorIds = new Set();
  }

  /**
   * JSON デシリアライザ
   * @param json 
   * @returns 
   */
  public static fromJSON(json: string): Tipster {
    const obj = new Tipster();
    obj.params = JSON.parse(json);
    return obj;
  }

  /**
   * JSON シリアライザ
   * @returns 
   */
  public toJSON(): string {
    return JSON.stringify(this.params);
  }
}
