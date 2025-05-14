/**
 * @name MessageBubbles
 * @version 1.0.0
 * @description Makes Discord messages appear as cute rounded bubbles with customizable colors
 * @author FlexCord Team
 */

module.exports = {
  meta: {
    name: "Message Bubbles",
    version: "1.0.0",
    description: "Makes Discord messages appear as cute rounded bubbles with customizable colors",
    author: "FlexCord Team"
  },
  
  settings: {
    bubbleRadius: 18,
    selfMessageColor: "#E6E6FA", // Pastel lavender
    otherMessageColor: "white",
    animationEnabled: true,
    addEmoji: true,
    customEmoji: "♡",
  },
  
  css: null,
  observer: null,
  styleElement: null,
  
  onLoad: function() {
    this.logger.log('Message Bubbles plugin loaded!');
    
    // Load saved settings if they exist
    const savedSettings = this.api.storage.loadData('message-bubbles');
    if (savedSettings) {
      this.settings = Object.assign(this.settings, savedSettings);
    }
  },
  
  onEnable: function() {
    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    
    this.updateCSS();
    
    // Set up mutation observer to apply styles to new messages
    this.observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (mutation.addedNodes.length) {
          this.processMessages();
        }
      }
    });
    
    // Start observing
    const chatContainer = document.querySelector('.chat-3bRxxu');
    if (chatContainer) {
      this.observer.observe(chatContainer, { childList: true, subtree: true });
    }
    
    // Process existing messages
    this.processMessages();
    
    // Add settings button
    this.addSettingsButton();
    
    this.logger.log('Message Bubbles plugin enabled!');
  },
  
  onDisable: function() {
    // Remove our styles
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
    
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Remove our settings button
    const settingsButton = document.getElementById('message-bubbles-settings-button');
    if (settingsButton && settingsButton.parentNode) {
      settingsButton.parentNode.removeChild(settingsButton);
    }
    
    // Reset any modified classes
    document.querySelectorAll('.message-bubble-left, .message-bubble-right').forEach(element => {
      element.classList.remove('message-bubble-left', 'message-bubble-right');
      element.style = '';
    });
    
    this.logger.log('Message Bubbles plugin disabled!');
  },
  
  updateCSS: function() {
    const css = `
      .message-bubble-left {
        background-color: ${this.settings.otherMessageColor} !important;
        border-radius: ${this.settings.bubbleRadius}px !important;
        border-top-left-radius: 4px !important;
        margin: 8px 40px 8px 0 !important;
        padding: 10px 15px !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03) !important;
        position: relative;
      }
      
      .message-bubble-right {
        background-color: ${this.settings.selfMessageColor} !important;
        border-radius: ${this.settings.bubbleRadius}px !important;
        border-top-right-radius: 4px !important;
        margin: 8px 0 8px 40px !important;
        padding: 10px 15px !important;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03) !important;
        position: relative;
        align-self: flex-end;
      }
      
      ${this.settings.addEmoji ? `
      .message-bubble-left::after {
        content: "${this.settings.customEmoji}";
        position: absolute;
        bottom: -3px;
        right: 5px;
        font-size: 12px;
        opacity: 0.5;
      }
      
      .message-bubble-right::after {
        content: "${this.settings.customEmoji}";
        position: absolute;
        bottom: -3px;
        left: 5px;
        font-size: 12px;
        opacity: 0.5;
      }
      ` : ''}
      
      ${this.settings.animationEnabled ? `
      .message-bubble-left:hover, .message-bubble-right:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05) !important;
        transition: all 0.2s ease !important;
      }
      ` : ''}
    `;
    
    this.styleElement.textContent = css;
  },
  
  processMessages: function() {
    // Get current user ID
    const currentUserId = this.api.discord.getCurrentUser()?.id;
    if (!currentUserId) return;
    
    // Find all messages
    document.querySelectorAll('.message-2qnXI6').forEach(message => {
      // Skip if already processed
      if (message.classList.contains('message-bubble-left') || 
          message.classList.contains('message-bubble-right')) {
        return;
      }
      
      // Check if this is the current user's message
      const authorId = message.getAttribute('data-author-id');
      if (authorId === currentUserId) {
        message.classList.add('message-bubble-right');
      } else {
        message.classList.add('message-bubble-left');
      }
    });
  },
  
  addSettingsButton: function() {
    // Create settings button
    const button = this.api.ui.createButton({
      text: '🎨 Bubble Settings',
      id: 'message-bubbles-settings-button',
      color: '#FFD1DC',
      onClick: () => this.showSettingsModal()
    });
    
    // Find a good place to add it
    const toolbarContainer = document.querySelector('.toolbar-3_r2xA');
    if (toolbarContainer) {
      toolbarContainer.appendChild(button);
    }
  },
  
  showSettingsModal: function() {
    // Create form elements
    const form = document.createElement('div');
    form.style.padding = '10px';
    form.style.color = '#4F5660';
    
    // Bubble radius
    const radiusContainer = document.createElement('div');
    radiusContainer.style.marginBottom = '15px';
    
    const radiusLabel = document.createElement('label');
    radiusLabel.textContent = 'Bubble Radius:';
    radiusLabel.style.display = 'block';
    radiusLabel.style.marginBottom = '5px';
    radiusContainer.appendChild(radiusLabel);
    
    const radiusInput = document.createElement('input');
    radiusInput.type = 'range';
    radiusInput.min = '5';
    radiusInput.max = '30';
    radiusInput.value = this.settings.bubbleRadius;
    radiusInput.style.width = '100%';
    radiusContainer.appendChild(radiusInput);
    
    // Your message color
    const selfColorContainer = document.createElement('div');
    selfColorContainer.style.marginBottom = '15px';
    
    const selfColorLabel = document.createElement('label');
    selfColorLabel.textContent = 'Your Message Color:';
    selfColorLabel.style.display = 'block';
    selfColorLabel.style.marginBottom = '5px';
    selfColorContainer.appendChild(selfColorLabel);
    
    const selfColorInput = document.createElement('input');
    selfColorInput.type = 'color';
    selfColorInput.value = this.settings.selfMessageColor;
    selfColorInput.style.width = '100%';
    selfColorContainer.appendChild(selfColorInput);
    
    // Others' message color
    const otherColorContainer = document.createElement('div');
    otherColorContainer.style.marginBottom = '15px';
    
    const otherColorLabel = document.createElement('label');
    otherColorLabel.textContent = 'Others\' Message Color:';
    otherColorLabel.style.display = 'block';
    otherColorLabel.style.marginBottom = '5px';
    otherColorContainer.appendChild(otherColorLabel);
    
    const otherColorInput = document.createElement('input');
    otherColorInput.type = 'color';
    otherColorInput.value = this.settings.otherMessageColor;
    otherColorInput.style.width = '100%';
    otherColorContainer.appendChild(otherColorInput);
    
    // Animation toggle
    const animContainer = document.createElement('div');
    animContainer.style.marginBottom = '15px';
    
    const animCheckbox = document.createElement('input');
    animCheckbox.type = 'checkbox';
    animCheckbox.id = 'anim-checkbox';
    animCheckbox.checked = this.settings.animationEnabled;
    animCheckbox.style.marginRight = '8px';
    animContainer.appendChild(animCheckbox);
    
    const animLabel = document.createElement('label');
    animLabel.textContent = 'Enable hover animations';
    animLabel.htmlFor = 'anim-checkbox';
    animContainer.appendChild(animLabel);
    
    // Emoji toggle
    const emojiContainer = document.createElement('div');
    emojiContainer.style.marginBottom = '15px';
    
    const emojiCheckbox = document.createElement('input');
    emojiCheckbox.type = 'checkbox';
    emojiCheckbox.id = 'emoji-checkbox';
    emojiCheckbox.checked = this.settings.addEmoji;
    emojiCheckbox.style.marginRight = '8px';
    emojiContainer.appendChild(emojiCheckbox);
    
    const emojiLabel = document.createElement('label');
    emojiLabel.textContent = 'Add decorative emoji';
    emojiLabel.htmlFor = 'emoji-checkbox';
    emojiContainer.appendChild(emojiLabel);
    
    // Custom emoji
    const customEmojiContainer = document.createElement('div');
    customEmojiContainer.style.marginBottom = '15px';
    
    const customEmojiLabel = document.createElement('label');
    customEmojiLabel.textContent = 'Custom Emoji:';
    customEmojiLabel.style.display = 'block';
    customEmojiLabel.style.marginBottom = '5px';
    customEmojiContainer.appendChild(customEmojiLabel);
    
    const customEmojiInput = document.createElement('input');
    customEmojiInput.type = 'text';
    customEmojiInput.value = this.settings.customEmoji;
    customEmojiInput.style.width = '100%';
    customEmojiInput.style.padding = '8px';
    customEmojiInput.style.backgroundColor = '#fff';
    customEmojiInput.style.border = '1px solid #ccc';
    customEmojiInput.style.borderRadius = '5px';
    customEmojiContainer.appendChild(customEmojiInput);
    
    // Add all containers to form
    form.appendChild(radiusContainer);
    form.appendChild(selfColorContainer);
    form.appendChild(otherColorContainer);
    form.appendChild(animContainer);
    form.appendChild(emojiContainer);
    form.appendChild(customEmojiContainer);
    
    // Create and show modal
    const modal = this.api.ui.createModal({
      title: 'Message Bubbles Settings',
      content: form,
      width: '400px',
      buttons: [
        {
          text: 'Cancel',
          color: '#747F8D',
          onClick: (modal) => {
            document.body.removeChild(modal);
          }
        },
        {
          text: 'Save',
          color: '#5865F2',
          onClick: (modal) => {
            // Save settings
            this.settings.bubbleRadius = parseInt(radiusInput.value);
            this.settings.selfMessageColor = selfColorInput.value;
            this.settings.otherMessageColor = otherColorInput.value;
            this.settings.animationEnabled = animCheckbox.checked;
            this.settings.addEmoji = emojiCheckbox.checked;
            this.settings.customEmoji = customEmojiInput.value;
            
            // Save to storage
            this.api.storage.saveData('message-bubbles', this.settings);
            
            // Update styles
            this.updateCSS();
            
            // Reprocess messages
            this.processMessages();
            
            // Close modal
            document.body.removeChild(modal);
            
            // Show confirmation
            this.api.ui.showToast({
              content: 'Settings saved!',
              type: 'success'
            });
          }
        }
      ]
    });
    
    document.body.appendChild(modal);
  }
}; 