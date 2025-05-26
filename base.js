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

// Function to lock the screen - allows rotation and UI interactions but blocks movement
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
    
    // Setup movement blocking (more selective approach)
    setupMovementBlocker();
    
    // Block keyboard navigation
    document.addEventListener('keydown', blockNavigationKeys, true);
    document.addEventListener('keyup', blockNavigationKeys, true);
    
    // Create position enforcement interval - this is the main mechanism
    if (window._lockInterval) {
      clearInterval(window._lockInterval);
    }
    
    window._lockInterval = setInterval(() => {
      try {
        const currentPos = viewer.getCameraPosition();
        
        // Check if position has changed significantly (allow small movements for UI interactions)
        const hasMovedPosition = 
          Math.abs(currentPos.x - lockedPosition.x) > 0.05 || 
          Math.abs(currentPos.y - lockedPosition.y) > 0.05 || 
          Math.abs(currentPos.z - lockedPosition.z) > 0.05;
        
        // If position changed significantly, reset it but preserve rotation
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
    }, 100); // Check every 100ms (less frequent to allow UI interactions)
    
    // Update the lock button to show locked state
    const lockButton = document.getElementById('lock-button');
    if (lockButton) {
      lockButton.classList.add('locked');
    }
    
    // Update state
    isScreenLocked = true;
    
  } catch (error) {
    console.error('Error locking screen:', error);
  }
}

// Function to unlock the screen
function unlockScreen() {
  const viewer = WALK.getViewer();
  if (!viewer) {
    console.error('Viewer not available');
    return;
  }
  
  try {
    // Clear the position enforcement interval
    if (window._lockInterval) {
      clearInterval(window._lockInterval);
      window._lockInterval = null;
    }
    
    // Remove movement blocking
    removeMovementBlocker();
    
    // Remove keyboard event handlers
    document.removeEventListener('keydown', blockNavigationKeys, true);
    document.removeEventListener('keyup', blockNavigationKeys, true);
    
    // Update the lock button to show unlocked state
    const lockButton = document.getElementById('lock-button');
    if (lockButton) {
      lockButton.classList.remove('locked');
    }
    
    // Clear state
    isScreenLocked = false;
    lockedPosition = null;
    
  } catch (error) {
    console.error('Error unlocking screen:', error);
  }
}

// Setup selective movement blocking - much more permissive approach
function setupMovementBlocker() {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }
  
  // Track recent clicks to distinguish between UI clicks and movement attempts
  let recentClicks = [];
  let allowNextClick = false;
  
  function isRecentClick(x, y, timeMs = 1000) {
    const now = Date.now();
    return recentClicks.some(click => 
      Math.abs(click.x - x) < 50 && 
      Math.abs(click.y - y) < 50 && 
      (now - click.time) < timeMs
    );
  }
  
  function addClick(x, y) {
    const now = Date.now();
    recentClicks.push({ x, y, time: now });
    // Clean old clicks
    recentClicks = recentClicks.filter(click => (now - click.time) < 2000);
  }
  
  // Very selective blocking function
  function selectiveBlockEvents(e) {
    if (!isScreenLocked) return;
    
    // Always allow interactions with our custom UI elements
    let target = e.target;
    while (target && target !== document) {
      if (target.id === 'picker' ||
          target.id === 'lock-button' ||
          target.id === 'lock-container' ||
          target.closest('#picker') ||
          target.closest('#lock-container') ||
          target.classList.contains('texture-item') ||
          target.classList.contains('lock-button')) {
        return true; // Allow the event
      }
      target = target.parentNode;
    }
    
    // Block mouse wheel (zoom) but allow everything else to go through initially
    if (e.type === 'wheel') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // For canvas events, be more permissive
    if (e.target === canvas || e.target.tagName === 'CANVAS') {
      
      // Track clicks for pattern detection
      if (e.type === 'click') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if this is a repeated click in the same area (likely teleportation attempt)
        if (isRecentClick(x, y, 500)) {
          // This might be spam clicking for teleportation - block it
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        
        addClick(x, y);
        
        // Allow the first click in any area (might be UI interaction)
        return true;
      }
      
      // Allow all mouse movements and other interactions
      return true;
    }
    
    // Allow all other events by default
    return true;
  }
  
  // Add minimal event blocking - only wheel events and spam clicks
  canvas.addEventListener('wheel', selectiveBlockEvents, true);
  canvas.addEventListener('click', selectiveBlockEvents, true);
  
  // Also block document-level wheel to prevent zooming
  document.addEventListener('wheel', selectiveBlockEvents, true);
  
  // Store the handler for cleanup
  window._blockMovementHandler = selectiveBlockEvents;
}

// Remove movement blocking
function removeMovementBlocker() {
  if (!window._blockMovementHandler) return;
  
  const canvas = document.querySelector('canvas');
  const handler = window._blockMovementHandler;
  
  // Remove the minimal event listeners
  if (canvas) {
    canvas.removeEventListener('wheel', handler, true);
    canvas.removeEventListener('click', handler, true);
  }
  
  document.removeEventListener('wheel', handler, true);
  
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
    ' ', // Space
    'Shift', 'Control'
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
    // If viewer is not yet available, try again after a delay
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
      
      // Only process MaterialPicker events
      if (key.startsWith("MaterialPicker:")) {
        // Parse the key to get the material name (removing the "MaterialPicker:" prefix)
        const material = key.replace("MaterialPicker:", "");
        
        // Update the selection object with the material picker selection
        window.selection = {
          material: material,
          texture: value
        };
        // Send the updated selection to the parent window
        sendSelectionUpdate();
      }
    });
  }
  
  // Handle messages from parent window
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'GET_SELECTION') {
      // Send the current selection to the parent window
      sendSelectionUpdate();
    }
  });
}
