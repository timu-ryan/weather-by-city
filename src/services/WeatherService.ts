import { WeatherCache } from './Cache';
import { GeoClient } from './GeoClient';
import { WeatherClient } from './WeatherClient';
import { WeatherPayload, WeatherResponse } from '../types/weather';

export class CityNotFoundError extends Error {
  constructor(city: string) {
    super(`City "${city}" was not found`);
    this.name = 'CityNotFoundError';
  }
}

export class WeatherService {
  constructor(
    private readonly geoClient: GeoClient,
    private readonly weatherClient: WeatherClient,
    private readonly cache: WeatherCache,
    private readonly cacheTtlMs = 15 * 60 * 1000,
  ) {}

  async getWeather(city: string): Promise<WeatherResponse> {
    const cacheKey = this.normalize(city);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return { ...cached, source: 'cache' };
    }

    const location = await this.geoClient.lookupCity(city);
    if (!location) {
      throw new CityNotFoundError(city);
    }

    const { hourly, timezone } = await this.weatherClient.getHourlyForecast(location.latitude, location.longitude);

    const payload: WeatherPayload = {
      city: location.name,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      hourly,
      timezone,
      fetchedAt: new Date().toISOString(),
    };

    await this.cache.set(cacheKey, payload, this.cacheTtlMs);
    return { ...payload, source: 'api' };
  }

  private normalize(city: string): string {
    return city.trim().toLowerCase();
  }
}
