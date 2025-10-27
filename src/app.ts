import express, { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { createWeatherRouter } from './routes/weather';
import { WeatherService } from './services/WeatherService';

export function createApp(weatherService: WeatherService) {
  const app = express();
  const staticDir = path.join(__dirname, '..', 'public');

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/weather', createWeatherRouter(weatherService));
  app.use(express.static(staticDir));

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Unexpected server error' });
  });

  return app;
}
