import { readFile } from "node:fs/promises";

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

const [packageJson, manifest] = await Promise.all([
  readJson("package.json"),
  readJson("public/manifest.json"),
]);

if (packageJson.version !== manifest.version) {
  throw new Error(
    `Version mismatch: package.json is ${packageJson.version}, but public/manifest.json is ${manifest.version}`,
  );
}

if (!/^\d+(?:\.\d+){0,3}$/.test(manifest.version)) {
  throw new Error(
    `Chrome extension versions must contain one to four numeric components: ${manifest.version}`,
  );
}
