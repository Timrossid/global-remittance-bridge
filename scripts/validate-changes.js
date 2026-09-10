const { execSync } = require('child_process');
const path = require('path');

const nextDir = path.resolve(__dirname, 'merchant-dashboard');

const changedFiles = execSync('git diff --name-only', { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean);

const affectedByChange = (keywords) =>
  changedFiles.some((f) =>
    keywords.some((k) => f.includes(k)),
  );

const jobs = [
  { name: 'lint',    command: 'cd merchant-dashboard && npm run lint',     if: () => true },
  { name: 'typecheck', command: 'cd payment-api && npm run typecheck', if: () => true },
  { name: 'test',    command: 'cd payment-api && npm test',                if: () => true },
  { name: 'build',   command: 'cd merchant-dashboard && npm run build',    if: () => changedFiles.some((f) => f.startsWith('merchant-dashboard')) },
  { name: 'contracts', command: 'cd contracts && cargo test --no-run',    if: () => changedFiles.some((f) => f.startsWith('contracts')) },
];

const results = [];
for (const job of jobs) {
  if (!job.if()) continue;
  try {
    const stdout = execSync(job.command, { encoding: 'utf8', cwd: nextDir });
    results.push({ job: job.name, status: 'passed', output: stdout.slice(-500) });
  } catch (error) {
    results.push({ job: job.name, status: 'failed', output: (error.stdout || '') + (error.stderr || '') });
  }
}

const failed = results.filter((r) => r.status === 'failed');
if (failed.length > 0) {
  console.error('Validation failed:', failed);
  process.exit(1);
}

console.log('All validation jobs passed:', results.map((r) => r.job).join(', '));
