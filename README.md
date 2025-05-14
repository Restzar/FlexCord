# FlexCord

The ultimate plugin-based Discord modification. FlexCord enhances your Discord experience by allowing you to customize the client with plugins and themes.

## Features

- 🧩 **Plugin System**: Load and manage custom plugins to add new features to Discord
- 🎨 **Theme Engine**: Apply custom CSS themes to completely change Discord's appearance
- ⚙️ **Easy Management**: Simple UI panel to enable/disable plugins and switch themes
- 🔄 **Hot-Reload**: Apply changes without restarting Discord
- 🔌 **Powerful API**: Comprehensive API for plugin developers

## Installation

1. **Clone the repository**:
   ```
   git clone https://github.com/yourusername/FlexCord.git
   cd FlexCord
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the installer**:
   ```
   node installer.js
   ```

4. **Restart Discord** to apply changes.

## Usage

1. Once installed, FlexCord adds a ⚙️ button to the bottom right of your Discord window.
2. Click it to open the FlexCord panel.
3. Use the tabs to manage plugins and themes.

## Plugin Development

Plugins should be placed in the `plugins` directory with the `.plugin.js` extension.

### Basic Plugin Structure

```javascript
/**
 * @name MyPlugin
 * @version 1.0.0
 * @description What my plugin does
 * @author Your Name
 */

module.exports = {
  meta: {
    name: "MyPlugin",
    version: "1.0.0",
    description: "What my plugin does",
    author: "Your Name"
  },
  
  // Called when the plugin is loaded
  onLoad: function() {
    console.log("[MyPlugin] Loaded!");
  },
  
  // Called when the plugin is enabled
  onEnable: function() {
    // Your code here
    console.log("[MyPlugin] Enabled!");
  },
  
  // Called when the plugin is disabled
  onDisable: function() {
    // Cleanup code here
    console.log("[MyPlugin] Disabled!");
  }
};
```

### Using the FlexCord API

FlexCord provides a powerful API for plugins to interact with Discord safely. The API is available as `this.api` in your plugin.

```javascript
// Log messages with the plugin logger
this.logger.log('This is a log message');
this.logger.info('Information message');
this.logger.warn('Warning message');
this.logger.error('Error message', errorObject);

// UI utilities
const button = this.api.ui.createButton({
  text: 'Click Me',
  onClick: () => alert('Button clicked!')
});
document.body.appendChild(button);

// Show a toast notification
this.api.ui.showToast({
  content: 'This is a toast notification',
  type: 'success' // 'success', 'info', 'warning', 'error'
});

// Store and retrieve plugin data
this.api.storage.saveData('my-plugin-id', { setting: 'value' });
const data = this.api.storage.loadData('my-plugin-id', { defaultSetting: 'defaultValue' });

// Subscribe to events
const subscriptionId = this.api.events.subscribe('messageSend', (message) => {
  console.log('Message sent:', message.content);
});

// Unsubscribe from events
this.api.events.unsubscribe('messageSend', subscriptionId);

// Get Discord user information
const currentUser = this.api.discord.getCurrentUser();
const user = this.api.discord.getUser('userId');

// Send messages
this.api.messages.sendMessage('channelId', 'Hello world!');
```

Check out the `plugins/api-demo.plugin.js` file for a complete example of using the API.

## Theme Development

Themes should be placed in the `themes` directory with the `.theme.css` extension.

### Basic Theme Structure

```css
/**
 * @name MyTheme
 * @version 1.0.0
 * @description A cool theme for Discord
 * @author Your Name
 */

/* Your CSS here */
.app-2rEoOp {
  background-color: #1a1a1a !important;
}
```

## Uninstallation

To uninstall FlexCord:

1. Open the FlexCord panel by clicking the ⚙️ button
2. Go to the Settings tab
3. Click the "Uninstall FlexCord" button
4. Restart Discord

## Security and Privacy

FlexCord runs with the same permissions as Discord itself. Be cautious when installing third-party plugins as they can access your Discord client data.

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 