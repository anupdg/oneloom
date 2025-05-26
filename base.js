window.selection = {
  material: null,
  texture: null
};

// Store materials configuration
let materialsConfig = null;

// Store textures cache
const textureCache = {};

// Hardcoded material name - change this when needed
const MATERIAL_NAME = "ceiling";

// Variable to track locked state
let isScreenLocked = false;

// Variable to store the position when locked
let lockedPosition = null;

// Function to create the texture picker UI
function createPickerUI() {
  // Create the main container
  const picker = document.createElement('div');
  picker.id = 'picker';
  picker.className = 'collapsed';

  // Add positioning styles
  picker.style.position = 'absolute';
  picker.style.top = '30%';
  picker.style.left = '20px';
  picker.style.zIndex = '1000';
  
  // Create the toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'toggle-picker';
  toggleButton.textContent = '→';
  
  // Create the content container
  const pickerContent = document.createElement('div');
  pickerContent.id = 'picker-content';
  
  // Create the header
  const header = document.createElement('h3');
  header.textContent = 'Textures';
  
  // Create the texture container
  const textureContainer = document.createElement('div');
  textureContainer.className = 'texture-container';
  textureContainer.id = 'texture-container';
  
  // Assemble the components
  pickerContent.appendChild(header);
  pickerContent.appendChild(textureContainer);
  
  picker.appendChild(toggleButton);
  picker.appendChild(pickerContent);
  
  // Add to the document
  document.body.appendChild(picker);
  
  // Add toggle button event listener
  toggleButton.addEventListener('click', function() {
    picker.classList.toggle('collapsed');
    
    // Update button text with arrow icons
    if (picker.classList.contains('collapsed')) {
      this.textContent = '→';
    } else {
      this.textContent = '←';
    }
  });
}

// Function to create lock button UI (separate from picker)
function createLockButton() {
  // Create the lock button container
  const lockContainer = document.createElement('div');
  lockContainer.id = 'lock-container';
  lockContainer.style.position = 'absolute';
  lockContainer.style.top = '50%';
  lockContainer.style.right = '20px';
  lockContainer.style.transform = 'translateY(-50%)';
  lockContainer.style.zIndex = '1000';
  
  // Create the lock button
  const lockButton = document.createElement('button');
  lockButton.id = 'lock-button';
  lockButton.className = 'lock-button';
  lockButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
  lockButton.addEventListener('click', toggleScreenLock);
  
  lockContainer.appendChild(lockButton);
  document.body.appendChild(lockContainer);
}

// Function to toggle screen lock
function toggleScreenLock() {
  if (isScreenLocked) {
    unlockScreen();
  } else {
    lockScreen();
  }
}

// Function to lock the screen - allows rotation but blocks movement
function lockScreen() {
  const viewer = WALK.getViewer();
  if (!viewer) {
    console.error('Viewer not available');
    return;
  }
  
  try {
    // Get the current position to lock it
    const currentPos = viewer.getCameraPosition();
    
    // Store the locked position
    lockedPosition = {
      x: currentPos.x,
      y: currentPos.y,
      z: currentPos.z
    };
    
    // Add body class for CSS styling
    document.body.classList.add('screen-locked');
    
    // Setup movement blocking (more selective)
    setupSelectiveMovementBlocker();
    
    // Block only movement-related keyboard keys
    document.addEventListener('keydown', blockMovementKeys, true);
    document.addEventListener('keyup', blockMovementKeys, true);
    
    // Create position enforcement interval
    if (window._lockInterval) {
      clearInterval(window._lockInterval);
    }
    
    window._lockInterval = setInterval(() => {
      try {
        const currentPos = viewer.getCameraPosition();
        
        // Check if position has changed significantly
        const hasMovedPosition = 
          Math.abs(currentPos.x - lockedPosition.x) > 0.05 || 
          Math.abs(currentPos.y - lockedPosition.y) > 0.05 || 
          Math.abs(currentPos.z - lockedPosition.z) > 0.05;
        
        // If position changed, reset it but preserve rotation
        if (hasMovedPosition) {
          const currentRotation = viewer.getCameraRotation();
          
          // Create view object with locked position but current rotation
          let customView = {};
          
          try {
            if (typeof WALK.View === 'function') {
              customView = new WALK.View();
              customView.position = lockedPosition;
              customView.rotation = currentRotation;
            } else {
              customView = {
                position: lockedPosition,
                rotation: currentRotation
              };
            }
          } catch (e) {
            customView = {
              position: lockedPosition,
              rotation: currentRotation
            };
          }
          
          // Force camera back to locked position but keep rotation
          if (typeof viewer.switchToView === 'function') {
            viewer.switchToView(customView, 0);
          }
        }
      } catch (e) {
        console.error('Error in position enforcement:', e);
      }
    }, 100); // Check every 100ms
    
    // Update the lock button to show locked state
    const lockButton = document.getElementById('lock-button');
    if (lockButton) {
      lockButton.classList.add('locked');
      lockButton.title = 'Click to unlock movement';
    }
    
    // Update state
    isScreenLocked = true;
    
    console.log('🔒 Movement locked - UI interactions remain enabled');
    
  } catch (error) {
    console.error('Error locking screen:', error);
  }
}

