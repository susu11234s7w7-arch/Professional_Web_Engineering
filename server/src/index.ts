import { createApp } from './app.js';
import { config } from './config/env.js';
import { getDb } from './db/connection.js';
import { runMigrations } from './db/migrate.js';

async function bootstrap() {
  try {
    console.log(`[DevPulse Server] Initializing SQLite database...`);
    const db = getDb();
    runMigrations(db);
    console.log(`[DevPulse Server] Database schema migrations completed.`);

    const app = createApp();

    app.listen(config.port, config.host, () => {
      console.log(`=======================================================`);
      console.log(` DevPulse API Server running at http://${config.host}:${config.port}`);
      console.log(` Health check available at: http://${config.host}:${config.port}/api/health`);
      console.log(` Environment: ${config.env}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error(`[DevPulse Server] Startup failure:`, error);
    process.exit(1);
  }
}

bootstrap();
