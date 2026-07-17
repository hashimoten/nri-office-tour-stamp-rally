import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = resolve(projectRoot, "dist");

if (dirname(outputDirectory) !== resolve(projectRoot)) {
  throw new Error("Build output must remain inside the project directory.");
}

rmSync(outputDirectory, { recursive: true, force: true });
