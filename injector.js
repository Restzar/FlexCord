console.log('[FlexCord Injector] Script execution started.');
try {
  console.log('[FlexCord Injector] Inside try block, starting FlexCord injection...');
const fs = require("fs");
const path = require("path");
const FlexCordAPI = require("./api");

// Use relative paths instead of hardcoded paths
const basePath = path.resolve(__dirname);
const pluginDir = path.join(basePath, "plugins");
const themeDir = path.join(basePath, "themes");
const configDir = path.join(basePath, "config");
const configPath = path.join(configDir, "settings.json");

// Create directories if they don't exist
if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir, { recursive: true });
if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir, { recursive: true });
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

// Track loaded plugins
const loadedPlugins = {};

// Track active theme
let activeTheme = null;

// Initialize FlexCord API
function initializeAPI() {
  // Initialize with plugin data folder
  FlexCordAPI._initialize({
    dataFolder: path.join(basePath, "plugins", "data")
  });
  
  // Make API available globally for plugins to access
  window.FlexCordAPI = FlexCordAPI;
  
  // Set up Discord event listeners
  setupDiscordEventListeners();
}

// Set up listeners for Discord events
function setupDiscordEventListeners() {
  // Listen for message creation
  const originalMessageCreate = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.send = function(body) {
    const xhr = this;
    
    // Check if this is a message being sent
    if (body && typeof body === 'string' && body.includes('"content"')) {
try {
        const data = JSON.parse(body);
        if (data.content) {
          // Emit message send event
          FlexCordAPI.events._emit('messageSend', {
            content: data.content,
            channelId: xhr._url ? xhr._url.split('/').slice(-2)[0] : null
          });
        }
      } catch (e) {
        // Not a valid JSON or doesn't have content
      }
    }
    
    originalMessageCreate.apply(this, arguments);
  };
  
  // Store original URL setter to capture channel IDs
  const originalOpen = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    originalOpen.apply(this, arguments);
  };
}

// Uninstall FlexCord
function uninstallFlexCord() {
  console.log('[FlexCord Injector] Script execution started.');
try {
    // Get Discord path info
    const os = require('os');
    
    const discordPath = path.join(
      os.homedir(),
      'AppData',
      'Local',
      'Discord'
    );
    
    // Find latest Discord version
    const versions = fs.readdirSync(discordPath).filter(f => f.startsWith('app-'));
    if (versions.length === 0) {
      alert("❌ Could not find Discord installation.");
      return;
    }
    const latestVersion = versions.sort().reverse()[0];
    const resourcesPath = path.join(discordPath, latestVersion, 'resources');
    
    // Check if backup exists
    const backup = path.join(resourcesPath, 'app_backup.asar');
    if (fs.existsSync(backup)) {
      // Restore backup
      const appAsar = path.join(resourcesPath, 'app.asar');
      fs.copyFileSync(backup, appAsar);
      
      // Show confirmation
      alert("✅ FlexCord uninstalled successfully.\n🔁 Please restart Discord to apply changes.");
    } else {
      alert("❌ Backup not found. Manual uninstallation may be required.");
    }
  } catch (e) {
    console.error("[FlexCord] Uninstall error:", e);
    alert("❌ Error during uninstallation: " + e.message);
  }
}

// Load plugins
function loadPlugins() {
  let enabledPlugins = [];
  console.log('[FlexCord Injector] Script execution started.');
try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      enabledPlugins = config.enabledPlugins || [];
    } else {
      // Create default config if it doesn't exist
      const defaultConfig = { enabledPlugins: [] };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read settings.json:", e);
    FlexCordAPI.events._emit('configReadError', { file: configPath, error: e });
  }

  // Read all plugins from directory
  console.log('[FlexCord Injector] Script execution started.');
try {
    fs.readdirSync(pluginDir).forEach(file => {
      if (!file.endsWith('.plugin.js')) return;
      
      const pluginPath = path.join(pluginDir, file);
      let plugin;
      let pluginLogger;

      console.log('[FlexCord Injector] Script execution started.');
try {
        // Clear cache to allow reloading
        delete require.cache[require.resolve(pluginPath)];
        plugin = require(pluginPath);
        
        // Store loaded plugin
        loadedPlugins[file] = plugin;
        
        // Create plugin-specific logger
        pluginLogger = FlexCordAPI.logger.createPluginLogger(plugin.meta?.name || file);
        
        // Add API reference to plugin
        plugin.api = FlexCordAPI;
        plugin.logger = pluginLogger;

      } catch (e) {
        console.error(`[FlexCord] Plugin load error (require): ${file}`, e);
        FlexCordAPI.events._emit('pluginLoadFailed', {
          id: file,
          error: e,
          reason: 'Plugin file could not be loaded/required.'
        });
        return; // Skip this plugin if require fails
      }
        
      // Call load event
      if (typeof plugin.onLoad === 'function') {
        console.log('[FlexCord Injector] Script execution started.');
try {
          plugin.onLoad();
        } catch (e) {
          pluginLogger.error('Error in onLoad', e);
          FlexCordAPI.events._emit('pluginOnLoadFailed', {
            id: file,
            name: plugin.meta?.name || file,
            error: e
          });
        }
      }
      
      // Call enable event if plugin is enabled
      if (enabledPlugins.includes(file) && typeof plugin.onEnable === 'function') {
        console.log('[FlexCord Injector] Script execution started.');
try {
          plugin.onEnable();
          FlexCordAPI.events._emit('pluginEnabled', {
            id: file,
            name: plugin.meta?.name || file
          });
        } catch (e) {
          pluginLogger.error('Error in onEnable', e);
          FlexCordAPI.events._emit('pluginEnableFailed', {
            id: file,
            name: plugin.meta?.name || file,
            error: e
          });
        }
      }
      
      // Emit plugin loaded event (signifies successful require and meta setup)
      FlexCordAPI.events._emit('pluginLoaded', {
        id: file,
        name: plugin.meta?.name || file,
        plugin: plugin
      });
      
      pluginLogger.log('Plugin processed'); // Changed from 'Plugin loaded' to 'Plugin processed'
    });
  } catch (e) {
    console.error("[FlexCord] Error reading plugin directory:", e);
    FlexCordAPI.events._emit('pluginDirectoryReadError', { directory: pluginDir, error: e });
  }
}

// Load themes
function loadThemes() {
  console.log('[FlexCord Injector] Script execution started.');
try {
    // Get active theme from config
    let activeThemeName = null;
    console.log('[FlexCord Injector] Script execution started.');
try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        activeThemeName = config.activeTheme;
      }
    } catch (e) {
      console.error("[FlexCord] Failed to read active theme from config:", e);
      FlexCordAPI.events._emit('themeConfigReadError', { file: configPath, error: e });
    }
    
    if (!activeThemeName) return;
    
    // Apply theme
    console.log('[FlexCord Injector] Script execution started.');
try {
      const themePath = path.join(themeDir, activeThemeName);
      if (fs.existsSync(themePath)) {
        const css = fs.readFileSync(themePath, "utf-8");
        const style = document.createElement("style");
        style.id = "flexcord-theme";
        style.innerText = css;
        document.head.appendChild(style);
        activeTheme = activeThemeName;
        console.log("[FlexCord] Loaded theme:", activeThemeName);
        FlexCordAPI.events._emit('themeApplied', { name: activeThemeName });
      } else {
        console.error(`[FlexCord] Theme file not found: ${activeThemeName}`);
        FlexCordAPI.events._emit('themeLoadFailed', { name: activeThemeName, error: new Error('Theme file not found') });
      }
    } catch (e) {
      console.error("[FlexCord] Error applying theme:", e);
      FlexCordAPI.events._emit('themeLoadFailed', { name: activeThemeName, error: e });
    }
  } catch (e) {
    console.error("[FlexCord] Error in loadThemes:", e);
    FlexCordAPI.events._emit('themeSystemError', { error: e });
  }
}

// Update theme in config
function updateThemeConfig(themeName) {
  console.log('[FlexCord Injector] Script execution started.');
try {
    // Read current config
    let config = { enabledPlugins: [] };
    console.log('[FlexCord Injector] Script execution started.');
try {
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
    } catch (e) {
      console.error("[FlexCord] Couldn't load settings for theme update, using default.");
      FlexCordAPI.events._emit('themeConfigReadError', { file: configPath, error: e, context: 'updateThemeConfig' });
    }
    
    // Remove current theme if exists
    const currentThemeElement = document.getElementById("flexcord-theme");
    if (currentThemeElement) {
      currentThemeElement.remove();
      if (activeTheme) {
        FlexCordAPI.events._emit('themeRemoved', { name: activeTheme });
      }
    }
    
    if (themeName) {
      // Apply new theme
      console.log('[FlexCord Injector] Script execution started.');
try {
        const themePath = path.join(themeDir, themeName);
        if (!fs.existsSync(themePath)) {
          console.error(`[FlexCord] Theme file not found for applying: ${themeName}`);
          FlexCordAPI.events._emit('themeApplyFailed', { name: themeName, error: new Error('Theme file not found') });
          activeTheme = null; // Ensure activeTheme is cleared if new one fails
        } else {
          const css = fs.readFileSync(themePath, "utf-8");
          const style = document.createElement("style");
          style.id = "flexcord-theme";
          style.innerText = css;
          document.head.appendChild(style);
          activeTheme = themeName;
          FlexCordAPI.events._emit('themeApplied', { name: themeName });
        }
      } catch (e) {
        console.error("[FlexCord] Error applying new theme:", e);
        FlexCordAPI.events._emit('themeApplyFailed', { name: themeName, error: e });
        activeTheme = null; // Ensure activeTheme is cleared if new one fails
      }
    } else {
      activeTheme = null;
      // Event for 'no theme' or 'theme explicitly removed' was handled above if currentThemeElement existed
      // If no theme was active and themeName is null, no specific event needed here for removal.
    }
    
    // Update config
    config.activeTheme = activeTheme; // Use the potentially updated activeTheme value
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`[FlexCord] Theme ${activeTheme ? `"${activeTheme}" applied` : "removed/cleared"}.`);
  } catch (e) {
    console.error("[FlexCord] Error updating theme config:", e);
    FlexCordAPI.events._emit('themeConfigWriteError', { file: configPath, error: e });
  }
}

