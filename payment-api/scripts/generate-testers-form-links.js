/**
 * generate-testers-form-links.js
 *
 * Reads a CSV of testers and outputs a per-tester Google Form "pre-filled" URL,
 * so each recruit lands on the survey with their Name/Email/Wallet already filled.
 *
 * Input CSV (testers.csv): header row REQUIRED, columns:
 *   name,email,wallet,id
 *   Jane,jane@x.com,GABC...,U001
 *
 * Usage:
 *   node scripts/generate-testers-form-links.js \
 *     --csv path/to/testers.csv \
 *     --form "https://docs.google.com/forms/d/e/1FAIpQLSxxxx/viewform" \
 *     --map "name=entry.11,email=entry.22,wallet=entry.33" \
 *     [--out path/to/out.txt] [--out-csv path/to/out.csv]
 *
 * Outputs one line per tester:
 *   U001,Jane,jane@example.com,<prefilled-url>
 *
 * When NO --map is provided, it falls back to emitting the plain form URL plus
 * the info in CSV form so you can still track who you sent what.
 */
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
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

function parseCsv(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.replace(/^\uFEFF/, '').trim().split(/\r?\n/);
  const header = lines.shift().split(',');
  return lines
    .filter((l) => l.trim())
    .map((line) => {
      const cells = line.split(',');
      return {
        id: cells[header.indexOf('id')] || '',
        name: cells[header.indexOf('name')] || '',
        email: cells[header.indexOf('email')] || '',
        wallet: cells[header.indexOf('walletAddress')] || '',
      };
    });
}

function buildPrelink({ base, map, name, email, wallet }) {
  const url = new URL(base);
  if (!map) return url.toString();
  const set = (field, value) => {
    const entryId = map[field];
    if (entryId && value) url.searchParams.set(entryId, value);
  };
  set('name', name);
  set('email', email);
  set('wallet', wallet);
  return url.toString();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.csv) {
    console.error('Missing --csv (path to testers list).');
    process.exit(1);
  }
  if (!args.form) {
    console.error('Missing --form (your Google Form viewform URL).');
    process.exit(1);
  }

  let map = null;
  if (args.map) {
    map = {};
    args.map.split(',').forEach((pair) => {
      const [k, v] = pair.split('=');
      if (k && v) map[k.trim()] = v.trim();
    });
  }

  const testers = parseCsv(args.csv);
  if (testers.length === 0) {
    console.warn('No tester rows found in CSV.');
    return;
  }

  const out = testers.map((t) => {
    const url = buildPrelink({ base: args.form, map, name: t.name, email: t.email, wallet: t.wallet });
    return `${t.id || '?'}|${t.name}|${t.email}|${url}`;
  });

  const text = out.join('\n');
  if (args.out) {
    fs.writeFileSync(path.resolve(args.out), text + '\n');
    console.log(`Wrote ${testers.length} prefilled links to ${args.out}`);
  } else {
    console.log(text);
  }

  if (args['out-csv']) {
    const csv = 'id,name,email,walletAddress,formUrl\n' +
      testers.map((t, i) => [
        t.id,
        t.name,
        t.email,
        t.wallet,
        out[i].split('|').slice(3).join('|'),
      ].join(',')).join('\n');
    fs.writeFileSync(path.resolve(args['out-csv']), csv + '\n');
    console.log(`Wrote CSV to ${args['out-csv']}`);
  }
}

main();