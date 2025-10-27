import { config } from './config';
import { createWeatherCache } from './services/Cache';
import { GeoClient } from './services/GeoClient';
import { WeatherClient } from './services/WeatherClient';
import { WeatherService } from './services/WeatherService';
import { createApp } from './app';

async function bootstrap() {
  const cache = await createWeatherCache(config.redisUrl);
  const geoClient = new GeoClient();
  const weatherClient = new WeatherClient();
  const weatherService = new WeatherService(geoClient, weatherClient, cache, config.cacheTtlMs);

  const app = createApp(weatherService);

  app.listen(config.port, () => {
    console.log(`Weather service listening on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