// Update settings.json
function updatePluginConfig(pluginName, enabled) {
  let config = { enabledPlugins: [] };

  console.log('[FlexCord Injector] Script execution started.');
try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (e) {
    console.error("[FlexCord] Couldn't load settings, using default.");
    FlexCordAPI.events._emit('pluginConfigReadError', { file: configPath, error: e, context: 'updatePluginConfig' });
  }

  const wasEnabled = config.enabledPlugins.includes(pluginName);
  const plugin = loadedPlugins[pluginName];
  
  if (enabled && !wasEnabled) {
    config.enabledPlugins.push(pluginName);
    
    // Call enable event
    if (plugin && typeof plugin.onEnable === 'function') {
      console.log('[FlexCord Injector] Script execution started.');
try {
        plugin.onEnable();
        FlexCordAPI.events._emit('pluginEnabled', {
          id: pluginName,
          name: plugin.meta?.name || pluginName
        });
      } catch (e) {
        console.error(`[FlexCord] Error enabling plugin ${pluginName}:`, e);
        FlexCordAPI.events._emit('pluginEnableFailed', {
          id: pluginName,
          name: plugin.meta?.name || pluginName,
          error: e
        });
        // Optionally, revert enabling in config if onEnable fails critically
        // config.enabledPlugins = config.enabledPlugins.filter(p => p !== pluginName);
      }
    }
  } else if (!enabled && wasEnabled) {
    config.enabledPlugins = config.enabledPlugins.filter(p => p !== pluginName);
    
    // Call disable event
    if (plugin && typeof plugin.onDisable === 'function') {
      console.log('[FlexCord Injector] Script execution started.');
try {
        plugin.onDisable();
        FlexCordAPI.events._emit('pluginDisabled', {
          id: pluginName,
          name: plugin.meta?.name || pluginName
        });
      } catch (e) {
        console.error(`[FlexCord] Error disabling plugin ${pluginName}:`, e);
        FlexCordAPI.events._emit('pluginDisableFailed', {
          id: pluginName,
          name: plugin.meta?.name || pluginName,
          error: e
        });
        // Optionally, revert disabling in config if onDisable fails critically
        // config.enabledPlugins.push(pluginName);
      }
    }
  }

  console.log('[FlexCord Injector] Script execution started.');
try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`[FlexCord] Plugin "${pluginName}" ${enabled ? "enabled" : "disabled"}.`);
    FlexCordAPI.events._emit('pluginConfigUpdated', { name: pluginName, enabled: enabled });
  } catch (e) {
    console.error("[FlexCord] Error saving settings:", e);
    FlexCordAPI.events._emit('pluginConfigWriteError', { file: configPath, error: e });
  }
}

