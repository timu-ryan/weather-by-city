import { Router } from 'express';
import { CityNotFoundError, WeatherService } from '../services/WeatherService';

export function createWeatherRouter(weatherService: WeatherService): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const { city } = req.query;
      if (typeof city !== 'string' || city.trim().length === 0) {
        res.status(400).json({ message: 'Query parameter "city" is required' });
        return;
      }

      const weather = await weatherService.getWeather(city);
      res.json(weather);
    } catch (error) {
      if (error instanceof CityNotFoundError) {
        res.status(404).json({ message: error.message });
        return;
      }

      next(error);
    }
  });

  return router;
}
