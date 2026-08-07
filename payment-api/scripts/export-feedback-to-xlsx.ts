/**
 * export-feedback-to-xlsx.ts
 *
 * Reads collected feedback responses and writes a public .xlsx spreadsheet.
 *
 * Data sources (used in order of priority):
 *   1. --json <file> : a JSON array of feedback objects exported from the
 *      API (`GET /feedback`) or dumped by the dashboard.
 *   2. --db            : query the Prisma `Feedback` table directly.
 *   3. default         : read from `feedback-responses.json` if present.
 *
 * Usage:
 *   npx tsx scripts/export-feedback-to-xlsx.ts --json feedback-responses.json -o feedback-responses.xlsx
 *   npx tsx scripts/export-feedback-to-xlsx.ts --db
 */
import * as fs from 'fs';
import * as path from 'path';
import * as ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';

interface FeedbackRow {
  id?: string;
  createdAt?: string | Date;
  merchantId?: string | null;
  name: string;
  email: string;
  walletAddress: string;
  network: string;
  rating: number;
  likedMost: string;
  missingFeature: string;
  issues: string;
  recommend: string;
  improvements: string;
}

const HEADERS = [
  'ID',
  'Submitted At',
  'Name',
  'Email',
  'Wallet Address',
  'Network',
  'Rating (1-5)',
  'Liked most',
  'Missing feature',
  'Bugs / issues',
  'Recommend?',
  'Improvements',
];

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : '';
      args[key] = value;
      i += value !== '' ? 1 : 0;
    }
  }
  return args;
}

async function loadFromDb(): Promise<FeedbackRow[]> {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.feedback.findMany({ orderBy: { createdAt: 'desc' } });
    return rows as unknown as FeedbackRow[];
  } finally {
    await prisma.$disconnect();
  }
}

function loadFromJson(file: string): FeedbackRow[] {
  const raw = fs.readFileSync(file, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : data.feedback || [];
}

async function writeXlsx(rows: FeedbackRow[], outFile: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Feedback');

  sheet.columns = HEADERS.map((header) => ({ header, width: 28 }));
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' },
  };
  headerRow.font = { color: { argb: 'FFFFFFFF' }, bold: true };

  rows.forEach((r) => {
    sheet.addRow([
      r.id || '',
      r.createdAt ? new Date(r.createdAt).toISOString() : '',
      r.name,
      r.email,
      r.walletAddress,
      r.network,
      r.rating,
      r.likedMost,
      r.missingFeature,
      r.issues,
      r.recommend,
      r.improvements,
    ]);
  });

  sheet.autoFilter = { from: 'A1', to: `L${rows.length + 1}` };
  const outPath = path.resolve(outFile);
  await workbook.xlsx.writeFile(outPath);
  console.log(`Wrote ${rows.length} feedback row(s) to ${outPath}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outFile = args.o || './feedback-responses.xlsx';

  let rows: FeedbackRow[];
  if (args.db) {
    rows = await loadFromDb();
  } else if (args.json) {
    rows = loadFromJson(args.json);
  } else if (fs.existsSync('./feedback-responses.json')) {
    rows = loadFromJson('./feedback-responses.json');
  } else {
    rows = await loadFromDb();
  }

  if (rows.length === 0) {
    console.warn('No feedback rows found. Nothing exported.');
    return;
  }

  await writeXlsx(rows, outFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});