// Floating draggable FlexCord panel
function createFlexCordPanel() {
  const panel = document.createElement("div");
  panel.id = "flexcord-panel";
  panel.style.position = "fixed";
  panel.style.top = "60px";
  panel.style.right = "20px";
  panel.style.width = "320px";
  panel.style.height = "450px";
  panel.style.background = "#1e1e1e";
  panel.style.color = "#fff";
  panel.style.border = "1px solid #444";
  panel.style.zIndex = 99999;
  panel.style.borderRadius = "10px";
  panel.style.padding = "15px";
  panel.style.overflowY = "auto";
  panel.style.fontFamily = "sans-serif";
  panel.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
  panel.style.userSelect = "none";
  panel.style.display = "none"; // Hide by default

  panel.innerHTML = `
    <div id="drag-header" style="cursor: move; background: #292929; padding: 8px 12px; border-radius: 6px; margin: -10px -10px 15px -10px; display: flex; align-items: center; justify-content: space-between;">
      <h2 style="margin: 0; font-size: 18px; display: flex; align-items: center;">⚙️ <span style="margin-left: 8px;">FlexCord</span></h2>
      <div>
        <button id="close-panel-btn" style="background: none; border: none; color: #aaa; cursor: pointer; font-size: 16px;">✕</button>
      </div>
    </div>
    
    <div class="flexcord-tab-container">
      <div class="flexcord-tabs" style="display: flex; margin-bottom: 15px; border-bottom: 1px solid #333;">
        <div id="plugins-tab" class="flexcord-tab flexcord-tab-active" style="padding: 5px 15px; cursor: pointer; border-bottom: 2px solid #5865f2;">Plugins</div>
        <div id="themes-tab" class="flexcord-tab" style="padding: 5px 15px; cursor: pointer;">Themes</div>
        <div id="settings-tab" class="flexcord-tab" style="padding: 5px 15px; cursor: pointer;">Settings</div>
      </div>
      
      <div id="plugins-content" class="flexcord-tab-content" style="display: block;">
        <div style="margin-bottom: 10px;">
          <button id="reload-btn" style="background: #4f545c; border: none; border-radius: 4px; color: white; padding: 6px 10px; cursor: pointer; font-size: 14px;">🔄 Reload Plugins</button>
        </div>
        <div id="plugin-list" style="margin-top: 10px;"></div>
      </div>
      
      <div id="themes-content" class="flexcord-tab-content" style="display: none;">
        <div style="margin-bottom: 10px;">
          <button id="refresh-themes-btn" style="background: #4f545c; border: none; border-radius: 4px; color: white; padding: 6px 10px; cursor: pointer; font-size: 14px;">🔄 Refresh Themes</button>
        </div>
        <div id="theme-list" style="margin-top: 10px;"></div>
      </div>
      
      <div id="settings-content" class="flexcord-tab-content" style="display: none;">
        <div style="margin: 10px 0;">
          <h3 style="margin: 5px 0; font-size: 16px;">About FlexCord</h3>
          <p style="margin: 5px 0; color: #aaa; font-size: 14px;">The ultimate plugin-based Discord mod.</p>
          <p style="margin: 5px 0; color: #aaa; font-size: 14px;">Version: 1.0.0</p>
        </div>
        <div style="margin: 15px 0;">
          <button id="uninstall-btn" style="background: #f04747; border: none; border-radius: 4px; color: white; padding: 6px 10px; cursor: pointer; font-size: 14px;">Uninstall FlexCord</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Set up tab switching
  document.querySelectorAll('.flexcord-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      document.querySelectorAll('.flexcord-tab').forEach(t => {
        t.classList.remove('flexcord-tab-active');
        t.style.borderBottom = 'none';
      });
      
      // Hide all content
      document.querySelectorAll('.flexcord-tab-content').forEach(content => {
        content.style.display = 'none';
      });
      
      // Add active class to clicked tab
      tab.classList.add('flexcord-tab-active');
      tab.style.borderBottom = '2px solid #5865f2';
      
      // Show corresponding content
      const contentId = tab.id.replace('-tab', '-content');
      document.getElementById(contentId).style.display = 'block';
    });
  });

  // Set up plugin list
  loadPluginList();
  
  // Set up theme list
  loadThemeList();

  // Close button
  document.getElementById("close-panel-btn").addEventListener("click", () => {
    panel.style.display = "none";
  });

  // Reload button
  document.getElementById("reload-btn").addEventListener("click", () => {
    location.reload();
  });
  
  // Refresh themes
  document.getElementById("refresh-themes-btn").addEventListener("click", () => {
    loadThemeList();
  });

  // Uninstall button
  document.getElementById("uninstall-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to uninstall FlexCord? This will restore Discord to its original state.")) {
      uninstallFlexCord();
    }
  });

  makeDraggable(panel, document.getElementById("drag-header"));
}

// Load plugin list into UI
function loadPluginList() {
  const pluginList = document.getElementById("plugin-list");
  if (!pluginList) return;
  
  pluginList.innerHTML = '';
  
  let enabledPlugins = [];
  console.log('[FlexCord Injector] Script execution started.');
try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      enabledPlugins = config.enabledPlugins || [];
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read settings for plugin list:", e);
  }

  console.log('[FlexCord Injector] Script execution started.');
try {
    const plugins = fs.readdirSync(pluginDir)
      .filter(file => file.endsWith('.plugin.js'));
    
    if (plugins.length === 0) {
      pluginList.innerHTML = '<div style="color: #aaa; text-align: center; padding: 20px 0;">No plugins found</div>';
      return;
    }

    plugins.forEach(file => {
      console.log('[FlexCord Injector] Script execution started.');
try {
        // Try to load plugin metadata
        const pluginPath = path.join(pluginDir, file);
        let meta = { name: file, description: '', version: '', author: '' };
        
        if (loadedPlugins[file] && loadedPlugins[file].meta) {
          meta = loadedPlugins[file].meta;
        } else {
          // Try to extract metadata from comments if plugin isn't loaded
          console.log('[FlexCord Injector] Script execution started.');
try {
            const content = fs.readFileSync(pluginPath, 'utf-8');
            const nameMatch = content.match(/@name\s+(.+)/);
            const versionMatch = content.match(/@version\s+(.+)/);
            const descMatch = content.match(/@description\s+(.+)/);
            const authorMatch = content.match(/@author\s+(.+)/);
            
            if (nameMatch) meta.name = nameMatch[1].trim();
            if (versionMatch) meta.version = versionMatch[1].trim();
            if (descMatch) meta.description = descMatch[1].trim();
            if (authorMatch) meta.author = authorMatch[1].trim();
          } catch (e) {
            // If we can't read metadata, just use filename
          }
        }
        
        const card = document.createElement('div');
        card.style.padding = '10px';
        card.style.marginBottom = '10px';
        card.style.backgroundColor = '#2c2c2c';
        card.style.borderRadius = '6px';
        card.style.position = 'relative';
        
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.style.position = 'absolute';
        toggle.style.right = '10px';
        toggle.style.top = '10px';
        toggle.checked = enabledPlugins.includes(file);
        toggle.addEventListener('change', () => {
          updatePluginConfig(file, toggle.checked);
        });
        
        card.innerHTML = `
          <div style="padding-right: 30px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${meta.name}</div>
            <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">${meta.description}</div>
            <div style="color: #888; font-size: 11px;">v${meta.version} by ${meta.author}</div>
          </div>
        `;
        
        card.appendChild(toggle);
        pluginList.appendChild(card);
      } catch (e) {
        console.error(`[FlexCord] Error loading plugin UI for ${file}:`, e);
      }
    });
  } catch (e) {
    console.error("[FlexCord] Error loading plugin list:", e);
    pluginList.innerHTML = '<div style="color: #f04747; text-align: center; padding: 20px 0;">Error loading plugins</div>';
  }
}

// Load theme list into UI
function loadThemeList() {
  const themeList = document.getElementById("theme-list");
  if (!themeList) return;
  
  themeList.innerHTML = '';
  
  let activeThemeName = null;
  console.log('[FlexCord Injector] Script execution started.');
try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      activeThemeName = config.activeTheme;
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read active theme for theme list:", e);
  }

  console.log('[FlexCord Injector] Script execution started.');
try {
    const themes = fs.readdirSync(themeDir)
      .filter(file => file.endsWith('.theme.css') || file.endsWith('.css'));
    
    if (themes.length === 0) {
      themeList.innerHTML = '<div style="color: #aaa; text-align: center; padding: 20px 0;">No themes found</div>';
      return;
    }
    
    // Add "None" option
    const noneCard = document.createElement('div');
    noneCard.style.padding = '10px';
    noneCard.style.marginBottom = '10px';
    noneCard.style.backgroundColor = '#2c2c2c';
    noneCard.style.borderRadius = '6px';
    noneCard.style.position = 'relative';
    noneCard.style.cursor = 'pointer';
    
    if (!activeThemeName) {
      noneCard.style.borderLeft = '3px solid #5865f2';
    }
    
    noneCard.innerHTML = `
      <div>
        <div style="font-weight: bold; margin-bottom: 5px;">None</div>
        <div style="color: #aaa; font-size: 12px;">Disable all themes</div>
      </div>
    `;
    
    noneCard.addEventListener('click', () => {
      updateThemeConfig(null);
      document.querySelectorAll('#theme-list > div').forEach(card => {
        card.style.borderLeft = 'none';
      });
      noneCard.style.borderLeft = '3px solid #5865f2';
    });
    
    themeList.appendChild(noneCard);

    themes.forEach(file => {
      console.log('[FlexCord Injector] Script execution started.');
try {
        // Try to extract metadata from theme
        let meta = { name: file, description: '', version: '', author: '' };
        
        console.log('[FlexCord Injector] Script execution started.');
try {
          const content = fs.readFileSync(path.join(themeDir, file), 'utf-8');
          const nameMatch = content.match(/@name\s+(.+)/);
          const versionMatch = content.match(/@version\s+(.+)/);
          const descMatch = content.match(/@description\s+(.+)/);
          const authorMatch = content.match(/@author\s+(.+)/);
          
          if (nameMatch) meta.name = nameMatch[1].trim();
          if (versionMatch) meta.version = versionMatch[1].trim();
          if (descMatch) meta.description = descMatch[1].trim();
          if (authorMatch) meta.author = authorMatch[1].trim();
        } catch (e) {
          // If we can't read metadata, just use filename
        }
        
        const card = document.createElement('div');
        card.style.padding = '10px';
        card.style.marginBottom = '10px';
        card.style.backgroundColor = '#2c2c2c';
        card.style.borderRadius = '6px';
        card.style.position = 'relative';
        card.style.cursor = 'pointer';
        
        if (activeThemeName === file) {
          card.style.borderLeft = '3px solid #5865f2';
        }
        
        card.innerHTML = `
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">${meta.name}</div>
            <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">${meta.description}</div>
            <div style="color: #888; font-size: 11px;">v${meta.version} by ${meta.author}</div>
          </div>
        `;
        
        card.addEventListener('click', () => {
          updateThemeConfig(file);
          document.querySelectorAll('#theme-list > div').forEach(c => {
            c.style.borderLeft = 'none';
          });
          card.style.borderLeft = '3px solid #5865f2';
        });
        
        themeList.appendChild(card);
      } catch (e) {
        console.error(`[FlexCord] Error loading theme UI for ${file}:`, e);
      }
    });
  } catch (e) {
    console.error("[FlexCord] Error loading theme list:", e);
    themeList.innerHTML = '<div style="color: #f04747; text-align: center; padding: 20px 0;">Error loading themes</div>';
  }
}

// Floating toggle ⚙️ button
function createToggleButton() {
  const button = document.createElement("button");
  button.id = "flexcord-toggle";
  button.innerText = "⚙️";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.width = "40px";
  button.style.height = "40px";
  button.style.borderRadius = "50%";
  button.style.background = "#1e1e1e";
  button.style.color = "#fff";
  button.style.border = "1px solid #555";
  button.style.fontSize = "20px";
  button.style.cursor = "pointer";
  button.style.zIndex = 99998;
  button.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";

  button.onclick = () => {
    const panel = document.getElementById("flexcord-panel");
    if (panel) {
      if (panel.style.display === "none") {
        panel.style.display = "block";
        // Refresh lists when opening
        loadPluginList();
        loadThemeList();
      } else {
        panel.style.display = "none";
      }
    }
  };

  document.body.appendChild(button);
}

// Drag function
function makeDraggable(element, handle) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  handle.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    document.onmouseup = () => isDragging = false;
    document.onmousemove = (e) => {
      if (isDragging) {
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
        element.style.right = "auto"; // disables right-alignment while dragging
      }
    };
  };
}

// Function to integrate with Discord's settings panel
function integrateWithDiscordSettings() {
  // Observer to watch for Discord settings panel opening
  const settingsObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.addedNodes.length) {
        // Look for the settings panel container
        const settingsContainer = document.querySelector('[class*="layer-"][class*="baseLayer-"]');
        if (settingsContainer) {
          // Find the sidebar where settings categories are listed
          const sidebar = settingsContainer.querySelector('[class*="sidebar-"]');
          if (sidebar) {
            // Check if our settings are already injected
            if (!document.getElementById('flexcord-settings-tab')) {
              injectFlexCordSettingsTab(sidebar, settingsContainer);
            }
          }
        }
      }
    }
  });

  // Start observing the document body for Discord settings panel
  settingsObserver.observe(document.body, { childList: true, subtree: true });
}

// Function to inject FlexCord settings tab into Discord settings
function injectFlexCordSettingsTab(sidebar, settingsContainer) {
  // Create FlexCord settings tab
  const flexcordTab = document.createElement('div');
  flexcordTab.id = 'flexcord-settings-tab';
  flexcordTab.className = sidebar.querySelector('[class*="item-"]').className; // Copy existing tab class
  flexcordTab.innerHTML = `
    <div class="${sidebar.querySelector('[class*="item-"] [class*="header-"]').className}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.35 15 9 13.65 9 12C9 10.35 10.35 9 12 9C13.65 9 15 10.35 15 12C15 13.65 13.65 15 12 15Z" fill="currentColor"/>
      </svg>
      <div class="${sidebar.querySelector('[class*="item-"] [class*="header-"] div').className}">FlexCord</div>
    </div>
  `;
  
  // Add click event to show FlexCord settings
  flexcordTab.addEventListener('click', () => {
    // Remove active class from all tabs
    sidebar.querySelectorAll('[class*="selected-"]').forEach(tab => {
      tab.classList.remove(tab.className.split(' ').find(c => c.includes('selected-')));
    });
    
    // Add active class to FlexCord tab
    flexcordTab.classList.add(sidebar.querySelector('[class*="item-"]').className.split(' ').find(c => c.includes('selected-')));
    
    // Create or update FlexCord settings content
    createFlexCordSettingsContent(settingsContainer);
  });
  
  // Add FlexCord tab to sidebar
  sidebar.appendChild(flexcordTab);
}

// Function to create FlexCord settings content
function createFlexCordSettingsContent(settingsContainer) {
  // Find the content container
  const contentContainer = settingsContainer.querySelector('[class*="contentColumn-"]');
  if (!contentContainer) return;
  
  // Clear existing content
  contentContainer.innerHTML = '';
  
  // Create FlexCord settings content
  const settingsContent = document.createElement('div');
  settingsContent.className = 'flexcord-settings-content';
  settingsContent.style.padding = '20px';
  
  // Create header
  const header = document.createElement('h2');
  header.textContent = 'FlexCord Settings';
  header.style.marginBottom = '20px';
  settingsContent.appendChild(header);
  
  // Create tabs for different sections
  const tabContainer = document.createElement('div');
  tabContainer.style.display = 'flex';
  tabContainer.style.marginBottom = '20px';
  tabContainer.style.borderBottom = '1px solid var(--background-modifier-accent)';
  
  const tabs = ['Plugins', 'Themes', 'Settings'];
  tabs.forEach((tabName, index) => {
    const tab = document.createElement('div');
    tab.textContent = tabName;
    tab.style.padding = '10px 15px';
    tab.style.cursor = 'pointer';
    tab.style.marginRight = '10px';
    
    if (index === 0) {
      tab.style.borderBottom = '2px solid var(--text-link)';
      tab.style.color = 'var(--text-link)';
    }
    
    tab.addEventListener('click', () => {
      // Remove active styling from all tabs
      tabContainer.querySelectorAll('div').forEach(t => {
        t.style.borderBottom = 'none';
        t.style.color = '';
      });
      
      // Add active styling to clicked tab
      tab.style.borderBottom = '2px solid var(--text-link)';
      tab.style.color = 'var(--text-link)';
      
      // Show corresponding content
      const contentSections = settingsContent.querySelectorAll('.flexcord-section');
      contentSections.forEach(section => {
        section.style.display = 'none';
      });
      
      settingsContent.querySelector(`#flexcord-${tabName.toLowerCase()}-section`).style.display = 'block';
    });
    
    tabContainer.appendChild(tab);
  });
  
  settingsContent.appendChild(tabContainer);
  
  // Create content sections
  const pluginsSection = createPluginsSection();
  pluginsSection.id = 'flexcord-plugins-section';
  pluginsSection.className = 'flexcord-section';
  pluginsSection.style.display = 'block';
  settingsContent.appendChild(pluginsSection);
  
  const themesSection = createThemesSection();
  themesSection.id = 'flexcord-themes-section';
  themesSection.className = 'flexcord-section';
  themesSection.style.display = 'none';
  settingsContent.appendChild(themesSection);
  
  const settingsSection = createSettingsSection();
  settingsSection.id = 'flexcord-settings-section';
  settingsSection.className = 'flexcord-section';
  settingsSection.style.display = 'none';
  settingsContent.appendChild(settingsSection);
  
  // Add content to container
  contentContainer.appendChild(settingsContent);
}

