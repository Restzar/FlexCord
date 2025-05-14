/**
 * @name FontChanger
 * @version 1.0.0
 * @description Changes Discord's fonts to cute, rounded alternatives
 * @author FlexCord Team
 */

module.exports = {
  meta: {
    name: "Font Changer",
    version: "1.0.0",
    description: "Changes Discord's fonts to cute, rounded alternatives",
    author: "FlexCord Team"
  },
  
  settings: {
    selectedFont: "Varela Round",
    fontSize: 14,
    fontWeight: 400,
    textShadow: false,
  },
  
  fonts: [
    { name: "Varela Round", url: "https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" },
    { name: "Comfortaa", url: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap" },
    { name: "Quicksand", url: "https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" },
    { name: "Baloo 2", url: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&display=swap" },
    { name: "Nunito", url: "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap" },
    { name: "Poppins", url: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" },
    { name: "Comic Neue", url: "https://fonts.googleapis.com/css2?family=Comic+Neue:wght@300;400;700&display=swap" },
  ],
  
  styleElement: null,
  fontLink: null,
  
  onLoad: function() {
    this.logger.log('Font Changer plugin loaded!');
    
    // Load saved settings if they exist
    const savedSettings = this.api.storage.loadData('font-changer');
    if (savedSettings) {
      this.settings = Object.assign(this.settings, savedSettings);
    }
  },
  
  onEnable: function() {
    // Add font link to document head
    this.fontLink = document.createElement('link');
    this.fontLink.rel = 'stylesheet';
    this.setFontLink();
    document.head.appendChild(this.fontLink);
    
    // Create style element
    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    
    // Update CSS
    this.updateCSS();
    
    // Add settings button
    this.addSettingsButton();
    
    this.logger.log('Font Changer plugin enabled!');
  },
  
  onDisable: function() {
    // Remove font link
    if (this.fontLink && this.fontLink.parentNode) {
      this.fontLink.parentNode.removeChild(this.fontLink);
    }
    
    // Remove style element
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
    
    // Remove settings button
    const settingsButton = document.getElementById('font-changer-settings-button');
    if (settingsButton && settingsButton.parentNode) {
      settingsButton.parentNode.removeChild(settingsButton);
    }
    
    this.logger.log('Font Changer plugin disabled!');
  },
  
  setFontLink: function() {
    const selectedFont = this.fonts.find(font => font.name === this.settings.selectedFont);
    if (selectedFont) {
      this.fontLink.href = selectedFont.url;
    }
  },
  
  updateCSS: function() {
    const css = `
      /* Apply font to all text elements */
      body, button, input, select, textarea {
        font-family: "${this.settings.selectedFont}", Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        font-size: ${this.settings.fontSize}px !important;
        font-weight: ${this.settings.fontWeight} !important;
        ${this.settings.textShadow ? 'text-shadow: 0 0 1px rgba(0,0,0,0.1) !important;' : ''}
      }
      
      /* Make channel names and headers cute */
      .name-23GUGE, .title-29uC1r, .title-31SJ6t {
        font-family: "${this.settings.selectedFont}", Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        letter-spacing: 0.5px !important;
      }
      
      /* Adjust message text */
      .markup-2BOw-j {
        font-family: "${this.settings.selectedFont}", Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        font-size: ${this.settings.fontSize}px !important;
        line-height: 1.5 !important;
      }
      
      /* Make username text cute */
      .username-1A8OIy {
        font-family: "${this.settings.selectedFont}", Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        font-weight: ${Math.min(this.settings.fontWeight + 100, 700)} !important;
      }
      
      /* Adjust buttons */
      .button-1YfofN {
        font-family: "${this.settings.selectedFont}", Whitney, "Helvetica Neue", Helvetica, Arial, sans-serif !important;
        letter-spacing: 0.5px !important;
      }
    `;
    
    this.styleElement.textContent = css;
  },
  
  addSettingsButton: function() {
    // Create settings button
    const button = this.api.ui.createButton({
      text: '🔤 Font Settings',
      id: 'font-changer-settings-button',
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
    
    // Font family select
    const fontContainer = document.createElement('div');
    fontContainer.style.marginBottom = '15px';
    
    const fontLabel = document.createElement('label');
    fontLabel.textContent = 'Font Family:';
    fontLabel.style.display = 'block';
    fontLabel.style.marginBottom = '5px';
    fontContainer.appendChild(fontLabel);
    
    const fontSelect = document.createElement('select');
    fontSelect.style.width = '100%';
    fontSelect.style.padding = '8px';
    fontSelect.style.backgroundColor = '#fff';
    fontSelect.style.border = '1px solid #ccc';
    fontSelect.style.borderRadius = '5px';
    
    // Add font options
    this.fonts.forEach(font => {
      const option = document.createElement('option');
      option.value = font.name;
      option.textContent = font.name;
      if (font.name === this.settings.selectedFont) {
        option.selected = true;
      }
      fontSelect.appendChild(option);
    });
    
    fontContainer.appendChild(fontSelect);
    
    // Font size
    const sizeContainer = document.createElement('div');
    sizeContainer.style.marginBottom = '15px';
    
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Font Size: ' + this.settings.fontSize + 'px';
    sizeLabel.style.display = 'block';
    sizeLabel.style.marginBottom = '5px';
    sizeContainer.appendChild(sizeLabel);
    
    const sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.min = '10';
    sizeInput.max = '18';
    sizeInput.value = this.settings.fontSize;
    sizeInput.style.width = '100%';
    
    // Update label when slider changes
    sizeInput.oninput = () => {
      sizeLabel.textContent = 'Font Size: ' + sizeInput.value + 'px';
    };
    
    sizeContainer.appendChild(sizeInput);
    
    // Font weight
    const weightContainer = document.createElement('div');
    weightContainer.style.marginBottom = '15px';
    
    const weightLabel = document.createElement('label');
    weightLabel.textContent = 'Font Weight:';
    weightLabel.style.display = 'block';
    weightLabel.style.marginBottom = '5px';
    weightContainer.appendChild(weightLabel);
    
    const weightSelect = document.createElement('select');
    weightSelect.style.width = '100%';
    weightSelect.style.padding = '8px';
    weightSelect.style.backgroundColor = '#fff';
    weightSelect.style.border = '1px solid #ccc';
    weightSelect.style.borderRadius = '5px';
    
    // Add weight options
    [300, 400, 500, 600, 700].forEach(weight => {
      const option = document.createElement('option');
      option.value = weight.toString();
      option.textContent = weight === 300 ? 'Light' : 
                          weight === 400 ? 'Regular' : 
                          weight === 500 ? 'Medium' : 
                          weight === 600 ? 'Semi-Bold' : 'Bold';
      if (weight === this.settings.fontWeight) {
        option.selected = true;
      }
      weightSelect.appendChild(option);
    });
    
    weightContainer.appendChild(weightSelect);
    
    // Text shadow toggle
    const shadowContainer = document.createElement('div');
    shadowContainer.style.marginBottom = '15px';
    
    const shadowCheckbox = document.createElement('input');
    shadowCheckbox.type = 'checkbox';
    shadowCheckbox.id = 'shadow-checkbox';
    shadowCheckbox.checked = this.settings.textShadow;
    shadowCheckbox.style.marginRight = '8px';
    shadowContainer.appendChild(shadowCheckbox);
    
    const shadowLabel = document.createElement('label');
    shadowLabel.textContent = 'Add subtle text shadow';
    shadowLabel.htmlFor = 'shadow-checkbox';
    shadowContainer.appendChild(shadowLabel);
    
    // Font preview
    const previewContainer = document.createElement('div');
    previewContainer.style.marginTop = '20px';
    previewContainer.style.marginBottom = '15px';
    previewContainer.style.padding = '15px';
    previewContainer.style.backgroundColor = '#f5f5f5';
    previewContainer.style.borderRadius = '8px';
    previewContainer.style.textAlign = 'center';
    
    const previewText = document.createElement('div');
    previewText.textContent = 'Hello! This is a preview of your selected font.';
    previewText.style.fontFamily = this.settings.selectedFont;
    previewText.style.fontSize = this.settings.fontSize + 'px';
    previewText.style.fontWeight = this.settings.fontWeight;
    
    if (this.settings.textShadow) {
      previewText.style.textShadow = '0 0 1px rgba(0,0,0,0.1)';
    }
    
    previewContainer.appendChild(previewText);
    
    // Update preview when settings change
    fontSelect.onchange = () => {
      previewText.style.fontFamily = fontSelect.value;
    };
    
    sizeInput.oninput = () => {
      sizeLabel.textContent = 'Font Size: ' + sizeInput.value + 'px';
      previewText.style.fontSize = sizeInput.value + 'px';
    };
    
    weightSelect.onchange = () => {
      previewText.style.fontWeight = weightSelect.value;
    };
    
    shadowCheckbox.onchange = () => {
      previewText.style.textShadow = shadowCheckbox.checked ? '0 0 1px rgba(0,0,0,0.1)' : 'none';
    };
    
    // Add all containers to form
    form.appendChild(fontContainer);
    form.appendChild(sizeContainer);
    form.appendChild(weightContainer);
    form.appendChild(shadowContainer);
    form.appendChild(previewContainer);
    
    // Create and show modal
    const modal = this.api.ui.createModal({
      title: 'Font Settings',
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
            this.settings.selectedFont = fontSelect.value;
            this.settings.fontSize = parseInt(sizeInput.value);
            this.settings.fontWeight = parseInt(weightSelect.value);
            this.settings.textShadow = shadowCheckbox.checked;
            
            // Save to storage
            this.api.storage.saveData('font-changer', this.settings);
            
            // Update font link
            this.setFontLink();
            
            // Update CSS
            this.updateCSS();
            
            // Close modal
            document.body.removeChild(modal);
            
            // Show confirmation
            this.api.ui.showToast({
              content: 'Font settings applied!',
              type: 'success'
            });
          }
        }
      ]
    });
    
    document.body.appendChild(modal);
  }
}; 