// Enhanced unlock screen function
function unlockScreen() {
  const viewer = WALK.getViewer();
  if (!viewer) {
    console.error('Viewer not available');
    return;
  }
  
  try {
    // Remove body class
    document.body.classList.remove('screen-locked');
    
    // Clear the position enforcement interval
    if (window._lockInterval) {
      clearInterval(window._lockInterval);
      window._lockInterval = null;
    }
    
    // Remove movement blocking
    removeSelectiveMovementBlocker();
    
    // Remove keyboard event handlers
    document.removeEventListener('keydown', blockMovementKeys, true);
    document.removeEventListener('keyup', blockMovementKeys, true);
    
    // Update the lock button to show unlocked state
    const lockButton = document.getElementById('lock-button');
    if (lockButton) {
      lockButton.classList.remove('locked');
      lockButton.title = 'Click to lock movement';
    }
    
    // Clear state
    isScreenLocked = false;
    lockedPosition = null;
    
    console.log('🔓 Movement unlocked - full navigation enabled');
    
  } catch (error) {
    console.error('Error unlocking screen:', error);
  }
}

// Setup movement blocking while allowing rotation
function setupMovementBlocker() {
  // Find the canvas
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }
  
  // Track mouse drag state for rotation
  let isDragging = false;
  let dragStartTime = 0;
  
  // Function to selectively block events
  function blockMovementEvents(e) {
    if (!isScreenLocked) return;
    
    // Check if the event target is an interactive UI element
    let target = e.target;
    let isUIElement = false;
    
    // Walk up the DOM tree looking for UI elements we want to keep interactive
    while (target && target !== document) {
      if (target.id === 'picker' ||
          target.id === 'lock-button' ||
          target.id === 'lock-container' ||
          target.closest('#picker') ||
          target.closest('#lock-container') ||
          target.classList.contains('texture-item') ||
          target.classList.contains('lock-button')) {
        isUIElement = true;
        break;
      }
      target = target.parentNode;
    }
    
    // Always allow UI interactions
    if (isUIElement) {
      return true;
    }
    
    // Always block mouse wheel events (zoom/movement)
    if (e.type === 'wheel') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Handle mouse events more selectively
    if (e.target === canvas || e.target.tagName === 'CANVAS') {
      
      // Track mouse down for drag detection
      if (e.type === 'mousedown') {
        isDragging = true;
        dragStartTime = Date.now();
        // Allow mousedown to start rotation drag
        return true;
      }
      
      // Allow mouse move during drag (for rotation)
      if (e.type === 'mousemove' && isDragging) {
        return true;
      }
      
      // Handle mouse up
      if (e.type === 'mouseup') {
        const dragDuration = Date.now() - dragStartTime;
        const wasQuickClick = dragDuration < 200; // Quick click likely means teleport attempt
        
        isDragging = false;
        
        // Block quick clicks (teleportation attempts)
        if (wasQuickClick) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        
        // Allow mouse up after rotation drag
        return true;
      }
      
      // Block regular clicks and double clicks (teleportation)
      if (e.type === 'click' || e.type === 'dblclick') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
    
    // Block touch events that could cause movement
    if (e.type.startsWith('touch') && 
        (e.target === canvas || e.target.tagName === 'CANVAS')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
  
  // Add event listeners to block movement-related events
  canvas.addEventListener('wheel', blockMovementEvents, true);
  canvas.addEventListener('click', blockMovementEvents, true);
  canvas.addEventListener('mousedown', blockMovementEvents, false); // Use false for mousedown to allow rotation
  canvas.addEventListener('mouseup', blockMovementEvents, true);
  canvas.addEventListener('mousemove', blockMovementEvents, false); // Use false for mousemove to allow rotation
  canvas.addEventListener('dblclick', blockMovementEvents, true);
  canvas.addEventListener('touchstart', blockMovementEvents, true);
  canvas.addEventListener('touchmove', blockMovementEvents, true);
  canvas.addEventListener('touchend', blockMovementEvents, true);
  
  // Also add to document level for broader coverage (but be more selective)
  document.addEventListener('wheel', blockMovementEvents, true);
  document.addEventListener('dblclick', blockMovementEvents, true);
  
  // Store the handler for cleanup
  window._blockMovementHandler = blockMovementEvents;
}

// Remove movement blocking
function removeMovementBlocker() {
  if (!window._blockMovementHandler) return;
  
  const canvas = document.querySelector('canvas');
  const handler = window._blockMovementHandler;
  
  // Remove canvas event listeners
  if (canvas) {
    canvas.removeEventListener('wheel', handler, true);
    canvas.removeEventListener('click', handler, true);
    canvas.removeEventListener('mousedown', handler, true);
    canvas.removeEventListener('dblclick', handler, true);
    canvas.removeEventListener('touchstart', handler, true);
    canvas.removeEventListener('touchmove', handler, true);
    canvas.removeEventListener('touchend', handler, true);
  }
  
  // Remove document level listeners
  document.removeEventListener('wheel', handler, true);
  document.removeEventListener('click', handler, true);
  document.removeEventListener('mousedown', handler, true);
  document.removeEventListener('dblclick', handler, true);
  
  window._blockMovementHandler = null;
}

// Block navigation keys
function blockNavigationKeys(e) {
  if (!isScreenLocked) return;
  
  // List of keys that cause movement
  const movementKeys = [
    'KeyW', 'KeyA', 'KeyS', 'KeyD',           // WASD
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', // Arrow keys
    'Space',                                  // Space (jump/up)
    'ShiftLeft', 'ShiftRight',               // Shift (run)
    'ControlLeft', 'ControlRight'            // Ctrl (crouch/down)
  ];
  
  // Also check by key name for broader compatibility
  const movementKeyNames = [
    'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    ' ','Shift', 'Control'
  ];
  
  if (movementKeys.includes(e.code) || movementKeyNames.includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}

// Initialize the UI when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create the picker UI
  createPickerUI();
  
  // Create the lock button (separate from picker)
  createLockButton();
    
  // Start viewer initialization
  initViewer();
});

// Load materials configuration
function loadMaterialsConfig() {
  fetch('https://anupdg.github.io/oneloom/materials-config.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load materials config');
      }
      return response.json();
    })
    .then(config => {
      materialsConfig = config;
      loadTexturesForMaterial(MATERIAL_NAME);
    })
    .catch(error => {
      console.error('Error loading materials config:', error);
    });
}

