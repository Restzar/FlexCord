/**
 * @name CuteCursor
 * @version 1.0.0
 * @description Changes your cursor to cute themed options like hearts, stars, and more
 * @author FlexCord Team
 */

module.exports = {
  meta: {
    name: "Cute Cursor",
    version: "1.0.0",
    description: "Changes your cursor to cute themed options like hearts, stars, and more",
    author: "FlexCord Team"
  },
  
  settings: {
    selectedCursor: "heart",
    cursorSize: 24,
    trailEffect: true,
    trailColor: "#FFD1DC", // Pastel pink
    trailLength: 5,
  },
  
  cursors: [
    { id: "heart", name: "Heart", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23FFD1DC' stroke='%23FF9CAE' stroke-width='1.5'%3E%3Cpath d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'%3E%3C/path%3E%3C/svg%3E" },
    { id: "star", name: "Star", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23FFEB9C' stroke='%23FFC53D' stroke-width='1.5'%3E%3Cpolygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'%3E%3C/polygon%3E%3C/svg%3E" },
    { id: "paw", name: "Paw", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 512 512' fill='%23C7FFD8'%3E%3Cpath d='M256,224c-79.41,0-192,122.76-192,200.25,0,34.9,26.81,55.75,71.74,55.75,48.84,0,81.61-25.08,120.26-25.08,38.45,0,72.09,25.08,120.26,25.08,44.93,0,71.74-20.85,71.74-55.75C448,346.76,335.41,224,256,224Z' stroke='%2389E894' stroke-width='10'/%3E%3Cpath d='M144,209.43c26.5,0,48-21.5,48-48s-21.5-48-48-48-48,21.5-48,48S117.5,209.43,144,209.43Z' stroke='%2389E894' stroke-width='10'/%3E%3Cpath d='M368,209.43c26.5,0,48-21.5,48-48s-21.5-48-48-48-48,21.5-48,48S341.5,209.43,368,209.43Z' stroke='%2389E894' stroke-width='10'/%3E%3Cpath d='M299.6,159c0-15.45-12.18-28-27.19-28s-27.19,12.52-27.19,28,12.18,28,27.19,28S299.6,174.42,299.6,159Z' stroke='%2389E894' stroke-width='10'/%3E%3Cpath d='M208,192c15,0,27.19-12.54,27.19-28S223,136,208,136s-27.19,12.52-27.19,28S193,192,208,192Z' stroke='%2389E894' stroke-width='10'/%3E%3Cpath d='M304,192c15,0,27.19-12.54,27.19-28S319,136,304,136s-27.19,12.52-27.19,28S289,192,304,192Z' stroke='%2389E894' stroke-width='10'/%3E%3C/svg%3E" },
    { id: "moon", name: "Moon", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23E6E6FA' stroke='%23CBCBFF' stroke-width='1.5'%3E%3Cpath d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'%3E%3C/path%3E%3C/svg%3E" },
    { id: "cloud", name: "Cloud", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23B5EAEA' stroke='%2395DADA' stroke-width='1.5'%3E%3Cpath d='M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z'%3E%3C/path%3E%3C/svg%3E" },
    { id: "rainbow", name: "Rainbow", url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath d='M12 4C6.486 4 2 8.486 2 14h3c0-3.866 3.134-7 7-7s7 3.134 7 7h3c0-5.514-4.486-10-10-10z' fill='%23FF9AA2'/%3E%3Cpath d='M12 7c-3.866 0-7 3.134-7 7h3c0-2.206 1.794-4 4-4s4 1.794 4 4h3c0-3.866-3.134-7-7-7z' fill='%23FFB7B2'/%3E%3Cpath d='M12 10c-2.206 0-4 1.794-4 4h8c0-2.206-1.794-4-4-4z' fill='%23FFDAC1'/%3E%3C/svg%3E" },
  ],
  
  styleElement: null,
  trailElements: [],
  trailTimer: null,
  mousePosition: { x: 0, y: 0 },
  
  onLoad: function() {
    this.logger.log('Cute Cursor plugin loaded!');
    
    // Load saved settings if they exist
    const savedSettings = this.api.storage.loadData('cute-cursor');
    if (savedSettings) {
      this.settings = Object.assign(this.settings, savedSettings);
    }
  },
  
  onEnable: function() {
    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    
    // Apply cursor style
    this.updateCursorStyle();
    
    // Set up trail effect if enabled
    if (this.settings.trailEffect) {
      this.setupTrailEffect();
    }
    
    // Add settings button
    this.addSettingsButton();
    
    this.logger.log('Cute Cursor plugin enabled!');
  },
  
  onDisable: function() {
    // Remove cursor styles
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
    
    // Remove trail elements
    this.clearTrailElements();
    
    // Clear trail timer
    if (this.trailTimer) {
      clearInterval(this.trailTimer);
      this.trailTimer = null;
    }
    
    // Remove our settings button
    const settingsButton = document.getElementById('cute-cursor-settings-button');
    if (settingsButton && settingsButton.parentNode) {
      settingsButton.parentNode.removeChild(settingsButton);
    }
    
    this.logger.log('Cute Cursor plugin disabled!');
  },
  
  updateCursorStyle: function() {
    const selectedCursor = this.cursors.find(cursor => cursor.id === this.settings.selectedCursor);
    if (!selectedCursor) return;
    
    const css = `
      body, * {
        cursor: url("${selectedCursor.url}") ${this.settings.cursorSize / 2} ${this.settings.cursorSize / 2}, auto !important;
      }
    `;
    
    this.styleElement.textContent = css;
  },
  
  setupTrailEffect: function() {
    // Clear existing trail if any
    this.clearTrailElements();
    
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.mousePosition = { x: e.clientX, y: e.clientY };
    });
    
    // Create trail elements container
    this.trailContainer = document.createElement('div');
    this.trailContainer.style.position = 'fixed';
    this.trailContainer.style.top = '0';
    this.trailContainer.style.left = '0';
    this.trailContainer.style.width = '100%';
    this.trailContainer.style.height = '100%';
    this.trailContainer.style.pointerEvents = 'none';
    this.trailContainer.style.zIndex = '9999';
    this.trailContainer.id = 'cursor-trail-container';
    document.body.appendChild(this.trailContainer);
    
    // Create initial trail elements
    for (let i = 0; i < this.settings.trailLength; i++) {
      this.createTrailElement();
    }
    
    // Update trail position in animation loop
    this.trailTimer = setInterval(() => {
      this.updateTrailPosition();
    }, 40);
  },
  
  createTrailElement: function() {
    const selectedCursor = this.cursors.find(cursor => cursor.id === this.settings.selectedCursor);
    if (!selectedCursor) return;
    
    const trail = document.createElement('div');
    trail.style.position = 'absolute';
    trail.style.width = `${this.settings.cursorSize}px`;
    trail.style.height = `${this.settings.cursorSize}px`;
    trail.style.backgroundImage = `url("${selectedCursor.url}")`;
    trail.style.backgroundSize = 'contain';
    trail.style.backgroundRepeat = 'no-repeat';
    trail.style.opacity = '0';
    trail.style.pointerEvents = 'none';
    trail.style.transition = 'opacity 0.3s ease';
    
    this.trailContainer.appendChild(trail);
    this.trailElements.push({ element: trail, x: 0, y: 0 });
  },
  
  updateTrailPosition: function() {
    if (!this.trailElements.length) return;
    
    // Update each trail element's position with delay
    for (let i = this.trailElements.length - 1; i >= 0; i--) {
      const trail = this.trailElements[i];
      
      if (i === this.trailElements.length - 1) {
        // First element follows the cursor
        trail.x = this.mousePosition.x - (this.settings.cursorSize / 2);
        trail.y = this.mousePosition.y - (this.settings.cursorSize / 2);
        trail.element.style.opacity = '0.8';
      } else {
        // Other elements follow the previous element
        const next = this.trailElements[i + 1];
        trail.x += (next.x - trail.x) * 0.6;
        trail.y += (next.y - trail.y) * 0.6;
        trail.element.style.opacity = (0.7 * i / this.trailElements.length).toString();
      }
      
      trail.element.style.transform = `translate(${trail.x}px, ${trail.y}px)`;
    }
  },
  
  clearTrailElements: function() {
    if (this.trailContainer && this.trailContainer.parentNode) {
      this.trailContainer.parentNode.removeChild(this.trailContainer);
    }
    
    this.trailElements = [];
  },
  
  addSettingsButton: function() {
    // Create settings button
    const button = this.api.ui.createButton({
      text: '✨ Cursor Settings',
      id: 'cute-cursor-settings-button',
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
    
    // Cursor selection
    const cursorContainer = document.createElement('div');
    cursorContainer.style.marginBottom = '20px';
    
    const cursorLabel = document.createElement('label');
    cursorLabel.textContent = 'Cursor Style:';
    cursorLabel.style.display = 'block';
    cursorLabel.style.marginBottom = '10px';
    cursorLabel.style.fontWeight = 'bold';
    cursorContainer.appendChild(cursorLabel);
    
    // Create cursor options as radio buttons with visual preview
    const optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'flex';
    optionsContainer.style.flexWrap = 'wrap';
    optionsContainer.style.gap = '10px';
    optionsContainer.style.justifyContent = 'center';
    
    this.cursors.forEach(cursor => {
      const option = document.createElement('div');
      option.style.width = '80px';
      option.style.height = '80px';
      option.style.display = 'flex';
      option.style.flexDirection = 'column';
      option.style.alignItems = 'center';
      option.style.justifyContent = 'center';
      option.style.backgroundColor = this.settings.selectedCursor === cursor.id ? '#f0f0f0' : 'transparent';
      option.style.borderRadius = '8px';
      option.style.padding = '8px';
      option.style.cursor = 'pointer';
      option.style.transition = 'all 0.2s ease';
      option.style.border = this.settings.selectedCursor === cursor.id ? '2px solid #FFD1DC' : '2px solid transparent';
      
      option.onmouseover = () => {
        if (this.settings.selectedCursor !== cursor.id) {
          option.style.backgroundColor = '#f8f8f8';
        }
      };
      
      option.onmouseout = () => {
        if (this.settings.selectedCursor !== cursor.id) {
          option.style.backgroundColor = 'transparent';
        }
      };
      
      option.onclick = () => {
        // Update selected style
        document.querySelectorAll('.cursor-option').forEach(el => {
          el.style.backgroundColor = 'transparent';
          el.style.border = '2px solid transparent';
        });
        option.style.backgroundColor = '#f0f0f0';
        option.style.border = '2px solid #FFD1DC';
        
        // Update selected cursor setting
        this.settings.selectedCursor = cursor.id;
      };
      
      option.classList.add('cursor-option');
      
      const preview = document.createElement('img');
      preview.src = cursor.url;
      preview.style.width = '32px';
      preview.style.height = '32px';
      preview.style.marginBottom = '5px';
      option.appendChild(preview);
      
      const name = document.createElement('div');
      name.textContent = cursor.name;
      name.style.fontSize = '12px';
      name.style.textAlign = 'center';
      option.appendChild(name);
      
      optionsContainer.appendChild(option);
    });
    
    cursorContainer.appendChild(optionsContainer);
    
    // Cursor size
    const sizeContainer = document.createElement('div');
    sizeContainer.style.marginBottom = '15px';
    
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Cursor Size: ' + this.settings.cursorSize + 'px';
    sizeLabel.style.display = 'block';
    sizeLabel.style.marginBottom = '5px';
    sizeContainer.appendChild(sizeLabel);
    
    const sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.min = '16';
    sizeInput.max = '48';
    sizeInput.value = this.settings.cursorSize;
    sizeInput.style.width = '100%';
    
    // Update label when slider changes
    sizeInput.oninput = () => {
      sizeLabel.textContent = 'Cursor Size: ' + sizeInput.value + 'px';
    };
    
    sizeContainer.appendChild(sizeInput);
    
    // Trail effect toggle
    const trailContainer = document.createElement('div');
    trailContainer.style.marginBottom = '15px';
    
    const trailCheckbox = document.createElement('input');
    trailCheckbox.type = 'checkbox';
    trailCheckbox.id = 'trail-checkbox';
    trailCheckbox.checked = this.settings.trailEffect;
    trailCheckbox.style.marginRight = '8px';
    trailContainer.appendChild(trailCheckbox);
    
    const trailLabel = document.createElement('label');
    trailLabel.textContent = 'Enable cursor trail effect';
    trailLabel.htmlFor = 'trail-checkbox';
    trailContainer.appendChild(trailLabel);
    
    // Trail length
    const trailLengthContainer = document.createElement('div');
    trailLengthContainer.style.marginBottom = '15px';
    trailLengthContainer.style.marginLeft = '25px';
    trailLengthContainer.style.display = this.settings.trailEffect ? 'block' : 'none';
    
    const trailLengthLabel = document.createElement('label');
    trailLengthLabel.textContent = 'Trail Length: ' + this.settings.trailLength;
    trailLengthLabel.style.display = 'block';
    trailLengthLabel.style.marginBottom = '5px';
    trailLengthContainer.appendChild(trailLengthLabel);
    
    const trailLengthInput = document.createElement('input');
    trailLengthInput.type = 'range';
    trailLengthInput.min = '2';
    trailLengthInput.max = '15';
    trailLengthInput.value = this.settings.trailLength;
    trailLengthInput.style.width = '100%';
    
    // Update label when slider changes
    trailLengthInput.oninput = () => {
      trailLengthLabel.textContent = 'Trail Length: ' + trailLengthInput.value;
    };
    
    trailLengthContainer.appendChild(trailLengthInput);
    
    // Show/hide trail options based on checkbox
    trailCheckbox.onchange = () => {
      trailLengthContainer.style.display = trailCheckbox.checked ? 'block' : 'none';
    };
    
    // Add all containers to form
    form.appendChild(cursorContainer);
    form.appendChild(sizeContainer);
    form.appendChild(trailContainer);
    form.appendChild(trailLengthContainer);
    
    // Create and show modal
    const modal = this.api.ui.createModal({
      title: 'Cute Cursor Settings',
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
          text: 'Apply',
          color: '#5865F2',
          onClick: (modal) => {
            // Save settings
            this.settings.cursorSize = parseInt(sizeInput.value);
            this.settings.trailEffect = trailCheckbox.checked;
            this.settings.trailLength = parseInt(trailLengthInput.value);
            
            // Save to storage
            this.api.storage.saveData('cute-cursor', this.settings);
            
            // Apply changes
            this.updateCursorStyle();
            
            // Handle trail effect
            if (this.trailTimer) {
              clearInterval(this.trailTimer);
              this.trailTimer = null;
              this.clearTrailElements();
            }
            
            if (this.settings.trailEffect) {
              this.setupTrailEffect();
            }
            
            // Close modal
            document.body.removeChild(modal);
            
            // Show confirmation
            this.api.ui.showToast({
              content: 'Cursor settings applied!',
              type: 'success'
            });
          }
        }
      ]
    });
    
    document.body.appendChild(modal);
  }
}; 