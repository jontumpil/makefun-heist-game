// Midnight Vault — the hand-in program for this entry (Node 22, stdlib only).
//
// The playable game is the plain static files under game/ beside this file:
// game/index.html plus its ES modules, no build step and no network request
// in the browser. This program's only job is to hand those files in. It
// copies game/ and screenshots/ next to this file into the output folder
// (plain /output inside the grader, or MAKEFUN_OUTPUT_DIR when run by hand)
// and writes /output/dossier.json there, using the vendored make.fun
// library to build the dossier from exactly what was copied.
//
// Run it by hand like this:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The folder this file lives in, so the copy works wherever it is run from.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader writes to /output; a local run can point somewhere else.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The same caps the scorer enforces: 160 KiB of dossier text, at most
// 4 screenshots of 256 KiB each, game/ at most 993 entries and 48 MiB,
// no game path longer than 1000 bytes.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
