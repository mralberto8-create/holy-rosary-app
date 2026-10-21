/**
 * Uploads all MP3s from public/audio/ to Firebase Storage under audio/
 * Run once: node scripts/upload-audio.mjs
 * Re-run anytime to replace files with a new voice or add new ones.
 *
 * Requires: GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON,
 * OR run `npx firebase login` first and use the firebase-admin default credentials.
 *
 * Simpler alternative: drag-and-drop files in Firebase Console → Storage.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const audioDir = join(__dirname, "../public/audio");

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  console.error(
    "❌  Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.\n" +
    "    Or upload manually: Firebase Console → Storage → Upload files → select all MP3s → folder: audio/"
  );
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(readFileSync(serviceAccountPath, "utf8"))),
    storageBucket: "holy-rosary-app.firebasestorage.app",
  });
}

const bucket = getStorage().bucket();
const files = readdirSync(audioDir).filter(f => f.endsWith(".mp3"));

console.log(`Uploading ${files.length} files to Firebase Storage…\n`);

for (const file of files) {
  const dest = `audio/${file}`;
  await bucket.upload(join(audioDir, file), {
    destination: dest,
    metadata: { contentType: "audio/mpeg", cacheControl: "public, max-age=31536000" },
  });
  await bucket.file(dest).makePublic();
  console.log(`  ✅  ${file}`);
}

console.log("\nDone. Public base URL:");
console.log("  https://storage.googleapis.com/holy-rosary-app.firebasestorage.app/audio/\n");
