/**
 * @name APIDemo
 * @version 1.0.0
 * @description Demonstrates the FlexCord API capabilities
 * @author FlexCord Team
 */

module.exports = {
  meta: {
    name: "API Demo",
    version: "1.0.0",
    description: "Demonstrates the FlexCord API capabilities",
    author: "FlexCord Team"
  },
  
  // Settings
  settings: {
    enabled: true,
    showButton: true,
    messagePrefix: "[API Demo]",
    useToasts: true
  },
  
  // Called when the plugin is loaded
  onLoad: function() {
    // Load saved settings
    const savedSettings = this.api.storage.loadData('api-demo', this.settings);
    this.settings = { ...this.settings, ...savedSettings };
    
    this.logger.log('Plugin loaded successfully!');
  },
  
  // Called when the plugin is enabled
  onEnable: function() {
    this.logger.log('Plugin enabled');
    
    // Register event handlers
    this.messageSendHandler = this.onMessageSend.bind(this);
    this.subscriptionId = this.api.events.subscribe('messageSend', this.messageSendHandler);
    
    // Create UI elements when Discord is ready
    setTimeout(this.setupUI.bind(this), 3000);
  },
  
  // Called when the plugin is disabled
  onDisable: function() {
    // Unregister event handlers
    this.api.events.unsubscribe('messageSend', this.subscriptionId);
    
    // Remove UI elements
    const button = document.getElementById('flexcord-apidemo-button');
    if (button) button.remove();
    
    this.logger.log('Plugin disabled');
  },
  
  // Set up UI elements
  setupUI: function() {
    // Only add the button if enabled in settings
    if (!this.settings.showButton) return;
    
    // Create a button in the Discord UI
    const button = this.api.ui.createButton({
      text: 'API Demo',
      id: 'flexcord-apidemo-button',
      color: '#5865F2',
      onClick: this.openDemoPanel.bind(this)
    });
    
    // Style and position the button
    button.style.position = 'fixed';
    button.style.bottom = '70px';
    button.style.right = '20px';
    button.style.zIndex = '9999';
    
    // Add to DOM
    document.body.appendChild(button);
  },
  
  // Open the demo panel
  openDemoPanel: function() {
    // Create settings form
    const form = document.createElement('div');
    
    // Add setting for message prefix
    const prefixContainer = document.createElement('div');
    prefixContainer.style.marginBottom = '15px';
    
    const prefixLabel = document.createElement('label');
    prefixLabel.textContent = 'Message Prefix:';
    prefixLabel.style.display = 'block';
    prefixLabel.style.marginBottom = '5px';
    prefixContainer.appendChild(prefixLabel);
    
    const prefixInput = document.createElement('input');
    prefixInput.type = 'text';
    prefixInput.value = this.settings.messagePrefix;
    prefixInput.style.width = '100%';
    prefixInput.style.padding = '8px';
    prefixInput.style.backgroundColor = '#2f3136';
    prefixInput.style.border = '1px solid #202225';
    prefixInput.style.color = '#dcddde';
    prefixInput.style.borderRadius = '3px';
    prefixContainer.appendChild(prefixInput);
    
    form.appendChild(prefixContainer);
    
    // Add toggle for toast notifications
    const toastContainer = document.createElement('div');
    toastContainer.style.marginBottom = '15px';
    
    const toastCheck = document.createElement('input');
    toastCheck.type = 'checkbox';
    toastCheck.id = 'apidemo-toast-toggle';
    toastCheck.checked = this.settings.useToasts;
    toastCheck.style.marginRight = '8px';
    toastContainer.appendChild(toastCheck);
    
    const toastLabel = document.createElement('label');
    toastLabel.textContent = 'Show toast notifications';
    toastLabel.htmlFor = 'apidemo-toast-toggle';
    toastContainer.appendChild(toastLabel);
    
    form.appendChild(toastContainer);
    
    // Create and show modal with the settings
    const modal = this.api.ui.createModal({
      title: 'API Demo Settings',
      content: form,
      width: '400px',
      closeOnOutsideClick: true,
      buttons: [
        {
          text: 'Cancel',
          color: '#4f545c',
          onClick: () => {
            document.body.removeChild(modal);
          }
        },
        {
          text: 'Save',
          color: '#5865F2',
          onClick: () => {
            // Save settings
            this.settings.messagePrefix = prefixInput.value;
            this.settings.useToasts = toastCheck.checked;
            
            // Show confirmation
            if (this.settings.useToasts) {
              this.api.ui.showToast({
                content: 'Settings saved!',
                type: 'success'
              });
            }
            
            // Persist settings
            this.api.storage.saveData('api-demo', this.settings);
            
            // Close modal
            document.body.removeChild(modal);
          }
        },
        {
          text: 'Test API',
          color: '#43b581',
          onClick: () => {
            this.showAPIDemo();
          }
        }
      ]
    });
    
    document.body.appendChild(modal);
  },
  
  // Show API demo
  showAPIDemo: function() {
    // Get current user info
    const currentUser = this.api.discord.getCurrentUser();
    
    // Create content for the API demo modal
    const demoContent = document.createElement('div');
    
    // User info section
    const userInfo = document.createElement('div');
    userInfo.style.marginBottom = '20px';
    userInfo.innerHTML = `
      <h3 style="margin-top:0">Current User</h3>
      <div>Username: ${currentUser?.username || 'Unknown'}</div>
      <div>User ID: ${currentUser?.id || 'Unknown'}</div>
    `;
    demoContent.appendChild(userInfo);
    
    // Feature demo buttons
    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.flexDirection = 'column';
    buttons.style.gap = '10px';
    
    // Toast notification demo
    const toastBtn = this.api.ui.createButton({
      text: 'Show Toast Notification',
      onClick: () => {
        this.api.ui.showToast({
          content: 'This is a sample toast notification!',
          type: 'info'
        });
      }
    });
    buttons.appendChild(toastBtn);
    
    // Storage demo
    const storageBtn = this.api.ui.createButton({
      text: 'Log Stored Settings',
      onClick: () => {
        const data = this.api.storage.loadData('api-demo', {});
        this.logger.log('Current settings:', data);
        this.api.ui.showToast({
          content: 'Settings logged to console',
          type: 'info'
        });
      }
    });
    buttons.appendChild(storageBtn);
    
    demoContent.appendChild(buttons);
    
    // Show the demo in a modal
    const modal = this.api.ui.createModal({
      title: 'FlexCord API Features',
      content: demoContent,
      closeOnOutsideClick: true,
      buttons: [
        {
          text: 'Close',
          color: '#4f545c',
          onClick: () => {
            document.body.removeChild(modal);
          }
        }
      ]
    });
    
    document.body.appendChild(modal);
  },
  
  // Handle message send event
  onMessageSend: function(message) {
    // Log messages being sent
    this.logger.log('Message sent:', message.content);
    
    // Show toast notification if enabled
    if (this.settings.useToasts) {
      this.api.ui.showToast({
        content: `Message sent to channel ${message.channelId}`,
        type: 'info'
      });
    }
  }
}; 