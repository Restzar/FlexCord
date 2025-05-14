# FlexCord Examples

This directory contains example plugins and code snippets that demonstrate how to use FlexCord's features.

## Plugin Examples

### [Hello Plugin](../../plugins/hello.plugin.js)

A simple plugin that displays a notification when Discord starts. This plugin demonstrates:
- Basic plugin structure
- Creating and removing UI elements
- Using lifecycle methods (onLoad, onEnable, onDisable)

### [Message Logger](../../plugins/example.plugin.js)

A plugin that logs messages to the console when sent. This plugin demonstrates:
- Intercepting Discord API calls
- Storing and restoring original functions
- Proper cleanup

### [API Demo](../../plugins/api-demo.plugin.js)

A comprehensive plugin that demonstrates most of the FlexCord API capabilities. This plugin demonstrates:
- Using the UI module to create buttons, modals, and toast notifications
- Data storage and retrieval
- Event subscription
- Using Discord utilities
- User settings management

## Code Snippets

### UI Elements

#### Button Creation

```javascript
const button = this.api.ui.createButton({
  text: 'Click Me',
  id: 'my-button',
  color: '#43b581',
  onClick: () => alert('Button clicked!')
});
document.body.appendChild(button);
```

#### Modal Dialog

```javascript
const modal = this.api.ui.createModal({
  title: 'Sample Modal',
  content: 'This is a sample modal dialog',
  width: '400px',
  closeOnOutsideClick: true,
  buttons: [
    {
      text: 'Close',
      color: '#4f545c',
      onClick: () => document.body.removeChild(modal)
    }
  ]
});
document.body.appendChild(modal);
```

#### Toast Notification

```javascript
this.api.ui.showToast({
  content: 'Operation completed successfully',
  type: 'success' // 'success', 'info', 'warning', 'error'
});
```

### Settings Form

```javascript
// Create a settings form
const form = document.createElement('div');

// Add a text input
const inputContainer = document.createElement('div');
inputContainer.style.marginBottom = '15px';

const inputLabel = document.createElement('label');
inputLabel.textContent = 'Setting:';
inputLabel.style.display = 'block';
inputLabel.style.marginBottom = '5px';
inputContainer.appendChild(inputLabel);

const input = document.createElement('input');
input.type = 'text';
input.value = 'Default value';
input.style.width = '100%';
input.style.padding = '8px';
input.style.backgroundColor = '#2f3136';
input.style.border = '1px solid #202225';
input.style.color = '#dcddde';
input.style.borderRadius = '3px';
inputContainer.appendChild(input);

form.appendChild(inputContainer);

// Add a checkbox
const checkContainer = document.createElement('div');
checkContainer.style.marginBottom = '15px';

const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.id = 'my-checkbox';
checkbox.checked = true;
checkbox.style.marginRight = '8px';
checkContainer.appendChild(checkbox);

const checkLabel = document.createElement('label');
checkLabel.textContent = 'Enable feature';
checkLabel.htmlFor = 'my-checkbox';
checkContainer.appendChild(checkLabel);

form.appendChild(checkContainer);

// Show in a modal
const modal = this.api.ui.createModal({
  title: 'Settings',
  content: form,
  buttons: [
    {
      text: 'Save',
      color: '#5865F2',
      onClick: () => {
        const settings = {
          textValue: input.value,
          enabled: checkbox.checked
        };
        this.api.storage.saveData('my-plugin', settings);
        document.body.removeChild(modal);
      }
    }
  ]
});
document.body.appendChild(modal);
```

### Event Handling

```javascript
// Subscribe to message send events
this.messageHandler = (message) => {
  console.log(`Message sent: ${message.content}`);
};
this.subscriptionId = this.api.events.subscribe('messageSend', this.messageHandler);

// Later, unsubscribe when done
this.api.events.unsubscribe('messageSend', this.subscriptionId);
```

## Theme Examples

### [Dark Theme](../../themes/dark.theme.css)

A clean dark theme for Discord. This theme demonstrates:
- Theme metadata structure
- CSS organization
- Using CSS variables
- Styling different Discord components 

### [Pastel Cute Theme](../../themes/pastel-cute.theme.css)

A minimal and aesthetic cute theme with pastel colors and rounded elements. This theme demonstrates:
- Creating a cohesive design system with pastel colors
- Adding subtle animations and hover effects
- Rounded corners and soft shadows for a cute appearance
- Using CSS variables for easy customization
- Adding decorative elements like stars to headers

## Aesthetic Plugin Examples

### [Message Bubbles](../../plugins/message-bubbles.plugin.js)

A plugin that transforms Discord messages into cute chat bubbles with customizable colors. This plugin demonstrates:
- Custom styling for messages
- Different styles for your messages vs others' messages
- User settings with color pickers and sliders
- Adding decorative emoji to messages
- Using MutationObserver to process new messages

### [Font Changer](../../plugins/font-changer.plugin.js)

A plugin that changes Discord's fonts to cute rounded alternatives. This plugin demonstrates:
- Loading external web fonts
- Applying styles to text elements
- Creating a settings panel with live preview
- Font customization (family, size, weight)
- Saving and restoring user preferences

### [Cute Cursor](../../plugins/cute-cursor.plugin.js)

A plugin that changes the cursor to adorable themed shapes like hearts, stars, and other cute options. This plugin demonstrates:
- Custom cursor implementation with SVG icons
- Interactive cursor selection interface
- Cursor trail effects with fading
- Visual settings panel with previews
- CSS manipulation and dynamic styling 