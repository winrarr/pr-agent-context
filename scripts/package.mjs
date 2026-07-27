import { mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

import manifest from "../public/manifest.json" with { type: "json" };

const artifactDirectory = resolve("artifacts");
const artifactPath = resolve(
  artifactDirectory,
  `pr-agent-context-${manifest.version}.zip`,
);

await rm(artifactDirectory, { recursive: true, force: true });
await mkdir(artifactDirectory, { recursive: true });

const zip = spawn("zip", ["-q", "-r", artifactPath, "."], {
  cwd: resolve("dist"),
  stdio: "inherit",
});
const exitCode = await new Promise((resolveExit, reject) => {
  zip.once("error", reject);
  zip.once("close", resolveExit);
});

if (exitCode !== 0) {
  throw new Error(`zip exited with status ${exitCode}`);
}

console.log(`Created ${artifactPath}`);
