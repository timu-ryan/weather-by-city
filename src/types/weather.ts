export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface HourlyTemperature {
  time: string; // ISO8601 timestamp
  temperature: number;
}

export interface WeatherPayload {
  city: string;
  coordinates: Coordinates;
  hourly: HourlyTemperature[];
  timezone: string;
  fetchedAt: string; // ISO timestamp
}

export interface WeatherResponse extends WeatherPayload {
  source: 'cache' | 'api';
}