// Function to create plugins section
function createPluginsSection() {
  const section = document.createElement('div');
  
  // Add reload button
  const reloadBtn = document.createElement('button');
  reloadBtn.textContent = '🔄 Reload Plugins';
  reloadBtn.className = 'flexcord-button';
  reloadBtn.style.backgroundColor = 'var(--brand-experiment)';
  reloadBtn.style.color = 'white';
  reloadBtn.style.border = 'none';
  reloadBtn.style.borderRadius = '3px';
  reloadBtn.style.padding = '8px 16px';
  reloadBtn.style.cursor = 'pointer';
  reloadBtn.style.marginBottom = '20px';
  
  reloadBtn.addEventListener('click', () => {
    location.reload();
  });
  
  section.appendChild(reloadBtn);
  
  // Create plugin list container
  const pluginListContainer = document.createElement('div');
  pluginListContainer.id = 'discord-integrated-plugin-list';
  section.appendChild(pluginListContainer);
  
  // Load plugins into the container
  loadPluginsIntoContainer(pluginListContainer);
  
  return section;
}

// Function to load plugins into a container
function loadPluginsIntoContainer(container) {
  if (!container) return;
  
  container.innerHTML = '';
  
  let enabledPlugins = [];
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      enabledPlugins = config.enabledPlugins || [];
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read settings for plugin list:", e);
  }

  try {
    const plugins = fs.readdirSync(pluginDir)
      .filter(file => file.endsWith('.plugin.js'));
    
    if (plugins.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px 0;">No plugins found</div>';
      return;
    }

    plugins.forEach(file => {
      try {
        // Try to load plugin metadata
        const pluginPath = path.join(pluginDir, file);
        let meta = { name: file, description: '', version: '', author: '' };
        
        if (loadedPlugins[file] && loadedPlugins[file].meta) {
          meta = loadedPlugins[file].meta;
        } else {
          // Try to extract metadata from comments if plugin isn't loaded
          try {
            const content = fs.readFileSync(pluginPath, 'utf-8');
            const nameMatch = content.match(/@name\s+(.+)/);
            const versionMatch = content.match(/@version\s+(.+)/);
            const descMatch = content.match(/@description\s+(.+)/);
            const authorMatch = content.match(/@author\s+(.+)/);
            
            if (nameMatch) meta.name = nameMatch[1].trim();
            if (versionMatch) meta.version = versionMatch[1].trim();
            if (descMatch) meta.description = descMatch[1].trim();
            if (authorMatch) meta.author = authorMatch[1].trim();
          } catch (e) {
            // If we can't read metadata, just use filename
          }
        }
        
        const card = document.createElement('div');
        card.style.padding = '15px';
        card.style.marginBottom = '15px';
        card.style.backgroundColor = 'var(--background-secondary)';
        card.style.borderRadius = '5px';
        card.style.position = 'relative';
        
        const toggle = document.createElement('div');
        toggle.className = 'flexcord-toggle';
        toggle.style.position = 'absolute';
        toggle.style.right = '15px';
        toggle.style.top = '15px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.height = '20px';
        checkbox.style.width = '40px';
        checkbox.checked = enabledPlugins.includes(file);
        checkbox.addEventListener('change', () => {
          updatePluginConfig(file, checkbox.checked);
        });
        
        toggle.appendChild(checkbox);
        
        card.innerHTML = `
          <div style="padding-right: 50px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${meta.name}</div>
            <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">${meta.description}</div>
            <div style="color: var(--text-muted); font-size: 12px;">v${meta.version} by ${meta.author}</div>
          </div>
        `;
        
        card.appendChild(toggle);
        container.appendChild(card);
      } catch (e) {
        console.error(`[FlexCord] Error loading plugin UI for ${file}:`, e);
      }
    });
  } catch (e) {
    console.error("[FlexCord] Error loading plugin list:", e);
    container.innerHTML = '<div style="color: var(--text-danger); text-align: center; padding: 20px 0;">Error loading plugins</div>';
  }
}

// Function to create themes section
function createThemesSection() {
  const section = document.createElement('div');
  
  // Add refresh button
  const refreshBtn = document.createElement('button');
  refreshBtn.textContent = '🔄 Refresh Themes';
  refreshBtn.className = 'flexcord-button';
  refreshBtn.style.backgroundColor = 'var(--brand-experiment)';
  refreshBtn.style.color = 'white';
  refreshBtn.style.border = 'none';
  refreshBtn.style.borderRadius = '3px';
  refreshBtn.style.padding = '8px 16px';
  refreshBtn.style.cursor = 'pointer';
  refreshBtn.style.marginBottom = '20px';
  
  refreshBtn.addEventListener('click', () => {
    loadThemesIntoContainer(document.getElementById('discord-integrated-theme-list'));
  });
  
  section.appendChild(refreshBtn);
  
  // Create theme list container
  const themeListContainer = document.createElement('div');
  themeListContainer.id = 'discord-integrated-theme-list';
  section.appendChild(themeListContainer);
  
  // Load themes into the container
  loadThemesIntoContainer(themeListContainer);
  
  return section;
}

// Function to load themes into a container
function loadThemesIntoContainer(container) {
  if (!container) return;
  
  container.innerHTML = '';
  
  let activeThemeName = null;
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      activeThemeName = config.activeTheme;
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read active theme for theme list:", e);
  }

  try {
    const themes = fs.readdirSync(themeDir)
      .filter(file => file.endsWith('.theme.css') || file.endsWith('.css'));
    
    if (themes.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px 0;">No themes found</div>';
      return;
    }
    
    // Add "None" option
    const noneCard = document.createElement('div');
    noneCard.style.padding = '15px';
    noneCard.style.marginBottom = '15px';
    noneCard.style.backgroundColor = 'var(--background-secondary)';
    noneCard.style.borderRadius = '5px';
    noneCard.style.position = 'relative';
    noneCard.style.cursor = 'pointer';
    
    if (!activeThemeName) {
      noneCard.style.borderLeft = '3px solid var(--brand-experiment)';
    }
    
    noneCard.innerHTML = `
      <div>
        <div style="font-weight: bold; margin-bottom: 5px;">None</div>
        <div style="color: var(--text-muted); font-size: 14px;">Disable all themes</div>
      </div>
    `;
    
    noneCard.addEventListener('click', () => {
      updateThemeConfig(null);
      document.querySelectorAll('#discord-integrated-theme-list > div').forEach(card => {
        card.style.borderLeft = 'none';
      });
      noneCard.style.borderLeft = '3px solid var(--brand-experiment)';
    });
    
    container.appendChild(noneCard);

    themes.forEach(file => {
      try {
        // Try to extract metadata from theme
        let meta = { name: file, description: '', version: '', author: '' };
        
        try {
          const content = fs.readFileSync(path.join(themeDir, file), 'utf-8');
          const nameMatch = content.match(/@name\s+(.+)/);
          const versionMatch = content.match(/@version\s+(.+)/);
          const descMatch = content.match(/@description\s+(.+)/);
          const authorMatch = content.match(/@author\s+(.+)/);
          
          if (nameMatch) meta.name = nameMatch[1].trim();
          if (versionMatch) meta.version = versionMatch[1].trim();
          if (descMatch) meta.description = descMatch[1].trim();
          if (authorMatch) meta.author = authorMatch[1].trim();
        } catch (e) {
          // If we can't read metadata, just use filename
        }
        
        const card = document.createElement('div');
        card.style.padding = '15px';
        card.style.marginBottom = '15px';
        card.style.backgroundColor = 'var(--background-secondary)';
        card.style.borderRadius = '5px';
        card.style.position = 'relative';
        card.style.cursor = 'pointer';
        
        if (activeThemeName === file) {
          card.style.borderLeft = '3px solid var(--brand-experiment)';
        }
        
        card.innerHTML = `
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">${meta.name}</div>
            <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">${meta.description}</div>
            <div style="color: var(--text-muted); font-size: 12px;">v${meta.version} by ${meta.author}</div>
          </div>
        `;
        
        card.addEventListener('click', () => {
          updateThemeConfig(file);
          document.querySelectorAll('#discord-integrated-theme-list > div').forEach(c => {
            c.style.borderLeft = 'none';
          });
          card.style.borderLeft = '3px solid var(--brand-experiment)';
        });
        
        container.appendChild(card);
      } catch (e) {
        console.error(`[FlexCord] Error loading theme UI for ${file}:`, e);
      }
    });
  } catch (e) {
    console.error("[FlexCord] Error loading theme list:", e);
    container.innerHTML = '<div style="color: var(--text-danger); text-align: center; padding: 20px 0;">Error loading themes</div>';
  }
}

// Function to create settings section
function createSettingsSection() {
  const section = document.createElement('div');
  
  // About section
  const aboutDiv = document.createElement('div');
  aboutDiv.style.marginBottom = '20px';
  aboutDiv.innerHTML = `
    <h3 style="margin-bottom: 10px;">About FlexCord</h3>
    <p style="color: var(--text-muted); margin-bottom: 5px;">The ultimate plugin-based Discord mod.</p>
    <p style="color: var(--text-muted); margin-bottom: 15px;">Version: 1.0.0</p>
  `;
  
  section.appendChild(aboutDiv);
  
  // Uninstall button
  const uninstallBtn = document.createElement('button');
  uninstallBtn.textContent = 'Uninstall FlexCord';
  uninstallBtn.style.backgroundColor = 'var(--status-danger)';
  uninstallBtn.style.color = 'white';
  uninstallBtn.style.border = 'none';
  uninstallBtn.style.borderRadius = '3px';
  uninstallBtn.style.padding = '8px 16px';
  uninstallBtn.style.cursor = 'pointer';
  
  uninstallBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to uninstall FlexCord? This will restore Discord to its original state.")) {
      uninstallFlexCord();
    }
  });
  
  section.appendChild(uninstallBtn);
  
  return section;
}

// INIT
window.addEventListener("DOMContentLoaded", () => {
  initializeAPI();
  loadPlugins();
  loadThemes();
  createFlexCordPanel();
  createToggleButton();
  integrateWithDiscordSettings(); // Add Discord settings integration
});

console.log("[FlexCord] Injected successfully!");
} catch (e) {
  console.error('[FlexCord Injector] CRITICAL ERROR DURING INITIALIZATION:', e);
  // Optionally, display an alert to the user if in a browser context, though this might be too early
  // if (typeof window !== 'undefined' && typeof alert !== 'undefined') {
  //   alert('FlexCord failed to initialize. Please check the console for errors. Error: ' + e.message);
  // }
}


const fs = require("fs");
const path = require("path");
const FlexCordAPI = require("./api");

// Use relative paths instead of hardcoded paths
const basePath = path.resolve(__dirname);
const pluginDir = path.join(basePath, "plugins");
const themeDir = path.join(basePath, "themes");
const configDir = path.join(basePath, "config");
const configPath = path.join(configDir, "settings.json");

