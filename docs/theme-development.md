# Theme Development Guide

This guide will help you create custom themes for FlexCord to personalize your Discord experience.

## Theme Structure

FlexCord themes are CSS files with a `.theme.css` extension. They follow a specific structure that includes metadata in comments at the top of the file, followed by CSS styling rules.

Here's the basic structure of a FlexCord theme:

```css
/**
 * @name MyTheme
 * @version 1.0.0
 * @description A description of my theme
 * @author Your Name
 */

/* Your CSS rules here */
.app-2rEoOp {
  background-color: #1a1a1a !important;
}
```

## Creating Your First Theme

Let's create a simple dark theme for Discord.

### Step 1: Create a Theme File

Create a new file in the `themes` directory with the `.theme.css` extension, e.g., `my-dark-theme.theme.css`.

### Step 2: Add the Theme Metadata

At the top of your file, add the theme metadata:

```css
/**
 * @name MyDarkTheme
 * @version 1.0.0
 * @description A custom dark theme for Discord
 * @author Your Name
 */
```

### Step 3: Add CSS Rules

Below the metadata, add your CSS rules to style Discord. Here's a simple dark theme example:

```css
/* Main background darkening */
.app-2rEoOp {
  background-color: #1a1a1a !important;
}

/* Sidebar background */
.sidebar-2K8pFh {
  background-color: #0f0f0f !important;
}

/* Chat background */
.chat-3bRxxu {
  background-color: #1e1e1e !important;
}

/* Message blocks */
.message-2qnXI6 {
  background-color: rgba(0, 0, 0, 0.3) !important;
  border-radius: 8px !important;
  margin: 8px 0 !important;
  padding: 8px !important;
}

/* Channel list */
.channel-2QD9_O {
  background-color: #121212 !important;
  border-radius: 6px !important;
  margin: 2px 0 !important;
}

/* Server list */
.guilds-1SWlCJ {
  background-color: #0a0a0a !important;
}

/* Accent color */
:root {
  --brand-color: #5865f2;
  --brand-color-hover: #4752c4;
}

/* Make links and highlights use the accent color */
.link-1IoFq-, .wrapper-3WhCwL {
  color: var(--brand-color) !important;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px !important;
}

::-webkit-scrollbar-track {
  background-color: transparent !important;
}

::-webkit-scrollbar-thumb {
  background-color: #3a3a3a !important;
  border-radius: 4px !important;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #4a4a4a !important;
}
```

### Step 4: Apply the Theme

1. Start or restart Discord
2. Open the FlexCord panel by clicking the ⚙️ gear icon
3. Go to the "Themes" tab
4. Click on your theme to apply it

## Finding Discord Class Names

Discord's class names are dynamically generated and can change with updates. To find the correct class names for styling:

1. **Use Discord's Developer Tools**:
   - Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to open DevTools
   - Click the element selector tool (top-left corner of DevTools)
   - Click on the Discord element you want to style
   - Note the class names in the Elements panel

2. **Use Discord's CSS Variables**:
   Discord uses CSS variables for many styles. You can override these in your theme:

   ```css
   :root {
     --background-primary: #1a1a1a;
     --background-secondary: #0f0f0f;
     --background-tertiary: #0a0a0a;
     --text-normal: #dcddde;
     --text-muted: #72767d;
   }
   ```

## Best Practices

1. **Use `!important` sparingly**: Only use `!important` when necessary to override Discord's styles.

2. **Comment your CSS**: Add comments to explain what each section of your theme does.

3. **Test thoroughly**: Test your theme with different Discord layouts and features.

4. **Use variables**: Use CSS variables to make your theme easier to customize.

5. **Keep it simple**: Start with a few changes and gradually expand your theme.

## Common Styling Elements

Here are some common Discord elements you might want to style:

### General UI

```css
/* Main app background */
.app-2rEoOp {
  background-color: #1a1a1a !important;
}

/* Main content area */
.content-1SgpWY {
  background-color: #1e1e1e !important;
}

/* Sidebar */
.sidebar-2K8pFh {
  background-color: #0f0f0f !important;
}
```

### Messages

```css
/* Message container */
.message-2qnXI6 {
  background-color: rgba(0, 0, 0, 0.3) !important;
  border-radius: 8px !important;
  margin: 8px 0 !important;
  padding: 8px !important;
}

/* Message username */
.username-h_Y3Us {
  color: #ffffff !important;
}

/* Message text */
.markup-eYLPri {
  color: #dcddde !important;
}

/* Code blocks */
.markup-eYLPri code {
  background-color: #2f3136 !important;
  border: 1px solid #202225 !important;
}
```

### Inputs and Buttons

```css
/* Text input */
.input-2g-os5 {
  background-color: #2f3136 !important;
  border: 1px solid #202225 !important;
  color: #dcddde !important;
}

/* Button */
.button-1YfofN {
  background-color: #5865f2 !important;
  color: white !important;
}

/* Button hover */
.button-1YfofN:hover {
  background-color: #4752c4 !important;
}
```

## Examples

Check out these example themes to learn more:

- [Dark Theme](../themes/dark.theme.css) - A clean dark theme for Discord

## Further Reading

- [CSS Variables Reference](./css-variables-reference.md) - List of CSS variables used by Discord
- [Examples](./examples/README.md) - More theme examples 