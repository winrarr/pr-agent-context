import { cp, mkdir, rm } from "node:fs/promises";
import process from "node:process";
import { context } from "esbuild";

const watch = process.argv.includes("--watch");

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("public/manifest.json", "dist/manifest.json");

const buildContext = await context({
  entryPoints: ["src/content/index.ts"],
  outfile: "dist/content.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "chrome120",
  sourcemap: true,
  logLevel: "info",
});

if (watch) {
  await buildContext.watch();
  console.log(
    "Watching extension sources. Reload the extension after each rebuild.",
  );
} else {
  await buildContext.rebuild();
  await buildContext.dispose();
}
