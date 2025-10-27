import express, { NextFunction, Request, Response } from 'express';

export function createApp() {
  const app = express();

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });


  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: 'Unexpected server error' });
  });

  return app;
}