import { copyFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const simToolRoot = resolve(scriptDir, "..");
const repoRoot = resolve(simToolRoot, "..");
const targetRoot = join(simToolRoot, "public", "wiki");

rmSync(targetRoot, { recursive: true, force: true });
mkdirSync(join(targetRoot, "wiki"), { recursive: true });
mkdirSync(join(targetRoot, "references"), { recursive: true });

for (const filename of readdirSync(join(repoRoot, "wiki"))) {
  if (filename.endsWith(".md")) {
    copyFileSync(
      join(repoRoot, "wiki", filename),
      join(targetRoot, "wiki", filename)
    );
  }
}

for (const filename of ["260515-DeepResearch1", "260515-DeepResearch2"]) {
  copyFileSync(
    join(repoRoot, "references", filename),
    join(targetRoot, "references", `${filename}.md`)
  );
}

console.log(`Synced wiki documents to ${targetRoot}`);
