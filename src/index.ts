import { config } from './config';
import { createApp } from './app';

async function bootstrap() {

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`Weather service listening on http://localhost:${config.port}`);
  });

}

bootstrap().catch((error) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