// Load textures for the selected material
function loadTexturesForMaterial(materialName) {
  if (!materialsConfig || !materialsConfig.materials[materialName]) {
    console.error('Material not found:', materialName);
    return;
  }
  
  const textureContainer = document.getElementById('texture-container');
  textureContainer.innerHTML = '';
  
  const textures = materialsConfig.materials[materialName].textures;
  textures.forEach(texture => {
    const textureItem = document.createElement('div');
    textureItem.className = 'texture-item';
    textureItem.dataset.id = texture.id;
    
    let element;
    if (texture.type === 'video') {
      element = document.createElement('video');
      element.autoplay = true;
      element.muted = true;
      element.loop = true;
    } else {
      element = document.createElement('img');
    }
    
    element.id = texture.id;
    element.src = texture.url;
    element.crossOrigin = 'anonymous';
    
    const label = document.createElement('div');
    label.className = 'texture-label';
    label.textContent = texture.id;
    
    textureItem.appendChild(element);
    textureItem.appendChild(label);
    textureContainer.appendChild(textureItem);
    
    // Add click handler
    textureItem.addEventListener('click', function() {
      // Remove selected class from all textures
      document.querySelectorAll('.texture-item').forEach(item => {
        item.classList.remove('selected');
      });
      
      // Add selected class to this texture
      textureItem.classList.add('selected');
      
      // Apply texture to material
      applyTextureToMaterial(materialName, texture);
    });
  });
}

