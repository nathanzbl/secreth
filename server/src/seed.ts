import 'dotenv/config';
import { initDb, pool } from './db';

initDb()
  .then(() => pool.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Seed] Failed:', err);
    process.exit(1);
  });