// Create directories if they don't exist
if (!fs.existsSync(pluginDir)) fs.mkdirSync(pluginDir, { recursive: true });
if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir, { recursive: true });
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });

// Track loaded plugins
const loadedPlugins = {};

// Track active theme
let activeTheme = null;

// Initialize FlexCord API
function initializeAPI() {
  // Initialize with plugin data folder
  FlexCordAPI._initialize({
    dataFolder: path.join(basePath, "plugins", "data")
  });
  
  // Make API available globally for plugins to access
  window.FlexCordAPI = FlexCordAPI;
  
  // Set up Discord event listeners
  setupDiscordEventListeners();
}

// Set up listeners for Discord events
function setupDiscordEventListeners() {
  // Listen for message creation
  const originalMessageCreate = window.XMLHttpRequest.prototype.send;
  window.XMLHttpRequest.prototype.send = function(body) {
    const xhr = this;
    
    // Check if this is a message being sent
    if (body && typeof body === 'string' && body.includes('"content"')) {
try {
        const data = JSON.parse(body);
        if (data.content) {
          // Emit message send event
          FlexCordAPI.events._emit('messageSend', {
            content: data.content,
            channelId: xhr._url ? xhr._url.split('/').slice(-2)[0] : null
          });
        }
      } catch (e) {
        // Not a valid JSON or doesn't have content
      }
    }
    
    originalMessageCreate.apply(this, arguments);
  };
  
  // Store original URL setter to capture channel IDs
  const originalOpen = window.XMLHttpRequest.prototype.open;
  window.XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    originalOpen.apply(this, arguments);
  };
}

// Uninstall FlexCord
function uninstallFlexCord() {
  console.log('[FlexCord Injector] Script execution started.');
try {
    // Get Discord path info
    const os = require('os');
    
    const discordPath = path.join(
      os.homedir(),
      'AppData',
      'Local',
      'Discord'
    );
    
    // Find latest Discord version
    const versions = fs.readdirSync(discordPath).filter(f => f.startsWith('app-'));
    if (versions.length === 0) {
      alert("❌ Could not find Discord installation.");
      return;
    }
    const latestVersion = versions.sort().reverse()[0];
    const resourcesPath = path.join(discordPath, latestVersion, 'resources');
    
    // Check if backup exists
    const backup = path.join(resourcesPath, 'app_backup.asar');
    if (fs.existsSync(backup)) {
      // Restore backup
      const appAsar = path.join(resourcesPath, 'app.asar');
      fs.copyFileSync(backup, appAsar);
      
      // Show confirmation
      alert("✅ FlexCord uninstalled successfully.\n🔁 Please restart Discord to apply changes.");
    } else {
      alert("❌ Backup not found. Manual uninstallation may be required.");
    }
  } catch (e) {
    console.error("[FlexCord] Uninstall error:", e);
    alert("❌ Error during uninstallation: " + e.message);
  }
}

// Load plugins
function loadPlugins() {
  let enabledPlugins = [];
  console.log('[FlexCord Injector] Script execution started.');
try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      enabledPlugins = config.enabledPlugins || [];
    } else {
      // Create default config if it doesn't exist
      const defaultConfig = { enabledPlugins: [] };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read settings.json:", e);
    FlexCordAPI.events._emit('configReadError', { file: configPath, error: e });
  }

  // Read all plugins from directory
  console.log('[FlexCord Injector] Script execution started.');
try {
    fs.readdirSync(pluginDir).forEach(file => {
      if (!file.endsWith('.plugin.js')) return;
      
      const pluginPath = path.join(pluginDir, file);
      let plugin;
      let pluginLogger;

      console.log('[FlexCord Injector] Script execution started.');
try {
        // Clear cache to allow reloading
        delete require.cache[require.resolve(pluginPath)];
        plugin = require(pluginPath);
        
        // Store loaded plugin
        loadedPlugins[file] = plugin;
        
        // Create plugin-specific logger
        pluginLogger = FlexCordAPI.logger.createPluginLogger(plugin.meta?.name || file);
        
        // Add API reference to plugin
        plugin.api = FlexCordAPI;
        plugin.logger = pluginLogger;

      } catch (e) {
        console.error(`[FlexCord] Plugin load error (require): ${file}`, e);
        FlexCordAPI.events._emit('pluginLoadFailed', {
          id: file,
          error: e,
          reason: 'Plugin file could not be loaded/required.'
        });
        return; // Skip this plugin if require fails
      }
        
      // Call load event
      if (typeof plugin.onLoad === 'function') {
        console.log('[FlexCord Injector] Script execution started.');
try {
          plugin.onLoad();
        } catch (e) {
          pluginLogger.error('Error in onLoad', e);
          FlexCordAPI.events._emit('pluginOnLoadFailed', {
            id: file,
            name: plugin.meta?.name || file,
            error: e
          });
        }
      }
      
      // Call enable event if plugin is enabled
      if (enabledPlugins.includes(file) && typeof plugin.onEnable === 'function') {
        console.log('[FlexCord Injector] Script execution started.');
try {
          plugin.onEnable();
          FlexCordAPI.events._emit('pluginEnabled', {
            id: file,
            name: plugin.meta?.name || file
          });
        } catch (e) {
          pluginLogger.error('Error in onEnable', e);
          FlexCordAPI.events._emit('pluginEnableFailed', {
            id: file,
            name: plugin.meta?.name || file,
            error: e
          });
        }
      }
      
      // Emit plugin loaded event (signifies successful require and meta setup)
      FlexCordAPI.events._emit('pluginLoaded', {
        id: file,
        name: plugin.meta?.name || file,
        plugin: plugin
      });
      
      pluginLogger.log('Plugin processed'); // Changed from 'Plugin loaded' to 'Plugin processed'
    });
  } catch (e) {
    console.error("[FlexCord] Error reading plugin directory:", e);
    FlexCordAPI.events._emit('pluginDirectoryReadError', { directory: pluginDir, error: e });
  }
}

// Load themes
function loadThemes() {
  console.log('[FlexCord Injector] Script execution started.');
try {
    // Get active theme from config
    let activeThemeName = null;
    console.log('[FlexCord Injector] Script execution started.');
try {
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        activeThemeName = config.activeTheme;
      }
    } catch (e) {
      console.error("[FlexCord] Failed to read active theme from config:", e);
      FlexCordAPI.events._emit('themeConfigReadError', { file: configPath, error: e });
    }
    
    if (!activeThemeName) return;
    
    // Apply theme
    console.log('[FlexCord Injector] Script execution started.');
try {
      const themePath = path.join(themeDir, activeThemeName);
      if (fs.existsSync(themePath)) {
        const css = fs.readFileSync(themePath, "utf-8");
        const style = document.createElement("style");
        style.id = "flexcord-theme";
        style.innerText = css;
        document.head.appendChild(style);
        activeTheme = activeThemeName;
        console.log("[FlexCord] Loaded theme:", activeThemeName);
        FlexCordAPI.events._emit('themeApplied', { name: activeThemeName });
      } else {
        console.error(`[FlexCord] Theme file not found: ${activeThemeName}`);
        FlexCordAPI.events._emit('themeLoadFailed', { name: activeThemeName, error: new Error('Theme file not found') });
      }
    } catch (e) {
      console.error("[FlexCord] Error applying theme:", e);
      FlexCordAPI.events._emit('themeLoadFailed', { name: activeThemeName, error: e });
    }
  } catch (e) {
    console.error("[FlexCord] Error in loadThemes:", e);
    FlexCordAPI.events._emit('themeSystemError', { error: e });
  }
}

// Update theme in config
function updateThemeConfig(themeName) {
  console.log('[FlexCord Injector] Script execution started.');
try {
    // Read current config
    let config = { enabledPlugins: [] };
    console.log('[FlexCord Injector] Script execution started.');
try {
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
    } catch (e) {
      console.error("[FlexCord] Couldn't load settings for theme update, using default.");
      FlexCordAPI.events._emit('themeConfigReadError', { file: configPath, error: e, context: 'updateThemeConfig' });
    }
    
    // Remove current theme if exists
    const currentThemeElement = document.getElementById("flexcord-theme");
    if (currentThemeElement) {
      currentThemeElement.remove();
      if (activeTheme) {
        FlexCordAPI.events._emit('themeRemoved', { name: activeTheme });
      }
    }
    
    if (themeName) {
      // Apply new theme
      console.log('[FlexCord Injector] Script execution started.');
try {
        const themePath = path.join(themeDir, themeName);
        if (!fs.existsSync(themePath)) {
          console.error(`[FlexCord] Theme file not found for applying: ${themeName}`);
          FlexCordAPI.events._emit('themeApplyFailed', { name: themeName, error: new Error('Theme file not found') });
          activeTheme = null; // Ensure activeTheme is cleared if new one fails
        } else {
          const css = fs.readFileSync(themePath, "utf-8");
          const style = document.createElement("style");
          style.id = "flexcord-theme";
          style.innerText = css;
          document.head.appendChild(style);
          activeTheme = themeName;
          FlexCordAPI.events._emit('themeApplied', { name: themeName });
        }
      } catch (e) {
        console.error("[FlexCord] Error applying new theme:", e);
        FlexCordAPI.events._emit('themeApplyFailed', { name: themeName, error: e });
        activeTheme = null; // Ensure activeTheme is cleared if new one fails
      }
    } else {
      activeTheme = null;
      // Event for 'no theme' or 'theme explicitly removed' was handled above if currentThemeElement existed
      // If no theme was active and themeName is null, no specific event needed here for removal.
    }
    
    // Update config
    config.activeTheme = activeTheme; // Use the potentially updated activeTheme value
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`[FlexCord] Theme ${activeTheme ? `"${activeTheme}" applied` : "removed/cleared"}.`);
  } catch (e) {
    console.error("[FlexCord] Error updating theme config:", e);
    FlexCordAPI.events._emit('themeConfigWriteError', { file: configPath, error: e });
  }
}

