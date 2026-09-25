import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { seedDatabaseWithClient } from '../src/data/seed/seedDatabase';

// Load .env from project root (and ~/.env as fallback)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
if (process.env.HOME || process.env.USERPROFILE) {
  const homeDir = (process.env.HOME || process.env.USERPROFILE) as string;
  dotenv.config({ path: path.resolve(homeDir, '.env') });
}

const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  ''
).trim();

async function main() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      'ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file.'
    );
    process.exit(1);
  }

  console.log('Connecting to Supabase project...');
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Seeding Fanthom demo workspace and relational tables (idempotent upsert)...');
  const counts = await seedDatabaseWithClient(client);

  console.log('\nSeed completed successfully:');
  console.table(counts);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message || err);
  process.exit(1);
});
