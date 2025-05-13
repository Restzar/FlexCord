const fs = require('fs');
const path = require('path');
const os = require('os');
const asar = require('asar');
const { execSync } = require('child_process');

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

// 2. Backup & extract
console.log("📦 Backing up original app.asar...");
fs.copyFileSync(appAsar, backup);

console.log("📂 Extracting app.asar...");
asar.extractAll(appAsar, appExtracted);

// 3. Inject FlexCord loader
const indexPath = path.join(appExtracted, 'index.js');
const injectorPath = path.resolve('injector.js').replace(/\\/g, '\\\\');
const code = `\nrequire("${injectorPath}"); // FlexCord Injected\n`;

console.log("💉 Injecting loader into index.js...");
fs.appendFileSync(indexPath, code);

// 4. Repack
console.log("🛠 Repacking app.asar...");
asar.createPackage(appExtracted, appAsar).then(() => {
  console.log("✅ FlexCord installed successfully.");
  console.log("🔁 Restart Discord to apply changes.");
}).catch(err => {
  console.error("❌ Failed to repack app.asar:", err);
});