// Update settings.json
function updatePluginConfig(pluginName, enabled) {
  let config = { enabledPlugins: [] };

  console.log('[FlexCord Injector] Script execution started.');
try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (e) {
    console.error("[FlexCord] Couldn't load settings, using default.");
    FlexCordAPI.events._emit('pluginConfigReadError', { file: configPath, error: e, context: 'updatePluginConfig' });
  }

  const wasEnabled = config.enabledPlugins.includes(pluginName);
  const plugin = loadedPlugins[pluginName];
  
  if (enabled && !wasEnabled) {
    config.enabledPlugins.push(pluginName);
    
    // Call enable event
    if (plugin && typeof plugin.onEnable === 'function') {
      console.log('[FlexCord Injector] Script execution started.');
try {
        plugin.onEnable();
        FlexCordAPI.events._emit('pluginEnabled', {
          id: pluginName,
          name: plugin.meta?.name || pluginName
        });
      } catch (e) {
        console.error(`[FlexCord] Error enabling plugin ${pluginName}:`, e);
        FlexCordAPI.events._emit('pluginEnableFailed', {
          id: pluginName,
          name: plugin.meta?.name || pluginName,
          error: e
        });
        // Optionally, revert enabling in config if onEnable fails critically
        // config.enabledPlugins = config.enabledPlugins.filter(p => p !== pluginName);
      }
    }
  } else if (!enabled && wasEnabled) {
    config.enabledPlugins = config.enabledPlugins.filter(p => p !== pluginName);
    
    // Call disable event
    if (plugin && typeof plugin.onDisable === 'function') {
      console.log('[FlexCord Injector] Script execution started.');
try {
        plugin.onDisable();
        FlexCordAPI.events._emit('pluginDisabled', {
          id: pluginName,
          name: plugin.meta?.name || pluginName
        });
      } catch (e) {
        console.error(`[FlexCord] Error disabling plugin ${pluginName}:`, e);
        FlexCordAPI.events._emit('pluginDisableFailed', {
          id: pluginName,
          name: plugin.meta?.name || pluginName,
          error: e
        });
        // Optionally, revert disabling in config if onDisable fails critically
        // config.enabledPlugins.push(pluginName);
      }
    }
  }

  console.log('[FlexCord Injector] Script execution started.');
try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`[FlexCord] Plugin "${pluginName}" ${enabled ? "enabled" : "disabled"}.`);
    FlexCordAPI.events._emit('pluginConfigUpdated', { name: pluginName, enabled: enabled });
  } catch (e) {
    console.error("[FlexCord] Error saving settings:", e);
    FlexCordAPI.events._emit('pluginConfigWriteError', { file: configPath, error: e });
  }
}

