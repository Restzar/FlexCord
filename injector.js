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
  try {
    fs.readdirSync(pluginDir).forEach(file => {
      if (!file.endsWith('.plugin.js')) return;
      
      const pluginPath = path.join(pluginDir, file);
      let plugin;
      let pluginLogger;

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
  try {
    // Get active theme from config
    let activeThemeName = null;
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
  try {
    // Read current config
    let config = { enabledPlugins: [] };
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
      pluginList.innerHTML = '<div style="color: #aaa; text-align: center; padding: 20px 0;">No plugins found</div>';
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

// INIT
window.addEventListener("DOMContentLoaded", () => {
  initializeAPI();
  loadPlugins();
  loadThemes();
  createFlexCordPanel();
  createToggleButton();
});
