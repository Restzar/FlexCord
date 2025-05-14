# FlexCord API Reference

This document provides a comprehensive reference for the FlexCord API that's available to plugins.

## Accessing the API

Within your plugin, you can access the API via `this.api`:

```javascript
// In your plugin methods
const currentUser = this.api.discord.getCurrentUser();
this.api.ui.showToast({ content: 'Hello world!' });
```

A logger instance is also directly available via `this.logger`:

```javascript
this.logger.log('This is a log message');
```

## API Modules

The FlexCord API is organized into several modules:

- [Logger](#logger) - Logging utilities
- [UI](#ui) - User interface utilities
- [Storage](#storage) - Data persistence
- [Discord](#discord) - Discord-specific utilities
- [Messages](#messages) - Message utilities
- [Events](#events) - Event system

## Logger

The logger module provides methods to log messages with different severity levels.

### Methods

#### `log(message[, options])`

Logs a regular message to the console.

```javascript
this.logger.log('This is a regular log message');
```

#### `info(message[, options])`

Logs an info message to the console.

```javascript
this.logger.info('This is an information message');
```

#### `warn(message[, options])`

Logs a warning message to the console.

```javascript
this.logger.warn('This is a warning message');
```

#### `error(message[, error][, options])`

Logs an error message to the console.

```javascript
try {
  // Some code that might throw
} catch (e) {
  this.logger.error('An error occurred', e);
}
```

## UI

The UI module provides methods to create and manipulate user interface elements.

### Methods

#### `createButton(options)`

Creates a button element.

**Parameters:**
- `options` (Object):
  - `text` (String): Button text
  - `id` (String, optional): Button ID
  - `className` (String, optional): CSS class name
  - `color` (String, optional): Background color (default: '#5865F2')
  - `textColor` (String, optional): Text color (default: 'white')
  - `onClick` (Function, optional): Click event handler

**Returns:** HTMLElement

```javascript
const button = this.api.ui.createButton({
  text: 'Click Me',
  id: 'my-button',
  color: '#43b581',
  onClick: () => {
    alert('Button clicked!');
  }
});
document.body.appendChild(button);
```

#### `createModal(options)`

Creates a modal dialog.

**Parameters:**
- `options` (Object):
  - `title` (String, optional): Modal title
  - `content` (String|HTMLElement, optional): Modal content
  - `width` (String, optional): Modal width (default: '500px')
  - `height` (String, optional): Modal height (default: '80%')
  - `closeOnOutsideClick` (Boolean, optional): Whether to close when clicking outside
  - `buttons` (Array, optional): Array of button options
  - `onClose` (Function, optional): Called when modal is closed

**Returns:** HTMLElement

```javascript
const modal = this.api.ui.createModal({
  title: 'My Modal',
  content: 'This is a modal dialog',
  width: '400px',
  closeOnOutsideClick: true,
  buttons: [
    {
      text: 'Cancel',
      color: '#4f545c',
      onClick: () => document.body.removeChild(modal)
    },
    {
      text: 'OK',
      color: '#5865F2',
      onClick: () => {
        alert('OK clicked!');
        document.body.removeChild(modal);
      }
    }
  ]
});
document.body.appendChild(modal);
```

#### `showToast(options)`

Shows a toast notification.

**Parameters:**
- `options` (Object):
  - `content` (String): Notification text
  - `type` (String, optional): Type of notification ('success', 'info', 'warning', 'error')

```javascript
this.api.ui.showToast({
  content: 'This is a toast notification',
  type: 'success'
});
```

## Storage

The storage module provides methods to save and load plugin data.

### Methods

#### `saveData(pluginId, data)`

Saves data for a plugin.

**Parameters:**
- `pluginId` (String): Plugin identifier
- `data` (Object): Data to save

**Returns:** Boolean (success status)

```javascript
this.api.storage.saveData('my-plugin', {
  settings: {
    enabled: true,
    color: '#ff0000'
  }
});
```

#### `loadData(pluginId[, defaultData])`

Loads data for a plugin.

**Parameters:**
- `pluginId` (String): Plugin identifier
- `defaultData` (Object, optional): Default data if none exists

**Returns:** Object

```javascript
const data = this.api.storage.loadData('my-plugin', {
  settings: {
    enabled: false,
    color: '#000000'
  }
});
```

#### `deleteData(pluginId)`

Deletes data for a plugin.

**Parameters:**
- `pluginId` (String): Plugin identifier

**Returns:** Boolean (success status)

```javascript
this.api.storage.deleteData('my-plugin');
```

## Discord

The Discord module provides utilities to interact with Discord's data.

### Methods

#### `getCurrentUser()`

Gets the current user.

**Returns:** Object|null

```javascript
const currentUser = this.api.discord.getCurrentUser();
console.log(`Logged in as ${currentUser.username}`);
```

#### `getUser(userId)`

Gets a user by ID.

**Parameters:**
- `userId` (String): User ID

**Returns:** Object|null

```javascript
const user = this.api.discord.getUser('123456789012345678');
if (user) {
  console.log(`Found user: ${user.username}`);
}
```

#### `getChannel(channelId)`

Gets a channel by ID.

**Parameters:**
- `channelId` (String): Channel ID

**Returns:** Object|null

```javascript
const channel = this.api.discord.getChannel('123456789012345678');
if (channel) {
  console.log(`Found channel: ${channel.name}`);
}
```

## Messages

The messages module provides utilities to interact with Discord messages.

### Methods

#### `sendMessage(channelId, messageData)`

Sends a message to a channel.

**Parameters:**
- `channelId` (String): Channel ID
- `messageData` (String|Object): Message content or data object

**Returns:** Promise<Object>

```javascript
// Simple message
this.api.messages.sendMessage('123456789012345678', 'Hello world!');

// Message with options
this.api.messages.sendMessage('123456789012345678', {
  content: 'Hello world!',
  tts: false
});
```

#### `editMessage(channelId, messageId, messageData)`

Edits a message.

**Parameters:**
- `channelId` (String): Channel ID
- `messageId` (String): Message ID
- `messageData` (String|Object): New message content or data object

**Returns:** Promise<Object>

```javascript
// Edit with simple content
this.api.messages.editMessage('123456789012345678', '987654321098765432', 'Updated message');

// Edit with options
this.api.messages.editMessage('123456789012345678', '987654321098765432', {
  content: 'Updated message',
  tts: false
});
```

## Events

The events module provides an event system for plugins to subscribe to and emit events.

### Methods

#### `subscribe(event, callback)`

Subscribes to an event.

**Parameters:**
- `event` (String): Event name
- `callback` (Function): Event callback

**Returns:** String (subscription ID)

```javascript
this.subscriptionId = this.api.events.subscribe('messageSend', (message) => {
  console.log(`Message sent: ${message.content}`);
});
```

#### `unsubscribe(event, subscriptionId)`

Unsubscribes from an event.

**Parameters:**
- `event` (String): Event name
- `subscriptionId` (String): Subscription ID

**Returns:** Boolean (success status)

```javascript
this.api.events.unsubscribe('messageSend', this.subscriptionId);
```

## Available Events

Here are the events you can subscribe to:

### `messageSend`

Triggered when a message is sent.

**Callback parameters:**
- `message` (Object):
  - `content` (String): Message content
  - `channelId` (String): Channel ID

```javascript
this.api.events.subscribe('messageSend', (message) => {
  console.log(`Message sent to channel ${message.channelId}: ${message.content}`);
});
```

### `pluginLoaded`

Triggered when a plugin is loaded.

**Callback parameters:**
- `info` (Object):
  - `id` (String): Plugin ID
  - `name` (String): Plugin name
  - `plugin` (Object): Plugin instance

```javascript
this.api.events.subscribe('pluginLoaded', (info) => {
  console.log(`Plugin loaded: ${info.name}`);
});
```

## API Version

You can check the API version using:

```javascript
console.log(`FlexCord API version: ${this.api.version}`);
```

The current API version is `1.0.0`.

## Examples

Check out the [API Demo Plugin](../plugins/api-demo.plugin.js) for a comprehensive example of using the FlexCord API. 