// Floating draggable FlexCord panel
function createFlexCordPanel() {
  const panel = document.createElement("div");
  panel.id = "flexcord-panel";
  panel.style.position = "fixed";
  panel.style.top = "60px";
  panel.style.right = "20px";
  panel.style.width = "320px";
  panel.style.height = "450px";
  panel.style.background = "#1e1e1e";
  panel.style.color = "#fff";
  panel.style.border = "1px solid #444";
  panel.style.zIndex = 99999;
  panel.style.borderRadius = "10px";
  panel.style.padding = "15px";
  panel.style.overflowY = "auto";
  panel.style.fontFamily = "sans-serif";
  panel.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
  panel.style.userSelect = "none";
  panel.style.display = "none"; // Hide by default

  panel.innerHTML = `
    <div id="drag-header" style="cursor: move; background: #292929; padding: 8px 12px; border-radius: 6px; margin: -10px -10px 15px -10px; display: flex; align-items: center; justify-content: space-between;">
      <h2 style="margin: 0; font-size: 18px; display: flex; align-items: center;">⚙️ <span style="margin-left: 8px;">FlexCord</span></h2>
      <div>
        <button id="close-panel-btn" style="background: none; border: none; color: #aaa; cursor: pointer; font-size: 16px;">✕</button>
      </div>
    </div>
    
    <div class="flexcord-tab-container">
      <div class="flexcord-tabs" style="display: flex; margin-bottom: 15px; border-bottom: 1px solid #333;">
        <div id="plugins-tab" class="flexcord-tab flexcord-tab-active" style="padding: 5px 15px; cursor: pointer; border-bottom: 2px solid #5865f2;">Plugins</div>
        <div id="themes-tab" class="flexcord-tab" style="padding: 5px 15px; cursor: pointer;">Themes</div>
        <div id="settings-tab" class="flexcord-tab" style="padding: 5px 15px; cursor: pointer;">Settings</div>
      </div>
      
      <div id="plugins-content" class="flexcord-tab-content" style="display: block;">
        <div style="margin-bottom: 10px;">
          <button id="reload-btn" style="background: #4f545c; border: none; border-radius: 4px; color: white; padding: 6px 10px; cursor: pointer; font-size: 14px;">🔄 Reload Plugins</button>
        </div>
        <div id="plugin-list" style="margin-top: 10px;"></div>
      </div>
      
      <div id="themes-content" class="flexcord-tab-content" style="display: none;">
        <div style="margin-bottom: 10px;">
          <button id="refresh-themes-btn" style="background: #4f545c; border: none; border-radius: 4px; color: white; padding: 6px 10px; cursor: pointer; font-size: 14px;">🔄 Refresh Themes</button>
        </div>
        <div id="theme-list" style="margin-top: 10px;"></div>
      </div>
      
      <div id="settings-content" class="flexcord-tab-content" style="display: none;">
        <div style="margin: 10px 0;">
          <h3 style="margin: 5px 0; font-size: 16px;">About FlexCord</h3>
          <p style="margin: 5px 0; color: #aaa; font-size: 14px;">The ultimate plugin-based Discord mod.</p>
          <p style="margin: 5px 0; color: #aaa; font-size: 14px;">Version: 1.0.0</p>
        </div>
        <div style="margin: 15px 0;">
          <button id="uninstall-btn" style="background: #f04747; border: none; border-radius: 4px; color: white; padding: 6px 10px; cursor: pointer; font-size: 14px;">Uninstall FlexCord</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Set up tab switching
  document.querySelectorAll('.flexcord-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs
      document.querySelectorAll('.flexcord-tab').forEach(t => {
        t.classList.remove('flexcord-tab-active');
        t.style.borderBottom = 'none';
      });
      
      // Hide all content
      document.querySelectorAll('.flexcord-tab-content').forEach(content => {
        content.style.display = 'none';
      });
      
      // Add active class to clicked tab
      tab.classList.add('flexcord-tab-active');
      tab.style.borderBottom = '2px solid #5865f2';
      
      // Show corresponding content
      const contentId = tab.id.replace('-tab', '-content');
      document.getElementById(contentId).style.display = 'block';
    });
  });

  // Set up plugin list
  loadPluginList();
  
  // Set up theme list
  loadThemeList();

  // Close button
  document.getElementById("close-panel-btn").addEventListener("click", () => {
    panel.style.display = "none";
  });

  // Reload button
  document.getElementById("reload-btn").addEventListener("click", () => {
    location.reload();
  });
  
  // Refresh themes
  document.getElementById("refresh-themes-btn").addEventListener("click", () => {
    loadThemeList();
  });

  // Uninstall button
  document.getElementById("uninstall-btn").addEventListener("click", () => {
    if (confirm("Are you sure you want to uninstall FlexCord? This will restore Discord to its original state.")) {
      uninstallFlexCord();
    }
  });

  makeDraggable(panel, document.getElementById("drag-header"));
}

// Load plugin list into UI
function loadPluginList() {
  const pluginList = document.getElementById("plugin-list");
  if (!pluginList) return;
  
  pluginList.innerHTML = '';
  
  let enabledPlugins = [];
  console.log('[FlexCord Injector] Script execution started.');
try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      enabledPlugins = config.enabledPlugins || [];
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read settings for plugin list:", e);
  }

  console.log('[FlexCord Injector] Script execution started.');
try {
    const plugins = fs.readdirSync(pluginDir)
      .filter(file => file.endsWith('.plugin.js'));
    
    if (plugins.length === 0) {
      pluginList.innerHTML = '<div style="color: #aaa; text-align: center; padding: 20px 0;">No plugins found</div>';
      return;
    }

    plugins.forEach(file => {
      console.log('[FlexCord Injector] Script execution started.');
try {
        // Try to load plugin metadata
        const pluginPath = path.join(pluginDir, file);
        let meta = { name: file, description: '', version: '', author: '' };
        
        if (loadedPlugins[file] && loadedPlugins[file].meta) {
          meta = loadedPlugins[file].meta;
        } else {
          // Try to extract metadata from comments if plugin isn't loaded
          console.log('[FlexCord Injector] Script execution started.');
try {
            const content = fs.readFileSync(pluginPath, 'utf-8');
            const nameMatch = content.match(/@name\s+(.+)/);
            const versionMatch = content.match(/@version\s+(.+)/);
            const descMatch = content.match(/@description\s+(.+)/);
            const authorMatch = content.match(/@author\s+(.+)/);
            
            if (nameMatch) meta.name = nameMatch[1].trim();
            if (versionMatch) meta.version = versionMatch[1].trim();
            if (descMatch) meta.description = descMatch[1].trim();
            if (authorMatch) meta.author = authorMatch[1].trim();
          } catch (e) {
            // If we can't read metadata, just use filename
          }
        }
        
        const card = document.createElement('div');
        card.style.padding = '10px';
        card.style.marginBottom = '10px';
        card.style.backgroundColor = '#2c2c2c';
        card.style.borderRadius = '6px';
        card.style.position = 'relative';
        
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.style.position = 'absolute';
        toggle.style.right = '10px';
        toggle.style.top = '10px';
        toggle.checked = enabledPlugins.includes(file);
        toggle.addEventListener('change', () => {
          updatePluginConfig(file, toggle.checked);
        });
        
        card.innerHTML = `
          <div style="padding-right: 30px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${meta.name}</div>
            <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">${meta.description}</div>
            <div style="color: #888; font-size: 11px;">v${meta.version} by ${meta.author}</div>
          </div>
        `;
        
        card.appendChild(toggle);
        pluginList.appendChild(card);
      } catch (e) {
        console.error(`[FlexCord] Error loading plugin UI for ${file}:`, e);
      }
    });
  } catch (e) {
    console.error("[FlexCord] Error loading plugin list:", e);
    pluginList.innerHTML = '<div style="color: #f04747; text-align: center; padding: 20px 0;">Error loading plugins</div>';
  }
}

// Load theme list into UI
function loadThemeList() {
  const themeList = document.getElementById("theme-list");
  if (!themeList) return;
  
  themeList.innerHTML = '';
  
  let activeThemeName = null;
  console.log('[FlexCord Injector] Script execution started.');
try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      activeThemeName = config.activeTheme;
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read active theme for theme list:", e);
  }

  console.log('[FlexCord Injector] Script execution started.');
try {
    const themes = fs.readdirSync(themeDir)
      .filter(file => file.endsWith('.theme.css') || file.endsWith('.css'));
    
    if (themes.length === 0) {
      themeList.innerHTML = '<div style="color: #aaa; text-align: center; padding: 20px 0;">No themes found</div>';
      return;
    }
    
    // Add "None" option
    const noneCard = document.createElement('div');
    noneCard.style.padding = '10px';
    noneCard.style.marginBottom = '10px';
    noneCard.style.backgroundColor = '#2c2c2c';
    noneCard.style.borderRadius = '6px';
    noneCard.style.position = 'relative';
    noneCard.style.cursor = 'pointer';
    
    if (!activeThemeName) {
      noneCard.style.borderLeft = '3px solid #5865f2';
    }
    
    noneCard.innerHTML = `
      <div>
        <div style="font-weight: bold; margin-bottom: 5px;">None</div>
        <div style="color: #aaa; font-size: 12px;">Disable all themes</div>
      </div>
    `;
    
    noneCard.addEventListener('click', () => {
      updateThemeConfig(null);
      document.querySelectorAll('#theme-list > div').forEach(card => {
        card.style.borderLeft = 'none';
      });
      noneCard.style.borderLeft = '3px solid #5865f2';
    });
    
    themeList.appendChild(noneCard);

    themes.forEach(file => {
      console.log('[FlexCord Injector] Script execution started.');
try {
        // Try to extract metadata from theme
        let meta = { name: file, description: '', version: '', author: '' };
        
        console.log('[FlexCord Injector] Script execution started.');
try {
          const content = fs.readFileSync(path.join(themeDir, file), 'utf-8');
          const nameMatch = content.match(/@name\s+(.+)/);
          const versionMatch = content.match(/@version\s+(.+)/);
          const descMatch = content.match(/@description\s+(.+)/);
          const authorMatch = content.match(/@author\s+(.+)/);
          
          if (nameMatch) meta.name = nameMatch[1].trim();
          if (versionMatch) meta.version = versionMatch[1].trim();
          if (descMatch) meta.description = descMatch[1].trim();
          if (authorMatch) meta.author = authorMatch[1].trim();
        } catch (e) {
          // If we can't read metadata, just use filename
        }
        
        const card = document.createElement('div');
        card.style.padding = '10px';
        card.style.marginBottom = '10px';
        card.style.backgroundColor = '#2c2c2c';
        card.style.borderRadius = '6px';
        card.style.position = 'relative';
        card.style.cursor = 'pointer';
        
        if (activeThemeName === file) {
          card.style.borderLeft = '3px solid #5865f2';
        }
        
        card.innerHTML = `
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">${meta.name}</div>
            <div style="color: #aaa; font-size: 12px; margin-bottom: 5px;">${meta.description}</div>
            <div style="color: #888; font-size: 11px;">v${meta.version} by ${meta.author}</div>
          </div>
        `;
        
        card.addEventListener('click', () => {
          updateThemeConfig(file);
          document.querySelectorAll('#theme-list > div').forEach(c => {
            c.style.borderLeft = 'none';
          });
          card.style.borderLeft = '3px solid #5865f2';
        });
        
        themeList.appendChild(card);
      } catch (e) {
        console.error(`[FlexCord] Error loading theme UI for ${file}:`, e);
      }
    });
  } catch (e) {
    console.error("[FlexCord] Error loading theme list:", e);
    themeList.innerHTML = '<div style="color: #f04747; text-align: center; padding: 20px 0;">Error loading themes</div>';
  }
}

// Floating toggle ⚙️ button
function createToggleButton() {
  const button = document.createElement("button");
  button.id = "flexcord-toggle";
  button.innerText = "⚙️";
  button.style.position = "fixed";
  button.style.bottom = "20px";
  button.style.right = "20px";
  button.style.width = "40px";
  button.style.height = "40px";
  button.style.borderRadius = "50%";
  button.style.background = "#1e1e1e";
  button.style.color = "#fff";
  button.style.border = "1px solid #555";
  button.style.fontSize = "20px";
  button.style.cursor = "pointer";
  button.style.zIndex = 99998;
  button.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";

  button.onclick = () => {
    const panel = document.getElementById("flexcord-panel");
    if (panel) {
      if (panel.style.display === "none") {
        panel.style.display = "block";
        // Refresh lists when opening
        loadPluginList();
        loadThemeList();
      } else {
        panel.style.display = "none";
      }
    }
  };

  document.body.appendChild(button);
}

// Drag function
function makeDraggable(element, handle) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  handle.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    document.onmouseup = () => isDragging = false;
    document.onmousemove = (e) => {
      if (isDragging) {
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
        element.style.right = "auto"; // disables right-alignment while dragging
      }
    };
  };
}

// Function to integrate with Discord's settings panel
function integrateWithDiscordSettings() {
  // Observer to watch for Discord settings panel opening
  const settingsObserver = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.addedNodes.length) {
        // Look for the settings panel container
        const settingsContainer = document.querySelector('[class*="layer-"][class*="baseLayer-"]');
        if (settingsContainer) {
          // Find the sidebar where settings categories are listed
          const sidebar = settingsContainer.querySelector('[class*="sidebar-"]');
          if (sidebar) {
            // Check if our settings are already injected
            if (!document.getElementById('flexcord-settings-tab')) {
              injectFlexCordSettingsTab(sidebar, settingsContainer);
            }
          }
        }
      }
    }
  });

  // Start observing the document body for Discord settings panel
  settingsObserver.observe(document.body, { childList: true, subtree: true });
}

// Function to inject FlexCord settings tab into Discord settings
function injectFlexCordSettingsTab(sidebar, settingsContainer) {
  // Create FlexCord settings tab
  const flexcordTab = document.createElement('div');
  flexcordTab.id = 'flexcord-settings-tab';
  flexcordTab.className = sidebar.querySelector('[class*="item-"]').className; // Copy existing tab class
  flexcordTab.innerHTML = `
    <div class="${sidebar.querySelector('[class*="item-"] [class*="header-"]').className}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 15C10.35 15 9 13.65 9 12C9 10.35 10.35 9 12 9C13.65 9 15 10.35 15 12C15 13.65 13.65 15 12 15Z" fill="currentColor"/>
      </svg>
      <div class="${sidebar.querySelector('[class*="item-"] [class*="header-"] div').className}">FlexCord</div>
    </div>
  `;
  
  // Add click event to show FlexCord settings
  flexcordTab.addEventListener('click', () => {
    // Remove active class from all tabs
    sidebar.querySelectorAll('[class*="selected-"]').forEach(tab => {
      tab.classList.remove(tab.className.split(' ').find(c => c.includes('selected-')));
    });
    
    // Add active class to FlexCord tab
    flexcordTab.classList.add(sidebar.querySelector('[class*="item-"]').className.split(' ').find(c => c.includes('selected-')));
    
    // Create or update FlexCord settings content
    createFlexCordSettingsContent(settingsContainer);
  });
  
  // Add FlexCord tab to sidebar
  sidebar.appendChild(flexcordTab);
}

// Function to create FlexCord settings content
function createFlexCordSettingsContent(settingsContainer) {
  // Find the content container
  const contentContainer = settingsContainer.querySelector('[class*="contentColumn-"]');
  if (!contentContainer) return;
  
  // Clear existing content
  contentContainer.innerHTML = '';
  
  // Create FlexCord settings content
  const settingsContent = document.createElement('div');
  settingsContent.className = 'flexcord-settings-content';
  settingsContent.style.padding = '20px';
  
  // Create header
  const header = document.createElement('h2');
  header.textContent = 'FlexCord Settings';
  header.style.marginBottom = '20px';
  settingsContent.appendChild(header);
  
  // Create tabs for different sections
  const tabContainer = document.createElement('div');
  tabContainer.style.display = 'flex';
  tabContainer.style.marginBottom = '20px';
  tabContainer.style.borderBottom = '1px solid var(--background-modifier-accent)';
  
  const tabs = ['Plugins', 'Themes', 'Settings'];
  tabs.forEach((tabName, index) => {
    const tab = document.createElement('div');
    tab.textContent = tabName;
    tab.style.padding = '10px 15px';
    tab.style.cursor = 'pointer';
    tab.style.marginRight = '10px';
    
    if (index === 0) {
      tab.style.borderBottom = '2px solid var(--text-link)';
      tab.style.color = 'var(--text-link)';
    }
    
    tab.addEventListener('click', () => {
      // Remove active styling from all tabs
      tabContainer.querySelectorAll('div').forEach(t => {
        t.style.borderBottom = 'none';
        t.style.color = '';
      });
      
      // Add active styling to clicked tab
      tab.style.borderBottom = '2px solid var(--text-link)';
      tab.style.color = 'var(--text-link)';
      
      // Show corresponding content
      const contentSections = settingsContent.querySelectorAll('.flexcord-section');
      contentSections.forEach(section => {
        section.style.display = 'none';
      });
      
      settingsContent.querySelector(`#flexcord-${tabName.toLowerCase()}-section`).style.display = 'block';
    });
    
    tabContainer.appendChild(tab);
  });
  
  settingsContent.appendChild(tabContainer);
  
  // Create content sections
  const pluginsSection = createPluginsSection();
  pluginsSection.id = 'flexcord-plugins-section';
  pluginsSection.className = 'flexcord-section';
  pluginsSection.style.display = 'block';
  settingsContent.appendChild(pluginsSection);
  
  const themesSection = createThemesSection();
  themesSection.id = 'flexcord-themes-section';
  themesSection.className = 'flexcord-section';
  themesSection.style.display = 'none';
  settingsContent.appendChild(themesSection);
  
  const settingsSection = createSettingsSection();
  settingsSection.id = 'flexcord-settings-section';
  settingsSection.className = 'flexcord-section';
  settingsSection.style.display = 'none';
  settingsContent.appendChild(settingsSection);
  
  // Add content to container
  contentContainer.appendChild(settingsContent);
}

