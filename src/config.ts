import dotenv from 'dotenv';

dotenv.config();

const minutes = Number(process.env.CACHE_TTL_MINUTES ?? 15);

export const config = {
  port: Number(process.env.PORT ?? 3000),
  cacheTtlMs: minutes * 60 * 1000,
  redisUrl: process.env.REDIS_URL,
  geocodingEndpoint: 'https://geocoding-api.open-meteo.com/v1/search',
  forecastEndpoint: 'https://api.open-meteo.com/v1/forecast',
};

export type AppConfig = typeof config;
