import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export function fixture(name: string): string {
  return readFileSync(resolve("tests", "fixtures", name), "utf8");
}

export function documentFrom(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}
