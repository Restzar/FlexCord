/**
 * FlexCord API
 * Provides a stable interface for plugins to interact with Discord
 */

const fs = require('fs');
const path = require('path');

// Main API object
const FlexCordAPI = {
  /**
   * API version - increment when making breaking changes
   */
  version: '1.0.0',
  
  /**
   * Internal references and state
   * @private
   */
  _internal: {
    discordModules: {},
    eventSubscriptions: {},
    dataFolder: null,
    initialized: false
  },
  
  /**
   * Initialize the API
   * @param {Object} options - Configuration options
   * @private
   */
  _initialize: function(options = {}) {
    if (this._internal.initialized) return;
    
    this._internal.dataFolder = options.dataFolder || path.join(__dirname, 'plugins', 'data');
    
    // Create data folder if it doesn't exist
    if (!fs.existsSync(this._internal.dataFolder)) {
      fs.mkdirSync(this._internal.dataFolder, { recursive: true });
    }
    
    this._patchDiscord();
    this._setupWebpackModules();
    
    this._internal.initialized = true;
    this.logger.log('FlexCordAPI initialized');
  },
  
  /**
   * Sets up access to Discord's webpack modules
   * @private
   */
  _setupWebpackModules: function() {
    // Wait for webpack to be defined
    const checkForWebpack = setInterval(() => {
      if (window.webpackChunkdiscord_app) {
        clearInterval(checkForWebpack);
        this._extractModules();
      }
    }, 100);
  },
  
  /**
   * Extract useful modules from Discord's webpack
   * @private
   */
  _extractModules: function() {
    // Get webpack's push method
    const webpackPush = window.webpackChunkdiscord_app.push;
    
    // Override push to extract modules
    window.webpackChunkdiscord_app.push = (...args) => {
      const [, modules] = args[0];
      
      // Call original function
      const result = webpackPush.apply(window.webpackChunkdiscord_app, args);
      
      // Process the modules
      if (modules) {
        for (const moduleId in modules) {
          const module = modules[moduleId];
          
          // Extract modules we're interested in
          this._processModule(moduleId, module);
        }
      }
      
      return result;
    };
    
    // Trigger extraction by pushing an empty chunk
    window.webpackChunkdiscord_app.push([['FlexCordAPI'], {}, r => r]);
  },
  
  /**
   * Process a webpack module and extract useful exports
   * @param {string} id - Module ID
   * @param {Object} module - Module object
   * @private
   */
  _processModule: function(id, module) {
    if (typeof module !== 'function') return;
    
    try {
      // Check for the module's exports
      const moduleExports = module();
      if (!moduleExports) return;
      
      // Look for useful modules
      if (moduleExports.default) {
        // Check for MessageActions
        if (moduleExports.default.sendMessage && moduleExports.default.editMessage) {
          this._internal.discordModules.MessageActions = moduleExports.default;
        }
        
        // Check for UserStore
        if (moduleExports.default.getCurrentUser && moduleExports.default.getUser) {
          this._internal.discordModules.UserStore = moduleExports.default;
        }
        
        // Check for ChannelStore
        if (moduleExports.default.getChannel && moduleExports.default.getChannels) {
          this._internal.discordModules.ChannelStore = moduleExports.default;
        }
      }
    } catch (e) {
      // Ignore errors in module processing
    }
  },
  
  /**
   * Patch Discord's internal functions
   * @private
   */
  _patchDiscord: function() {
    // To be implemented - patches for Discord functions
  },
  
  /**
   * Logger utility
   */
  logger: {
    /**
     * Log a message
     * @param {string} message - Message to log
     * @param {Object} [options] - Options for logging
     */
    log: function(message, options = {}) {
      console.log(`[FlexCord] ${message}`);
    },
    
    /**
     * Log an info message
     * @param {string} message - Message to log
     * @param {Object} [options] - Options for logging
     */
    info: function(message, options = {}) {
      console.info(`[FlexCord] ${message}`);
    },
    
    /**
     * Log a warning message
     * @param {string} message - Message to log
     * @param {Object} [options] - Options for logging
     */
    warn: function(message, options = {}) {
      console.warn(`[FlexCord] ⚠️ ${message}`);
    },
    
    /**
     * Log an error message
     * @param {string} message - Message to log
     * @param {Error} [error] - Error object
     * @param {Object} [options] - Options for logging
     */
    error: function(message, error, options = {}) {
      console.error(`[FlexCord] ❌ ${message}`, error || '');
    },
    
    /**
     * Create a logger for a specific plugin
     * @param {string} pluginName - Name of the plugin
     * @returns {Object} Plugin-specific logger
     */
    createPluginLogger: function(pluginName) {
      return {
        log: (message, options) => console.log(`[${pluginName}] ${message}`),
        info: (message, options) => console.info(`[${pluginName}] ${message}`),
        warn: (message, options) => console.warn(`[${pluginName}] ⚠️ ${message}`),
        error: (message, error, options) => console.error(`[${pluginName}] ❌ ${message}`, error || '')
      };
    }
  },
  
  /**
   * UI utilities for creating interface elements
   */
  ui: {
    /**
     * Create a button element
     * @param {Object} options - Button options
     * @returns {HTMLElement} The created button
     */
    createButton: function(options = {}) {
      const button = document.createElement('button');
      
      if (options.text) button.textContent = options.text;
      if (options.id) button.id = options.id;
      if (options.className) button.className = options.className;
      
      // Apply default styling if Discord classes not provided
      if (!options.className) {
        button.style.backgroundColor = options.color || '#5865F2';
        button.style.color = options.textColor || 'white';
        button.style.borderRadius = '3px';
        button.style.padding = '8px 16px';
        button.style.border = 'none';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.fontWeight = '500';
      }
      
      if (typeof options.onClick === 'function') {
        button.addEventListener('click', options.onClick);
      }
      
      return button;
    },
    
    /**
     * Create a modal dialog
     * @param {Object} options - Modal options
     * @returns {HTMLElement} The created modal
     */
    createModal: function(options = {}) {
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      modal.style.zIndex = '9999';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      
      const content = document.createElement('div');
      content.style.backgroundColor = '#36393f';
      content.style.borderRadius = '5px';
      content.style.padding = '20px';
      content.style.maxWidth = options.width || '500px';
      content.style.maxHeight = options.height || '80%';
      content.style.overflow = 'auto';
      content.style.color = '#dcddde';
      
      if (options.title) {
        const title = document.createElement('h2');
        title.textContent = options.title;
        title.style.marginTop = '0';
        title.style.marginBottom = '15px';
        title.style.color = 'white';
        content.appendChild(title);
      }
      
      if (options.content) {
        if (typeof options.content === 'string') {
          const text = document.createElement('p');
          text.textContent = options.content;
          content.appendChild(text);
        } else if (options.content instanceof HTMLElement) {
          content.appendChild(options.content);
        }
      }
      
      if (options.buttons) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '20px';
        
        options.buttons.forEach(buttonOpts => {
          const button = this.createButton(buttonOpts);
          button.style.marginLeft = '10px';
          buttonContainer.appendChild(button);
        });
        
        content.appendChild(buttonContainer);
      }
      
      modal.appendChild(content);
      
      // Close on background click if enabled
      if (options.closeOnOutsideClick) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            document.body.removeChild(modal);
            if (typeof options.onClose === 'function') {
              options.onClose();
            }
          }
        });
      }
      
      return modal;
    },
    
    /**
     * Show a toast notification
     * @param {Object} options - Toast options
     */
    showToast: function(options = {}) {
      const toast = document.createElement('div');
      toast.style.position = 'fixed';
      toast.style.bottom = '20px';
      toast.style.right = '20px';
      toast.style.backgroundColor = options.type === 'error' ? '#ED4245' : 
                                   options.type === 'warning' ? '#FAA81A' : 
                                   options.type === 'success' ? '#43B581' : '#5865F2';
      toast.style.color = 'white';
      toast.style.padding = '10px 15px';
      toast.style.borderRadius = '4px';
      toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
      toast.style.zIndex = '9999';
      toast.style.animation = 'flexcord-toast 3s forwards';
      toast.style.fontSize = '14px';
      
      // Add animation if it doesn't exist
      if (!document.getElementById('flexcord-toast-style')) {
        const style = document.createElement('style');
        style.id = 'flexcord-toast-style';
        style.textContent = `
          @keyframes flexcord-toast {
            0% { transform: translateY(100%); opacity: 0; }
            10% { transform: translateY(0); opacity: 1; }
            90% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      toast.textContent = options.content || '';
      document.body.appendChild(toast);
      
      // Remove after animation completes
      setTimeout(() => {
        if (toast.parentNode === document.body) {
          document.body.removeChild(toast);
        }
      }, 3000);
    }
  },
  
  /**
   * Discord message utilities
   */
  messages: {
    /**
     * Send a message to a channel
     * @param {string} channelId - Channel ID
     * @param {Object} messageData - Message data
     * @returns {Promise<Object>} Message object
     */
    sendMessage: function(channelId, messageData) {
      const MessageActions = FlexCordAPI._internal.discordModules.MessageActions;
      
      if (!MessageActions) {
        FlexCordAPI.logger.error('MessageActions module not found');
        return Promise.reject(new Error('MessageActions module not found'));
      }
      
      if (typeof messageData === 'string') {
        messageData = { content: messageData };
      }
      
      return new Promise((resolve, reject) => {
        try {
          MessageActions.sendMessage(channelId, messageData)
            .then(resolve)
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    },
    
    /**
     * Edit a message
     * @param {string} channelId - Channel ID
     * @param {string} messageId - Message ID
     * @param {Object} messageData - New message data
     * @returns {Promise<Object>} Updated message object
     */
    editMessage: function(channelId, messageId, messageData) {
      const MessageActions = FlexCordAPI._internal.discordModules.MessageActions;
      
      if (!MessageActions) {
        FlexCordAPI.logger.error('MessageActions module not found');
        return Promise.reject(new Error('MessageActions module not found'));
      }
      
      if (typeof messageData === 'string') {
        messageData = { content: messageData };
      }
      
      return new Promise((resolve, reject) => {
        try {
          MessageActions.editMessage(channelId, messageId, messageData)
            .then(resolve)
            .catch(reject);
        } catch (e) {
          reject(e);
        }
      });
    }
  },
  
  /**
   * Data storage utilities
   */
  storage: {
    /**
     * Save data for a plugin
     * @param {string} pluginId - Plugin identifier
     * @param {Object} data - Data to save
     * @returns {boolean} Success status
     */
    saveData: function(pluginId, data) {
      try {
        const dataPath = path.join(FlexCordAPI._internal.dataFolder, `${pluginId}.json`);
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return true;
      } catch (e) {
        FlexCordAPI.logger.error(`Failed to save data for plugin ${pluginId}`, e);
        return false;
      }
    },
    
    /**
     * Load data for a plugin
     * @param {string} pluginId - Plugin identifier
     * @param {Object} defaultData - Default data if none exists
     * @returns {Object} Plugin data
     */
    loadData: function(pluginId, defaultData = {}) {
      try {
        const dataPath = path.join(FlexCordAPI._internal.dataFolder, `${pluginId}.json`);
        
        if (fs.existsSync(dataPath)) {
          return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        }
        
        // If no data file exists, create one with default data
        this.saveData(pluginId, defaultData);
        return defaultData;
      } catch (e) {
        FlexCordAPI.logger.error(`Failed to load data for plugin ${pluginId}`, e);
        return defaultData;
      }
    },
    
    /**
     * Delete data for a plugin
     * @param {string} pluginId - Plugin identifier
     * @returns {boolean} Success status
     */
    deleteData: function(pluginId) {
      try {
        const dataPath = path.join(FlexCordAPI._internal.dataFolder, `${pluginId}.json`);
        
        if (fs.existsSync(dataPath)) {
          fs.unlinkSync(dataPath);
        }
        
        return true;
      } catch (e) {
        FlexCordAPI.logger.error(`Failed to delete data for plugin ${pluginId}`, e);
        return false;
      }
    }
  },
  
  /**
   * Discord utilities
   */
  discord: {
    /**
     * Get the current user
     * @returns {Object|null} Current user object
     */
    getCurrentUser: function() {
      const UserStore = FlexCordAPI._internal.discordModules.UserStore;
      
      if (!UserStore) {
        FlexCordAPI.logger.error('UserStore module not found');
        return null;
      }
      
      return UserStore.getCurrentUser();
    },
    
    /**
     * Get a user by ID
     * @param {string} userId - User ID
     * @returns {Object|null} User object
     */
    getUser: function(userId) {
      const UserStore = FlexCordAPI._internal.discordModules.UserStore;
      
      if (!UserStore) {
        FlexCordAPI.logger.error('UserStore module not found');
        return null;
      }
      
      return UserStore.getUser(userId);
    },
    
    /**
     * Get a channel by ID
     * @param {string} channelId - Channel ID
     * @returns {Object|null} Channel object
     */
    getChannel: function(channelId) {
      const ChannelStore = FlexCordAPI._internal.discordModules.ChannelStore;
      
      if (!ChannelStore) {
        FlexCordAPI.logger.error('ChannelStore module not found');
        return null;
      }
      
      return ChannelStore.getChannel(channelId);
    }
  },
  
  /**
   * Event system
   */
  events: {
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @returns {string} Subscription ID
     */
    subscribe: function(event, callback) {
      if (!FlexCordAPI._internal.eventSubscriptions[event]) {
        FlexCordAPI._internal.eventSubscriptions[event] = {};
      }
      
      const subscriptionId = Math.random().toString(36).substr(2, 9);
      FlexCordAPI._internal.eventSubscriptions[event][subscriptionId] = callback;
      
      return subscriptionId;
    },
    
    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {string} subscriptionId - Subscription ID
     * @returns {boolean} Success status
     */
    unsubscribe: function(event, subscriptionId) {
      if (!FlexCordAPI._internal.eventSubscriptions[event] || 
          !FlexCordAPI._internal.eventSubscriptions[event][subscriptionId]) {
        return false;
      }
      
      delete FlexCordAPI._internal.eventSubscriptions[event][subscriptionId];
      return true;
    },
    
    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {...any} args - Event arguments
     * @private
     */
    _emit: function(event, ...args) {
      if (!FlexCordAPI._internal.eventSubscriptions[event]) {
        return;
      }
      
      Object.values(FlexCordAPI._internal.eventSubscriptions[event]).forEach(callback => {
        try {
          callback(...args);
        } catch (e) {
          FlexCordAPI.logger.error(`Error in event handler for ${event}`, e);
        }
      });
    }
  }
};

// Export the API for use in plugins
module.exports = FlexCordAPI; 