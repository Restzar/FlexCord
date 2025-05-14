const fs = require('fs');
const path = require('path');
const os = require('os');
const asar = require('asar');
const { execSync } = require('child_process');

console.log('[FlexCord Installer] Starting installation process...');
console.log(`[FlexCord Installer] Current working directory: ${process.cwd()}`);
console.log(`[FlexCord Installer] Script directory: ${__dirname}`);

// 1. Locate Discord's resources folder
const discordPath = path.join(
  os.homedir(),
  'AppData',
  'Local',
  'Discord'
);

// Find latest app folder
const versions = fs.readdirSync(discordPath).filter(f => f.startsWith('app-'));
if (versions.length === 0) {
  console.error("❌ Could not find Discord installation.");
  process.exit(1);
}
const latestVersion = versions.sort().reverse()[0];
const resourcesPath = path.join(discordPath, latestVersion, 'resources');

const appAsar = path.join(resourcesPath, 'app.asar');
const appExtracted = path.join(resourcesPath, 'app');
const backup = path.join(resourcesPath, 'app_backup.asar');

console.log(`[FlexCord Installer] Discord resources path: ${resourcesPath}`);
console.log(`[FlexCord Installer] app.asar path: ${appAsar}`);

// 2. Backup & extract
console.log("📦 Backing up original app.asar...");
try {
  fs.copyFileSync(appAsar, backup);
  console.log("[FlexCord Installer] Backup successful.");
} catch (err) {
  console.error("❌ Error backing up app.asar:", err);
  process.exit(1);
}

console.log("📂 Extracting app.asar...");
try {
  asar.extractAll(appAsar, appExtracted);
  console.log("[FlexCord Installer] Extraction successful.");
} catch (err) {
  console.error("❌ Error extracting app.asar:", err);
  process.exit(1);
}

// 3. Inject FlexCord loader
const indexPath = path.join(appExtracted, 'index.js');
// Use path.resolve with __dirname to ensure the path is correct regardless of where the script is run
const injectorPath = path.resolve(__dirname, 'injector.js').replace(/\\/g, '\\\\');
console.log(`[FlexCord Installer] Injector.js path resolved to: ${injectorPath}`);
const code = `\nrequire("${injectorPath}"); // FlexCord Injected\n`;

console.log("💉 Injecting loader into index.js...");
try {
  fs.appendFileSync(indexPath, code);
  console.log("[FlexCord Installer] Injection successful.");
} catch (err) {
  console.error("❌ Error injecting loader into index.js:", err);
  process.exit(1);
}

// 4. Repack
console.log("🛠 Repacking app.asar...");
asar.createPackage(appExtracted, appAsar).then(() => {
  console.log("[FlexCord Installer] Repack successful.");
  console.log("✅ FlexCord installed successfully.");
  console.log("🔁 Restart Discord to apply changes.");
}).catch(err => {
  console.error("❌ Failed to repack app.asar:", err);
});
