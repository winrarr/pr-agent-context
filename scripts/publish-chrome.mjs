import { readFile } from "node:fs/promises";

const [, , packagePath] = process.argv;
const {
  CWS_ACCESS_TOKEN: accessToken,
  CWS_EXTENSION_ID: extensionId,
  CWS_PUBLISHER_ID: publisherId,
} = process.env;

if (!packagePath) throw new Error("Pass the extension ZIP path");
if (!accessToken) throw new Error("CWS_ACCESS_TOKEN is required");
if (!extensionId) throw new Error("CWS_EXTENSION_ID is required");
if (!publisherId) throw new Error("CWS_PUBLISHER_ID is required");

const itemName = `publishers/${publisherId}/items/${extensionId}`;
const apiBase = "https://chromewebstore.googleapis.com";
const authorization = { Authorization: `Bearer ${accessToken}` };

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(
      `Chrome Web Store API returned ${response.status}: ${JSON.stringify(body)}`,
    );
  }
  return body;
}

async function waitForUpload() {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 3000));
    const status = await requestJson(`${apiBase}/v2/${itemName}:fetchStatus`, {
      headers: authorization,
    });
    const uploadState = status.lastAsyncUploadState;
    if (uploadState === "SUCCEEDED") return;
    if (uploadState === "FAILED" || uploadState === "NOT_FOUND") {
      throw new Error(`Package upload ended in state ${uploadState}`);
    }
    console.log(`Upload is still processing (${attempt}/20)`);
  }
  throw new Error("Package upload did not finish within one minute");
}

const upload = await requestJson(`${apiBase}/upload/v2/${itemName}:upload`, {
  method: "POST",
  headers: {
    ...authorization,
    "Content-Type": "application/zip",
  },
  body: await readFile(packagePath),
});

if (
  upload.uploadState === "UPLOAD_IN_PROGRESS" ||
  upload.uploadState === "IN_PROGRESS"
) {
  await waitForUpload();
} else if (
  upload.uploadState !== "SUCCEEDED" &&
  upload.uploadState !== "UPLOAD_SUCCEEDED"
) {
  throw new Error(`Package upload ended in state ${upload.uploadState}`);
}

const publication = await requestJson(`${apiBase}/v2/${itemName}:publish`, {
  method: "POST",
  headers: {
    ...authorization,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    publishType: "DEFAULT_PUBLISH",
    blockOnWarnings: true,
  }),
});

console.log(
  `Submitted ${upload.crxVersion ?? "the new version"} with state ${publication.state}`,
);
