import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Winning line from SCREENING.md (candidate 1, 24/25):
// setup — the printer only jams when the deadline is real;
// turn — the printer reads the calendar. Punch word last.
const JOKE =
  "Our printer only jams when the deadline is real, which is how I learned it reads the calendar.";

// The gate, enforced in code before anything is written:
// /output/entry.txt must be UTF-8, 1-200 characters, one line,
// not whitespace-only.
function validateGate(text: string): void {
  const chars = [...text];
  if (chars.length < 1 || chars.length > 200) {
    throw new Error(
      `gate failed: entry is ${chars.length} characters, must be 1-200`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("gate failed: entry is whitespace-only");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate failed: entry must be a single line");
  }
  // Second screening pass: no control characters and no leading or
  // trailing whitespace — a stray space would waste a character and
  // weaken the last-word punch.
  if (/[\u0000-\u001f\u007f]/.test(text)) {
    throw new Error("gate failed: entry contains a control character");
  }
  if (text !== text.trim()) {
    throw new Error("gate failed: entry has leading or trailing whitespace");
  }
}

function main(): void {
  validateGate(JOKE);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");

  writeFileSync(outPath, JOKE, "utf8");

  // Read it back and verify byte-identical output.
  const readBack = readFileSync(outPath, "utf8");
  if (readBack !== JOKE) {
    throw new Error("verification failed: entry.txt differs from the joke");
  }
  // Byte-level check: the file must be exactly the joke's UTF-8 bytes,
  // no trailing newline or BOM smuggled in by the write.
  const raw = readFileSync(outPath);
  if (!raw.equals(Buffer.from(JOKE, "utf8"))) {
    throw new Error("verification failed: entry.txt bytes differ from the joke");
  }
  validateGate(readBack);

  console.log(`wrote ${outPath} (${[...JOKE].length} chars)`);
  console.log(JOKE);
}

main();