// Function to create plugins section
function createPluginsSection() {
  const section = document.createElement('div');
  
  // Add reload button
  const reloadBtn = document.createElement('button');
  reloadBtn.textContent = '🔄 Reload Plugins';
  reloadBtn.className = 'flexcord-button';
  reloadBtn.style.backgroundColor = 'var(--brand-experiment)';
  reloadBtn.style.color = 'white';
  reloadBtn.style.border = 'none';
  reloadBtn.style.borderRadius = '3px';
  reloadBtn.style.padding = '8px 16px';
  reloadBtn.style.cursor = 'pointer';
  reloadBtn.style.marginBottom = '20px';
  
  reloadBtn.addEventListener('click', () => {
    location.reload();
  });
  
  section.appendChild(reloadBtn);
  
  // Create plugin list container
  const pluginListContainer = document.createElement('div');
  pluginListContainer.id = 'discord-integrated-plugin-list';
  section.appendChild(pluginListContainer);
  
  // Load plugins into the container
  loadPluginsIntoContainer(pluginListContainer);
  
  return section;
}

// Function to load plugins into a container
function loadPluginsIntoContainer(container) {
  if (!container) return;
  
  container.innerHTML = '';
  
  let enabledPlugins = [];
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      enabledPlugins = config.enabledPlugins || [];
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read settings for plugin list:", e);
  }

  try {
    const plugins = fs.readdirSync(pluginDir)
      .filter(file => file.endsWith('.plugin.js'));
    
    if (plugins.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px 0;">No plugins found</div>';
      return;
    }

    plugins.forEach(file => {
      try {
        // Try to load plugin metadata
        const pluginPath = path.join(pluginDir, file);
        let meta = { name: file, description: '', version: '', author: '' };
        
        if (loadedPlugins[file] && loadedPlugins[file].meta) {
          meta = loadedPlugins[file].meta;
        } else {
          // Try to extract metadata from comments if plugin isn't loaded
          try {
            const content = fs.readFileSync(pluginPath, 'utf-8');
            const nameMatch = content.match(/@name\s+(.+)/);
            const versionMatch = content.match(/@version\s+(.+)/);
            const descMatch = content.match(/@description\s+(.+)/);
            const authorMatch = content.match(/@author\s+(.+)/);
            
            if (nameMatch) meta.name = nameMatch[1].trim();
            if (versionMatch) meta.version = versionMatch[1].trim();
            if (descMatch) meta.description = descMatch[1].trim();
            if (authorMatch) meta.author = authorMatch[1].trim();
          } catch (e) {
            // If we can't read metadata, just use filename
          }
        }
        
        const card = document.createElement('div');
        card.style.padding = '15px';
        card.style.marginBottom = '15px';
        card.style.backgroundColor = 'var(--background-secondary)';
        card.style.borderRadius = '5px';
        card.style.position = 'relative';
        
        const toggle = document.createElement('div');
        toggle.className = 'flexcord-toggle';
        toggle.style.position = 'absolute';
        toggle.style.right = '15px';
        toggle.style.top = '15px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.height = '20px';
        checkbox.style.width = '40px';
        checkbox.checked = enabledPlugins.includes(file);
        checkbox.addEventListener('change', () => {
          updatePluginConfig(file, checkbox.checked);
        });
        
        toggle.appendChild(checkbox);
        
        card.innerHTML = `
          <div style="padding-right: 50px;">
            <div style="font-weight: bold; margin-bottom: 5px;">${meta.name}</div>
            <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">${meta.description}</div>
            <div style="color: var(--text-muted); font-size: 12px;">v${meta.version} by ${meta.author}</div>
          </div>
        `;
        
        card.appendChild(toggle);
        container.appendChild(card);
      } catch (e) {
        console.error(`[FlexCord] Error loading plugin UI for ${file}:`, e);
      }
    });
  } catch (e) {
    console.error("[FlexCord] Error loading plugin list:", e);
    container.innerHTML = '<div style="color: var(--text-danger); text-align: center; padding: 20px 0;">Error loading plugins</div>';
  }
}

// Function to create themes section
function createThemesSection() {
  const section = document.createElement('div');
  
  // Add refresh button
  const refreshBtn = document.createElement('button');
  refreshBtn.textContent = '🔄 Refresh Themes';
  refreshBtn.className = 'flexcord-button';
  refreshBtn.style.backgroundColor = 'var(--brand-experiment)';
  refreshBtn.style.color = 'white';
  refreshBtn.style.border = 'none';
  refreshBtn.style.borderRadius = '3px';
  refreshBtn.style.padding = '8px 16px';
  refreshBtn.style.cursor = 'pointer';
  refreshBtn.style.marginBottom = '20px';
  
  refreshBtn.addEventListener('click', () => {
    loadThemesIntoContainer(document.getElementById('discord-integrated-theme-list'));
  });
  
  section.appendChild(refreshBtn);
  
  // Create theme list container
  const themeListContainer = document.createElement('div');
  themeListContainer.id = 'discord-integrated-theme-list';
  section.appendChild(themeListContainer);
  
  // Load themes into the container
  loadThemesIntoContainer(themeListContainer);
  
  return section;
}

// Function to load themes into a container
function loadThemesIntoContainer(container) {
  if (!container) return;
  
  container.innerHTML = '';
  
  let activeThemeName = null;
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      activeThemeName = config.activeTheme;
    }
  } catch (e) {
    console.error("[FlexCord] Failed to read active theme for theme list:", e);
  }

  try {
    const themes = fs.readdirSync(themeDir)
      .filter(file => file.endsWith('.theme.css') || file.endsWith('.css'));
    
    if (themes.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px 0;">No themes found</div>';
      return;
    }
    
    // Add "None" option
    const noneCard = document.createElement('div');
    noneCard.style.padding = '15px';
    noneCard.style.marginBottom = '15px';
    noneCard.style.backgroundColor = 'var(--background-secondary)';
    noneCard.style.borderRadius = '5px';
    noneCard.style.position = 'relative';
    noneCard.style.cursor = 'pointer';
    
    if (!activeThemeName) {
      noneCard.style.borderLeft = '3px solid var(--brand-experiment)';
    }
    
    noneCard.innerHTML = `
      <div>
        <div style="font-weight: bold; margin-bottom: 5px;">None</div>
        <div style="color: var(--text-muted); font-size: 14px;">Disable all themes</div>
      </div>
    `;
    
    noneCard.addEventListener('click', () => {
      updateThemeConfig(null);
      document.querySelectorAll('#discord-integrated-theme-list > div').forEach(card => {
        card.style.borderLeft = 'none';
      });
      noneCard.style.borderLeft = '3px solid var(--brand-experiment)';
    });
    
    container.appendChild(noneCard);

    themes.forEach(file => {
      try {
        // Try to extract metadata from theme
        let meta = { name: file, description: '', version: '', author: '' };
        
        try {
          const content = fs.readFileSync(path.join(themeDir, file), 'utf-8');
          const nameMatch = content.match(/@name\s+(.+)/);
          const versionMatch = content.match(/@version\s+(.+)/);
          const descMatch = content.match(/@description\s+(.+)/);
          const authorMatch = content.match(/@author\s+(.+)/);
          
          if (nameMatch) meta.name = nameMatch[1].trim();
          if (versionMatch) meta.version = versionMatch[1].trim();
          if (descMatch) meta.description = descMatch[1].trim();
          if (authorMatch) meta.author = authorMatch[1].trim();
        } catch (e) {
          // If we can't read metadata, just use filename
        }
        
        const card = document.createElement('div');
        card.style.padding = '15px';
        card.style.marginBottom = '15px';
        card.style.backgroundColor = 'var(--background-secondary)';
        card.style.borderRadius = '5px';
        card.style.position = 'relative';
        card.style.cursor = 'pointer';
        
        if (activeThemeName === file) {
          card.style.borderLeft = '3px solid var(--brand-experiment)';
        }
        
        card.innerHTML = `
          <div>
            <div style="font-weight: bold; margin-bottom: 5px;">${meta.name}</div>
            <div style="color: var(--text-muted); font-size: 14px; margin-bottom: 5px;">${meta.description}</div>
            <div style="color: var(--text-muted); font-size: 12px;">v${meta.version} by ${meta.author}</div>
          </div>
        `;
        
        card.addEventListener('click', () => {
          updateThemeConfig(file);
          document.querySelectorAll('#discord-integrated-theme-list > div').forEach(c => {
            c.style.borderLeft = 'none';
          });
          card.style.borderLeft = '3px solid var(--brand-experiment)';
        });
        
        container.appendChild(card);
      } catch (e) {
        console.error(`[FlexCord] Error loading theme UI for ${file}:`, e);
      }
    });
  } catch (e) {
    console.error("[FlexCord] Error loading theme list:", e);
    container.innerHTML = '<div style="color: var(--text-danger); text-align: center; padding: 20px 0;">Error loading themes</div>';
  }
}

// Function to create settings section
function createSettingsSection() {
  const section = document.createElement('div');
  
  // About section
  const aboutDiv = document.createElement('div');
  aboutDiv.style.marginBottom = '20px';
  aboutDiv.innerHTML = `
    <h3 style="margin-bottom: 10px;">About FlexCord</h3>
    <p style="color: var(--text-muted); margin-bottom: 5px;">The ultimate plugin-based Discord mod.</p>
    <p style="color: var(--text-muted); margin-bottom: 15px;">Version: 1.0.0</p>
  `;
  
  section.appendChild(aboutDiv);
  
  // Uninstall button
  const uninstallBtn = document.createElement('button');
  uninstallBtn.textContent = 'Uninstall FlexCord';
  uninstallBtn.style.backgroundColor = 'var(--status-danger)';
  uninstallBtn.style.color = 'white';
  uninstallBtn.style.border = 'none';
  uninstallBtn.style.borderRadius = '3px';
  uninstallBtn.style.padding = '8px 16px';
  uninstallBtn.style.cursor = 'pointer';
  
  uninstallBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to uninstall FlexCord? This will restore Discord to its original state.")) {
      uninstallFlexCord();
    }
  });
  
  section.appendChild(uninstallBtn);
  
  return section;
}

// INIT
window.addEventListener("DOMContentLoaded", () => {
  initializeAPI();
  loadPlugins();
  loadThemes();
  createFlexCordPanel();
  createToggleButton();
  integrateWithDiscordSettings(); // Add Discord settings integration
});

console.log("[FlexCord] Injected successfully!");
} catch (e) {
  console.error('[FlexCord Injector] CRITICAL ERROR DURING INITIALIZATION:', e);
  // Optionally, display an alert to the user if in a browser context, though this might be too early
  // if (typeof window !== 'undefined' && typeof alert !== 'undefined') {
  //   alert('FlexCord failed to initialize. Please check the console for errors. Error: ' + e.message);
  // }
}
