/**
 * Validates every OnlyMen org character file against @elizaos/core's
 * character parsing, and checks the per-agent knowledge directory exists.
 * Exits non-zero on the first structural problem so `bun run verify` fails
 * loudly instead of shipping a character the runtime cannot load.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { mergeCharacterDefaults } from "@elizaos/core";

const pkgRoot = join(import.meta.dirname, "..");
const charactersDir = join(pkgRoot, "characters");
const knowledgeDir = join(pkgRoot, "knowledge");

const files = readdirSync(charactersDir).filter((f) => f.endsWith(".json"));
if (files.length === 0) {
  throw new Error(`no character files found in ${charactersDir}`);
}

let failures = 0;
for (const file of files) {
  const slug = file.replace(/\.json$/, "");
  try {
    const raw = JSON.parse(readFileSync(join(charactersDir, file), "utf8"));
    if (typeof raw.name !== "string" || raw.name.length === 0) {
      throw new Error("missing character name");
    }
    if (typeof raw.system !== "string" || raw.system.length === 0) {
      throw new Error("missing system prompt");
    }
    const character = mergeCharacterDefaults(raw);
    const kd = join(knowledgeDir, slug);
    const hasKnowledge = statSync(kd, { throwIfNoEntry: false })?.isDirectory();
    console.log(
      `ok ${character.name} (${file})${hasKnowledge ? "" : " — WARN: no knowledge dir"}`,
    );
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${file}:`, error);
  }
}

if (failures > 0) {
  throw new Error(`${failures}/${files.length} character files invalid`);
}
console.log(`${files.length} characters valid`);
