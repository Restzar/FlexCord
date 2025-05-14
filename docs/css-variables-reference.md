# Discord CSS Variables Reference

This document provides a reference of the CSS variables used by Discord that you can override in your FlexCord themes.

## Using CSS Variables

CSS variables can be overridden in your theme by setting them in the `:root` selector:

```css
:root {
  --background-primary: #1a1a1a;
  --background-secondary: #0f0f0f;
  --text-normal: #dcddde;
}
```

## Color Variables

### Background Colors

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `--background-primary` | `#36393f` | Main chat area background |
| `--background-secondary` | `#2f3136` | Sidebar background |
| `--background-secondary-alt` | `#292b2f` | Server settings sidebar |
| `--background-tertiary` | `#202225` | Server list background |
| `--background-accent` | `#4f545c` | Accent background color |
| `--background-floating` | `#18191c` | Floating elements background |
| `--background-mobile-primary` | `#36393f` | Mobile primary background |
| `--background-mobile-secondary` | `#2f3136` | Mobile secondary background |
| `--background-modifier-hover` | `rgba(79, 84, 92, 0.16)` | Background when hovering elements |
| `--background-modifier-active` | `rgba(79, 84, 92, 0.24)` | Background when clicking elements |
| `--background-modifier-selected` | `rgba(79, 84, 92, 0.32)` | Background for selected elements |
| `--background-modifier-accent` | `rgba(79, 84, 92, 0.48)` | Background accent for modals |

### Text Colors

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `--text-normal` | `#dcddde` | Primary text color |
| `--text-muted` | `#72767d` | Muted/secondary text |
| `--text-link` | `#00b0f4` | Link color |
| `--text-positive` | `#43b581` | Positive text color (success) |
| `--text-warning` | `#faa61a` | Warning text color |
| `--text-danger` | `#f04747` | Danger/error text color |
| `--interactive-normal` | `#b9bbbe` | Normal interactive text |
| `--interactive-hover` | `#dcddde` | Hovered interactive text |
| `--interactive-active` | `#ffffff` | Active interactive text |
| `--interactive-muted` | `#4f545c` | Muted interactive text |

### Brand Colors

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `--brand-experiment` | `#5865f2` | Discord brand color (blurple) |
| `--brand-experiment-560` | `#6d6af8` | Lighter brand color |
| `--brand-experiment-600` | `#5865f2` | Main brand color |

### Status Colors

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `--status-positive` | `#43b581` | Online status color |
| `--status-warning` | `#faa61a` | Idle status color |
| `--status-danger` | `#f04747` | Do not disturb status color |
| `--status-invisible` | `#747f8d` | Invisible/offline status color |

## UI Element Variables

### Spacing

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `--spacing-8` | `8px` | Small spacing |
| `--spacing-12` | `12px` | Medium spacing |
| `--spacing-16` | `16px` | Large spacing |
| `--spacing-24` | `24px` | Extra large spacing |

### Elevation/Shadows

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `--elevation-low` | `0 1px 0 rgba(4, 4, 5, 0.2)` | Low elevation shadow |
| `--elevation-medium` | `0 4px 4px rgba(0, 0, 0, 0.16)` | Medium elevation shadow |
| `--elevation-high` | `0 8px 16px rgba(0, 0, 0, 0.24)` | High elevation shadow |

### Channel List

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `--channeltextarea-background` | `#40444b` | Chat input background |
| `--channeltextarea-background-hover` | `#40444b` | Chat input hover background |
| `--channel-icon` | `#8e9297` | Channel icon color |
| `--channel-text-area-placeholder` | `#72767d` | Chat input placeholder color |

### Scrollbar

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `--scrollbar-auto-thumb` | `#202225` | Scrollbar thumb |
| `--scrollbar-auto-track` | `#2e3338` | Scrollbar track |
| `--scrollbar-thin-thumb` | `#202225` | Thin scrollbar thumb |
| `--scrollbar-thin-track` | `transparent` | Thin scrollbar track |

## Example Theme Using Variables

Here's an example of a theme that primarily uses CSS variables to customize Discord:

```css
/**
 * @name VariableTheme
 * @version 1.0.0
 * @description A theme that primarily uses CSS variables
 * @author Your Name
 */

:root {
  /* Main backgrounds */
  --background-primary: #1a1a1a;
  --background-secondary: #0f0f0f;
  --background-tertiary: #0a0a0a;
  --background-accent: #2f2f2f;
  --background-floating: #141414;
  
  /* Text colors */
  --text-normal: #dcddde;
  --text-muted: #a0a0a0;
  --text-link: #58a6ff;
  
  /* Interactive elements */
  --interactive-normal: #c8c8c8;
  --interactive-hover: #ffffff;
  --interactive-active: #ffffff;
  --interactive-muted: #6e6e6e;
  
  /* Brand colors */
  --brand-experiment: #5865f2;
  
  /* Status colors */
  --status-positive: #43b581;
  --status-warning: #faa61a;
  --status-danger: #f04747;
  
  /* Scrollbars */
  --scrollbar-auto-thumb: #3a3a3a;
  --scrollbar-auto-track: transparent;
  
  /* Other elements */
  --channeltextarea-background: #2c2c2c;
}

/* Additional custom styles */
.message-2qnXI6 {
  background-color: rgba(0, 0, 0, 0.3) !important;
  border-radius: 8px !important;
  margin: 8px 0 !important;
  padding: 8px !important;
}

/* Buttons with hover effect */
.button-1YfofN {
  background-color: var(--background-accent) !important;
  transition: background-color 0.2s ease !important;
}

.button-1YfofN:hover {
  background-color: var(--brand-experiment) !important;
}
```

## Best Practices

1. **Prioritize variables over direct selectors**: Using CSS variables makes your theme more resilient to Discord updates.

2. **Use browser DevTools**: Inspect Discord's UI to find element classes and existing variables.

3. **Test your theme thoroughly**: Make sure it looks good in different Discord contexts (channel list, server settings, direct messages, etc.).

4. **Layer your customizations**: Start with CSS variable overrides, then add specific customizations for elements that need more attention.

5. **Comment your variables**: Group variables by function and add comments to make your theme more maintainable. 