// Apply texture to material
function applyTextureToMaterial(materialName, textureConfig) {
  const viewer = WALK.getViewer();
  if (!viewer) {
    console.error('Viewer not available');
    return;
  }
  
  const element = document.getElementById(textureConfig.id);
  if (!element) {
    console.error('Texture element not found:', textureConfig.id);
    return;
  }
  
  // Get or create texture
  let texture = textureCache[textureConfig.id];
  if (!texture) {
    if (textureConfig.type === 'video') {
      texture = viewer.createTextureFromHtmlVideo(element);
    } else {
      texture = viewer.createTextureFromHtmlImage(element);
    }
    textureCache[textureConfig.id] = texture;
  }
  
  // Find material and apply texture
  const material = viewer.findMaterial(materialName);
  if (!material) {
    console.error('Material not found:', materialName);
    return;
  }
  
  material.baseColorTexture = texture;
  
  // Update selection object
  window.selection = {
    material: materialName,
    texture: textureConfig.id
  };
  
  // Send the selection to the parent window
  sendSelectionUpdate();
  
  // Force the frame to be rendered
  viewer.requestFrame();
}

// Function to send selection updates to parent window
function sendSelectionUpdate() {
  window.parent.postMessage({
    type: 'SELECTION_UPDATE',
    payload: {
      selection: window.selection
    }
  }, '*');  // In production, replace '*' with your actual origin
}

// Initialize the viewer
function initViewer() {
  const viewer = WALK.getViewer();
  if (!viewer) {
    setTimeout(initViewer, 500);
    return;
  }
  
  // Set hardcoded material as editable
  viewer.setMaterialEditable(MATERIAL_NAME);
  
  // Load materials configuration and initialize UI
  loadMaterialsConfig();
  
  // Setup listener for Shapespark's built-in material picker events
  if (typeof viewer.onApiUserStateChanged === 'function') {
    viewer.onApiUserStateChanged(function(key, value) {
      if (key.startsWith("MaterialPicker:")) {
        const material = key.replace("MaterialPicker:", "");
        
        window.selection = {
          material: material,
          texture: value
        };
        sendSelectionUpdate();
      }
    });
  }
  
  // Handle messages from parent window
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'GET_SELECTION') {
      sendSelectionUpdate();
    }
  });
  
  // Ensure Shapespark UI elements are properly marked for interaction
  setTimeout(() => {
    markShapesparkUIElements();
  }, 2000);
}

// Function to mark Shapespark UI elements for proper interaction
function markShapesparkUIElements() {
  // Add data attributes to common Shapespark UI elements for easier detection
  const shapesparkSelectors = [
    '[class*="shapespark"]',
    '[class*="viewer"]',
    '[class*="camera-volume"]',
    '[class*="trigger"]',
    '[style*="position: absolute"]',
    '[style*="position: fixed"]'
  ];
  
  shapesparkSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Check if it's likely a UI element (high z-index or positioned)
      const style = window.getComputedStyle(element);
      if (style.position === 'absolute' || style.position === 'fixed') {
        if (!element.hasAttribute('data-shapespark-ui')) {
          element.setAttribute('data-shapespark-ui', 'true');
        }
      }
    });
  });
}
