# Getting Started with FlexCord

FlexCord is a plugin-based modification for Discord that allows you to enhance your Discord experience with custom plugins and themes.

## Installation

### Prerequisites

- Discord desktop application (not the browser version)
- Node.js v14 or higher

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/FlexCord.git
cd FlexCord
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run the Installer

```bash
node installer.js
```

This will:
1. Locate your Discord installation
2. Create a backup of Discord's original files
3. Inject the FlexCord loader into Discord
4. Repack Discord's application files

### Step 4: Restart Discord

After installation, restart your Discord client. You should see a ⚙️ gear icon in the bottom right corner of Discord, which means FlexCord has been successfully installed.

## Using FlexCord

### Accessing the FlexCord Panel

Click the ⚙️ gear icon in the bottom right corner of Discord to open the FlexCord panel.

### Managing Plugins

1. Go to the "Plugins" tab in the FlexCord panel
2. Toggle the checkbox next to a plugin to enable or disable it
3. Disabled plugins won't run until you enable them again

### Managing Themes

1. Go to the "Themes" tab in the FlexCord panel
2. Click on a theme to apply it
3. Click on "None" to remove all themes

### Settings

The "Settings" tab allows you to manage FlexCord itself. From here, you can:
- View information about FlexCord
- Uninstall FlexCord from your Discord client

## Uninstallation

If you want to uninstall FlexCord:

1. Open the FlexCord panel by clicking the ⚙️ gear icon
2. Go to the "Settings" tab
3. Click the "Uninstall FlexCord" button
4. Restart Discord when prompted

## Next Steps

Now that you have FlexCord installed, you might want to:

- [Create your first plugin](./plugin-development.md)
- [Create your first theme](./theme-development.md)
- [Explore the API Reference](./api-reference.md)
- [Check out example plugins](./examples/README.md) 
 