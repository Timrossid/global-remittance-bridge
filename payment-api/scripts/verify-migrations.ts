import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const migrationsDir = join(process.cwd(), 'prisma', 'migrations');

try {
  const migrations = readdirSync(migrationsDir).filter((f) => statSync(join(migrationsDir, f)).isDirectory());
  if (migrations.length === 0) {
    console.log('[migration-check] No migration folders found — skipping.');
    process.exit(0);
  }
  console.log(`[migration-check] Found ${migrations.length} migration(s). Validating schema drift...`);
  execSync('npx prisma migrate diff --from-url env(DATABASE_URL) --to-schema-datamodel prisma/schema.prisma --script', {
    stdio: 'inherit',
  });
  console.log('[migration-check] No schema drift detected.');
} catch (err) {
  console.error('[migration-check] Migration validation failed.');
  process.exit(1);
}
