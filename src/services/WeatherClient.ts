import { config } from '../config';
import { HourlyTemperature } from '../types/weather';

interface ForecastResponse {
  timezone: string;
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export class WeatherClient {
  constructor(private readonly endpoint: string = config.forecastEndpoint) {}

  async getHourlyForecast(latitude: number, longitude: number): Promise<{
    timezone: string;
    hourly: HourlyTemperature[];
  }> {
    const url = new URL(this.endpoint);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('hourly', 'temperature_2m');
    url.searchParams.set('forecast_days', '2');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Forecast API responded with ${response.status}`);
    }

    const payload = (await response.json()) as ForecastResponse;
    const { time, temperature_2m } = payload.hourly;
    if (!time?.length || !temperature_2m?.length) {
      throw new Error('Forecast API returned an unexpected payload');
    }

    const combined: HourlyTemperature[] = time.reduce<HourlyTemperature[]>((acc, timestamp, index) => {
      const temperature = temperature_2m[index];
      if (typeof temperature !== 'number') {
        return acc;
      }

      acc.push({
        time: timestamp,
        temperature,
      });
      return acc;
    }, []);

    const now = Date.now();
    const upcoming = combined
      .filter((entry) => new Date(entry.time).getTime() >= now)
      .slice(0, 24);

    const hourly = upcoming.length > 0 ? upcoming : combined.slice(0, 24);

    return {
      timezone: payload.timezone,
      hourly,
    };
  }
}
