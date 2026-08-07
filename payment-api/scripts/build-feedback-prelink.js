/**
 * build-feedback-prelink.js
 *
 * Builds a Google Forms "pre-filled" URL for the feedback form.
 *
 * Usage (node, no deps required):
 *   node build-feedback-prelink.js \
 *     --form "https://docs.google.com/forms/d/e/1FAIpQLSxxxxx/viewform" \
 *     --map "name=entry.11,email=entry.22,wallet=entry.33,network=entry.44,rating=entry.55" \
 *     --name "Jane Merchant" --email "jane@x.com" --wallet "GAB..."
 *
 * - `--form` is your form's viewform URL (get it from "Send" -> link tab, or the
 *   "Pre-filled link" option under the three-dot menu).
 * - `--map` tells the script which form entry field id each logical value maps to.
 *   To discover the entry ids: form three-dot menu -> "Get pre-filled link" -> fill a
 *   sample -> copy the URL, which will contain `entry.<NNN>=...`.
 * - Any `--name/--email/--wallet/--network/--rating` flags are then substituted.
 */

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

function buildPrelink(args) {
  let base = args.form;
  if (!base) {
    throw new Error('Missing --form (your Google Form viewform URL).');
  }
  if (!/^https?:\/\//.test(base)) {
    base = `https://docs.google.com/forms/d/e/${base}/viewform`;
  }

  // field name -> entry id
  const map = {};
  if (args.map) {
    args.map.split(',').forEach((pair) => {
      const [key, entryId] = pair.split('=');
      if (key && entryId) map[key.trim()] = entryId.trim();
    });
  }

  const values = ['name', 'email', 'wallet', 'network', 'rating']
    .filter((f) => args[f] !== undefined)
    .map((f) => {
      const entryId = map[f];
      if (!entryId) return null;
      return { entryId, value: args[f] };
    })
    .filter(Boolean);

  const testUrl = new URL(base);
  values.forEach(({ entryId, value }) => testUrl.searchParams.set(entryId, value));
  return testUrl.toString();
}

function main() {
  try {
    const url = buildPrelink(parseArgs(process.argv.slice(2)));
    console.log(url);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();