import { config } from '../config';

export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
}

interface GeoSearchResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

export class GeoClient {
  constructor(private readonly endpoint: string = config.geocodingEndpoint) {}

  async lookupCity(city: string): Promise<GeoLocation | null> {
    const trimmed = city.trim();
    if (!trimmed) {
      return null;
    }

    const url = new URL(this.endpoint);
    url.searchParams.set('name', trimmed);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'en');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding API responded with ${response.status}`);
    }

    const data = (await response.json()) as GeoSearchResponse;
    const [first] = data.results ?? [];
    if (!first) {
      return null;
    }

    return {
      name: first.name,
      latitude: first.latitude,
      longitude: first.longitude,
    };
  }
}
