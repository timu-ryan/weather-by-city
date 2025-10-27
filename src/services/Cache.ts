import Redis, { RedisOptions } from 'ioredis';
import { WeatherPayload } from '../types/weather';

export interface WeatherCache {
  get(key: string): Promise<WeatherPayload | null>;
  set(key: string, value: WeatherPayload, ttlMs: number): Promise<void>;
}

class InMemoryWeatherCache implements WeatherCache {
  private store = new Map<string, { expiresAt: number; value: WeatherPayload }>();

  async get(key: string): Promise<WeatherPayload | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: WeatherPayload, ttlMs: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

class RedisWeatherCache implements WeatherCache {
  constructor(private readonly client: Redis) {}

  async get(key: string): Promise<WeatherPayload | null> {
    const raw = await this.client.get(key);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as WeatherPayload;
    } catch (error) {
      // Drop corrupted payloads.
      await this.client.del(key);
      return null;
    }
  }

  async set(key: string, value: WeatherPayload, ttlMs: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'PX', ttlMs);
  }
}

export async function createWeatherCache(redisUrl?: string): Promise<WeatherCache> {
  if (redisUrl) {
    const redisOptions: RedisOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
    };

    const client = new Redis(redisUrl, redisOptions);
    try {
      await client.connect();
      await client.ping();
      console.info('Redis cache enabled');
      return new RedisWeatherCache(client);
    } catch (error) {
      console.warn('Failed to connect to Redis, falling back to in-memory cache:', error);
      client.disconnect();
    }
  }

  console.info('Using in-memory cache');
  return new InMemoryWeatherCache();
}
