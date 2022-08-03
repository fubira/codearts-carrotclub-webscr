export class ForecastResult {
  horeseId: number;
  rate: number;
}

export interface RaceForecastResult {
  raceId: string;
  forecast: ForecastResult[];
}
