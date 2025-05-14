/**
 * @name HelloPlugin
 * @version 1.0.0
 * @description A simple example plugin for FlexCord
 * @author FlexCord Team
 */

module.exports = {
  meta: {
    name: "HelloPlugin",
    version: "1.0.0",
    description: "A simple example plugin for FlexCord",
    author: "FlexCord Team"
  },
  
  // Called when the plugin is loaded
  onLoad: function() {
    console.log("[HelloPlugin] Loaded successfully!");
  },
  
  // Called when the plugin is enabled
  onEnable: function() {
    // Add a simple notification when the Discord client starts
    const notification = document.createElement("div");
    notification.id = "hello-plugin-notification";
    notification.style.position = "fixed";
    notification.style.bottom = "70px";
    notification.style.right = "20px";
    notification.style.background = "#43b581";
    notification.style.color = "white";
    notification.style.padding = "10px 15px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "9999";
    notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
    notification.style.fontFamily = "Whitney, Helvetica Neue, Helvetica, Arial, sans-serif";
    notification.textContent = "Hello from FlexCord! 👋";
    
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    console.log("[HelloPlugin] Enabled!");
  },
  
  // Called when the plugin is disabled
  onDisable: function() {
    // Clean up
    const notification = document.getElementById("hello-plugin-notification");
    if (notification && notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
    
    console.log("[HelloPlugin] Disabled!");
  }
};
