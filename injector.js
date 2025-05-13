const fs = require("fs");
const path = require("path");

const pluginDir = "C:/FlexCord/plugins";
const themeDir = "C:/FlexCord/themes";
const configPath = "C:/FlexCord/config/settings.json";

// Load plugins
function loadPlugins() {
  let enabledPlugins = [];
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    enabledPlugins = config.enabledPlugins || [];
  } catch (e) {
    console.error("[FlexCord] Failed to read settings.json:", e);
  }

  fs.readdirSync(pluginDir).forEach(file => {
    if (!enabledPlugins.includes(file)) return;

    try {
      require(path.join(pluginDir, file));
      console.log("[FlexCord] Loaded plugin:", file);
    } catch (e) {
      console.error("[FlexCord] Plugin error:", file, e);
    }
  });
}

// Load themes
function loadThemes() {
  fs.readdirSync(themeDir).forEach(file => {
    const css = fs.readFileSync(path.join(themeDir, file), "utf-8");
    const style = document.createElement("style");
    style.innerText = css;
    document.head.appendChild(style);
    console.log("[FlexCord] Loaded theme:", file);
  });
}

// Update settings.json
function updatePluginConfig(pluginName, enabled) {
  let config = { enabledPlugins: [] };

  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  } catch (e) {
    console.error("Couldn't load settings, using default.");
  }

  if (enabled && !config.enabledPlugins.includes(pluginName)) {
    config.enabledPlugins.push(pluginName);
  } else if (!enabled) {
    config.enabledPlugins = config.enabledPlugins.filter(p => p !== pluginName);
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`[FlexCord] Plugin "${pluginName}" ${enabled ? "enabled" : "disabled"}.`);
}

// Floating draggable FlexCord panel
function createFlexCordPanel() {
  const panel = document.createElement("div");
  panel.id = "flexcord-panel";
  panel.style.position = "fixed";
  panel.style.top = "60px";
  panel.style.right = "20px";
  panel.style.width = "300px";
  panel.style.height = "400px";
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

  panel.innerHTML = `
    <div id="drag-header" style="cursor: move; background: #292929; padding: 5px 10px; border-radius: 6px; margin: -10px -10px 10px -10px;">
      <h2 style="margin: 0; font-size: 18px;">⚙️ FlexCord</h2>
    </div>
    <div><strong>Plugins:</strong></div>
    <ul id="plugin-list" style="margin:0; padding-left:15px;"></ul>
    <button id="reload-btn" style="margin-top: 10px; padding: 5px;">🔄 Reload Plugins</button>
    <div style="margin-top:10px;"><strong>Themes:</strong></div>
    <ul id="theme-list" style="margin:0; padding-left:15px;"></ul>
  `;

  document.body.appendChild(panel);

  let enabledPlugins = [];
  try {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    enabledPlugins = config.enabledPlugins || [];
  } catch (e) {
    console.error("[FlexCord] Failed to read config:", e);
  }

  const plugins = fs.readdirSync(pluginDir);
  const themes = fs.readdirSync(themeDir);

  const pluginList = document.getElementById("plugin-list");
  const themeList = document.getElementById("theme-list");

  plugins.forEach(file => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    const label = document.createElement("span");
    label.textContent = file;

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.checked = enabledPlugins.includes(file);
    toggle.addEventListener("change", () => {
      updatePluginConfig(file, toggle.checked);
    });

    li.appendChild(label);
    li.appendChild(toggle);
    pluginList.appendChild(li);
  });

  themes.forEach(file => {
    const li = document.createElement("li");
    li.textContent = file;
    themeList.appendChild(li);
  });

  document.getElementById("reload-btn").addEventListener("click", () => {
    location.reload();
  });

  makeDraggable(panel, document.getElementById("drag-header"));
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
    if (panel) panel.style.display = panel.style.display === "none" ? "block" : "none";
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
  loadPlugins();
  loadThemes();
  createFlexCordPanel();
  createToggleButton();
});
