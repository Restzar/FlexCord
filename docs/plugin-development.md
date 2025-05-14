# Plugin Development Guide

This guide will walk you through creating plugins for FlexCord, from a basic "Hello World" plugin to more complex plugins that utilize the FlexCord API.

## Plugin Structure

FlexCord plugins are JavaScript files that export a module with specific lifecycle methods. Here's the basic structure of a FlexCord plugin:

```javascript
/**
 * @name MyPlugin
 * @version 1.0.0
 * @description What my plugin does
 * @author Your Name
 */

module.exports = {
  // Plugin metadata (required)
  meta: {
    name: "MyPlugin",
    version: "1.0.0",
    description: "What my plugin does",
    author: "Your Name"
  },
  
  // Called when the plugin is loaded (required)
  onLoad: function() {
    console.log("[MyPlugin] Loaded!");
  },
  
  // Called when the plugin is enabled (optional)
  onEnable: function() {
    // Your code here
    console.log("[MyPlugin] Enabled!");
  },
  
  // Called when the plugin is disabled (optional)
  onDisable: function() {
    // Cleanup code here
    console.log("[MyPlugin] Disabled!");
  }
};
```

## Creating Your First Plugin

Let's create a simple "Hello World" plugin that displays a notification when Discord starts.

### Step 1: Create a Plugin File

Create a new file in the `plugins` directory with the `.plugin.js` extension, e.g., `hello-world.plugin.js`.

### Step 2: Add the Plugin Code

```javascript
/**
 * @name HelloWorld
 * @version 1.0.0
 * @description A simple Hello World plugin for FlexCord
 * @author Your Name
 */

module.exports = {
  meta: {
    name: "Hello World",
    version: "1.0.0",
    description: "A simple Hello World plugin for FlexCord",
    author: "Your Name"
  },
  
  onLoad: function() {
    this.logger.log('Hello World plugin loaded!');
  },
  
  onEnable: function() {
    // Create a notification element
    const notification = document.createElement('div');
    notification.id = 'hello-world-notification';
    notification.style.position = 'fixed';
    notification.style.bottom = '70px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#43b581';
    notification.style.color = 'white';
    notification.style.padding = '10px 15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.fontFamily = 'Whitney, Helvetica Neue, Helvetica, Arial, sans-serif';
    notification.textContent = 'Hello from FlexCord!';
    
    // Add the notification to the page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    this.logger.log('Hello World plugin enabled!');
  },
  
  onDisable: function() {
    // Clean up when disabled
    const notification = document.getElementById('hello-world-notification');
    if (notification && notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    
    this.logger.log('Hello World plugin disabled!');
  }
};
```

### Step 3: Enable the Plugin

1. Start or restart Discord
2. Open the FlexCord panel by clicking the ⚙️ gear icon
3. Go to the "Plugins" tab
4. Find your "Hello World" plugin
5. Toggle the checkbox to enable it

## Plugin Lifecycle

FlexCord plugins have three main lifecycle methods:

1. **onLoad**: Called when the plugin is loaded by FlexCord. This happens when Discord starts or the plugin is installed. Use this for initialization.

2. **onEnable**: Called when the plugin is enabled by the user. This happens after loading, and whenever the user toggles the plugin on. Use this to start your plugin's functionality.

3. **onDisable**: Called when the plugin is disabled by the user. This happens when the user toggles the plugin off. Use this to clean up resources and stop functionality.

## Using the FlexCord API

FlexCord provides a powerful API that plugins can use to interact with Discord safely. The API is available via `this.api` inside your plugin.

### Logging

FlexCord provides a logger for plugins to use:

```javascript
// In your plugin methods
this.logger.log('Regular log message');
this.logger.info('Information message');
this.logger.warn('Warning message');
this.logger.error('Error message', errorObject);
```

### UI Utilities

```javascript
// Create a button
const button = this.api.ui.createButton({
  text: 'Click Me',
  id: 'my-button-id',
  color: '#5865F2',
  onClick: () => alert('Button clicked!')
});
document.body.appendChild(button);

// Create a modal dialog
const modal = this.api.ui.createModal({
  title: 'My Modal',
  content: 'This is a modal dialog',
  width: '400px',
  closeOnOutsideClick: true,
  buttons: [
    {
      text: 'Close',
      color: '#4f545c',
      onClick: () => document.body.removeChild(modal)
    },
    {
      text: 'Save',
      color: '#5865F2',
      onClick: () => {
        // Save action
        document.body.removeChild(modal);
      }
    }
  ]
});
document.body.appendChild(modal);

// Show a toast notification
this.api.ui.showToast({
  content: 'This is a toast notification',
  type: 'success' // 'success', 'info', 'warning', 'error'
});
```

### Data Storage

```javascript
// Save data
this.api.storage.saveData('my-plugin-id', {
  setting1: 'value1',
  setting2: true,
  setting3: 42
});

// Load data
const data = this.api.storage.loadData('my-plugin-id', {
  // Default values if no data exists
  setting1: 'default',
  setting2: false,
  setting3: 0
});

// Delete data
this.api.storage.deleteData('my-plugin-id');
```

### Discord Utilities

```javascript
// Get current user
const currentUser = this.api.discord.getCurrentUser();
console.log(`Logged in as: ${currentUser.username}`);

// Get user by ID
const user = this.api.discord.getUser('123456789012345678');

// Get channel by ID
const channel = this.api.discord.getChannel('123456789012345678');
```

### Messaging

```javascript
// Send a message
this.api.messages.sendMessage('123456789012345678', 'Hello from my plugin!');

// Send a message with options
this.api.messages.sendMessage('123456789012345678', {
  content: 'Hello from my plugin!',
  tts: false
});

// Edit a message
this.api.messages.editMessage('123456789012345678', '987654321098765432', 'Updated message');
```

### Events

```javascript
// Subscribe to an event
this.subscriptionId = this.api.events.subscribe('messageSend', (message) => {
  console.log(`Message sent: ${message.content}`);
});

// Unsubscribe from an event
this.api.events.unsubscribe('messageSend', this.subscriptionId);
```

## Best Practices

1. **Clean up after yourself**: Always remove any UI elements and event listeners in your `onDisable` method.

2. **Use the API**: Use the FlexCord API instead of directly manipulating Discord's internals. This makes your plugin more resistant to Discord updates.

3. **Handle errors gracefully**: Wrap code in try-catch blocks to prevent your plugin from crashing.

4. **Respect user settings**: Save and restore user settings when your plugin is disabled and enabled.

5. **Performance matters**: Be mindful of performance, especially for operations that run frequently.

## Examples

Check out these example plugins to learn more:

- [Hello Plugin](../plugins/hello.plugin.js) - A simple notification plugin
- [Message Logger](../plugins/example.plugin.js) - Logs messages to the console
- [API Demo](../plugins/api-demo.plugin.js) - Demonstrates the FlexCord API capabilities

## Further Reading

- [API Reference](./api-reference.md) - Complete reference for the FlexCord API
- [Examples](./examples/README.md) - More plugin examples