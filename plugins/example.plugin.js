/**
 * @name MessageLogger
 * @version 1.0.0
 * @description Logs messages to the console for debugging
 * @author FlexCord Team
 */

module.exports = {
  meta: {
    name: "MessageLogger",
    version: "1.0.0",
    description: "Logs messages to the console for debugging",
    author: "FlexCord Team"
  },
  
  // Store original fetch function
  originalFetch: null,
  
  // Called when the plugin is loaded
  onLoad: function() {
    console.log("[MessageLogger] Loaded successfully!");
  },
  
  // Called when the plugin is enabled
  onEnable: function() {
    // Save the original fetch function
    this.originalFetch = window.fetch;
    
    // Override fetch to intercept Discord API calls
    window.fetch = (...args) => {
      const url = args[0]?.url || args[0];
      const method = args[1]?.method || 'GET';
      
      // Check if it's a message being sent
      if (typeof url === 'string' && url.includes('/api/v9/channels/') && url.includes('/messages') && method === 'POST') {
        try {
          const body = JSON.parse(args[1]?.body);
          console.log("[MessageLogger] Message sent:", body.content);
        } catch (e) {
          // Ignore parsing errors
        }
      }
      
      // Call the original fetch function
      return this.originalFetch.apply(window, args);
    };
    
    console.log("[MessageLogger] Enabled! Messages will be logged to console.");
  },
  
  // Called when the plugin is disabled
  onDisable: function() {
    // Restore original fetch function
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
      this.originalFetch = null;
    }
    
    console.log("[MessageLogger] Disabled!");
  }
};
