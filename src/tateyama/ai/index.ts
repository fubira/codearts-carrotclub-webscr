export * from './types';
export * from './helper';
export * from './state-factor';
export * from './value-factor';

import { generateSlug } from 'random-word-slugs';
import { AI, Data, DB } from 'tateyama';
import * as brain from 'brain.js';


export class Forecaster {
  private networks: { [key: string]: brain.NeuralNetwork<any, any> } = {};
  private params: AI.ForecasterParams;

  constructor (name?: string) {
    this.params = {
      name: name || generateSlug(2, { partsOfSpeech: ["adjective", "noun"]}),
    };
  }

  public get name(): string {
    return `${this.params.name}`;
  }

  private getNeuralNetwork(type: string): brain.NeuralNetwork<any, any> {
    if (!this.networks[type]) {
      this.networks[type] = new brain.NeuralNetwork({
        inputSize: 4,
        hiddenLayers: [5],
        outputSize: 4,
      });
    }
    return this.networks[type];
  }

  /**
   * 自己の持つ評価関数(ValueFactorStore)をもとにDBRaceを評価した予想結果を返す
   * 
   * @param race 
   */
   public train(races: DB.RA[], entriesAll: DB.SE[]) {
    const network = this.getNeuralNetwork('odds');

    races.forEach((race) => {
      const entries = entriesAll.filter((entry) => DB.isMatchJVID(entry.jvid, race.jvid));

      const data = entries.map((entry) => {
        const oddsWinRate = Number(entry.Odds) ? (1 / (Number(entry.Odds) / 10)) : 0;
        const handicap = Number(entry.Futan) ? (Number(entry.Futan) / 10) - 48 : 0;
        const heavyDiff = (Number(entry.ZogenSa) ? Number(entry.ZogenSa) : 0) * (entry.ZogenFugo === "-" ? -1 : 1);
        const result3 = Number(entry.KakuteiJyuni) <= 1 ? 1.0 : 0.0;
        
        return {
          input: {
            oddsWinRate,
            handicap,
            heavyDiff,
          }, 
          output: {
            result3,
          }
        };
      });
      const { error } = network.train([...data]);

      if (isNaN(error)) {
        console.warn(data);
      }
    })
  }

  /**
   * 自己の持つ評価関数(ValueFactorStore)をもとにDBRaceを評価した予想結果を返す
   * 
   * @param race 
   */
  public run(raceEntries: DB.SE[]): AI.ForecastResult[] {
    const network = this.getNeuralNetwork('odds');


    const data = raceEntries.map((entry) => {
      const oddsWinRate = Number(entry.Odds) ? (1 / (Number(entry.Odds) / 10)) : 0;
      const handicap = Number(entry.Futan) ? (Number(entry.Futan) / 10) - 48 : 0;
      const heavyDiff = (Number(entry.ZogenSa) ? Number(entry.ZogenSa) : 0) * (entry.ZogenFugo === "-" ? -1 : 1);

      const result = network.run({
        oddsWinRate,
        handicap,
        heavyDiff,
      });

      return result;
    });

    console.log({ data });

    return raceEntries.map((entry: DB.SE, index: number) => {
      const value = data[index].result3;
      const odds = Number(entry?.Odds) / 10;
      const oddsWinRate = 1 / odds;
      const benefitRate = (value / oddsWinRate);

      return {
        horseId: index + 1,
        horseName: entry?.Bamei.trim(),
        forecastValue: value,
        odds: odds,
        oddsWinRate: oddsWinRate,
        benefitRate: benefitRate,
      }
    });
  }

  /**
   * JSON シリアライザ
   * @returns 
   */
  public toJSON(): string {
    const networks = Object.keys(this.networks).map((key) => {
      return { key, json: this.networks[key].toJSON() };
    });
    return JSON.stringify({
      params: this.params,
      networks
    }, null, 2);
  }

  /**
   * JSON デシリアライザ
   * @param json 
   * @returns 
   */
  public static fromJSON(json: string): Forecaster {
    const obj = new Forecaster();

    const { params, networks } = JSON.parse(json);

    obj.params = params;
    networks.forEach((network: any) => {
      if (network.key) {
        const n = new brain.NeuralNetwork<number[], number[]>()
        n.fromJSON(network.json);
        obj.networks[network.key] = n;
      }
    })
    return obj;
  }
}
