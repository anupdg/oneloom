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
        
        // Check if position has changed significantly 
        const hasMovedPosition = 
          Math.abs(currentPos.x - lockedPosition.x) > 0.03 || 
          Math.abs(currentPos.y - lockedPosition.y) > 0.03 || 
          Math.abs(currentPos.z - lockedPosition.z) > 0.03;
        
        // If position changed significantly, reset it immediately but preserve rotation
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
    }, 25); // Check every 25ms for good balance between responsiveness and performance
    
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

// Setup selective movement blocking - prevent teleportation flicker while preserving UI
function setupMovementBlocker() {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    console.error('Canvas not found');
    return;
  }
  
  // Track mouse state and recent interactions
  let mouseDownTime = 0;
  let mouseDownPos = null;
  let isDragging = false;
  let lastClickTime = 0;
  let recentMovementAttempts = 0;
  let blockingActive = false;
  
  // Smart blocking function that learns from user behavior
  function smartPreventTeleportation(e) {
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
    
    // Always block mouse wheel (zoom)
    if (e.type === 'wheel') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // For canvas events, use smart detection
    if (e.target === canvas || e.target.tagName === 'CANVAS') {
      
      // Track mouse down
      if (e.type === 'mousedown') {
        mouseDownTime = Date.now();
        mouseDownPos = { x: e.clientX, y: e.clientY };
        isDragging = false;
        blockingActive = false;
        return true; // Always allow mousedown
      }
      
      // Track mouse movement to detect dragging (rotation)
      if (e.type === 'mousemove' && mouseDownPos) {
        const distance = Math.sqrt(
          Math.pow(e.clientX - mouseDownPos.x, 2) + 
          Math.pow(e.clientY - mouseDownPos.y, 2)
        );
        if (distance > 3) { // Lower threshold for drag detection
          isDragging = true;
        }
        return true; // Always allow mouse move
      }
      
      // Handle mouse up - be more permissive
      if (e.type === 'mouseup') {
        mouseDownPos = null;
        return true; // Allow mouse up
      }
      
      // Handle clicks with smart detection
      if (e.type === 'click') {
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;
        lastClickTime = now;
        
        // If user is clicking very quickly (spam clicking), start blocking
        if (timeSinceLastClick < 500) {
          recentMovementAttempts++;
          if (recentMovementAttempts >= 2) {
            blockingActive = true;
          }
        } else {
          // Reset counter for slow clicks
          recentMovementAttempts = 0;
          blockingActive = false;
        }
        
        // If this was clearly a drag operation, allow it
        if (isDragging) {
          return true;
        }
        
        // If blocking is active (user has been spam clicking), block it
        if (blockingActive) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        
        // For the first click or slow clicks, allow them (might be UI)
        // But set a timer to check if movement occurred
        setTimeout(() => {
          // Check if this click caused unwanted movement
          if (isScreenLocked && lockedPosition) {
            const currentPos = WALK.getViewer().getCameraPosition();
            const hasMovedSignificantly = 
              Math.abs(currentPos.x - lockedPosition.x) > 0.1 || 
              Math.abs(currentPos.y - lockedPosition.y) > 0.1 || 
              Math.abs(currentPos.z - lockedPosition.z) > 0.1;
            
            if (hasMovedSignificantly) {
              // This click caused movement, so increase blocking sensitivity
              recentMovementAttempts += 2;
              blockingActive = true;
            }
          }
        }, 50); // Check after 50ms
        
        return true; // Allow the click initially
      }
      
      // Block double clicks more aggressively
      if (e.type === 'dblclick') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
    
    return true;
  }
  
  // Add event listeners with the smart approach
  canvas.addEventListener('wheel', smartPreventTeleportation, true);
  canvas.addEventListener('click', smartPreventTeleportation, true);
  canvas.addEventListener('dblclick', smartPreventTeleportation, true);
  canvas.addEventListener('mousedown', smartPreventTeleportation, false);
  canvas.addEventListener('mouseup', smartPreventTeleportation, false);
  canvas.addEventListener('mousemove', smartPreventTeleportation, false);
  
  // Block document-level events
  document.addEventListener('wheel', smartPreventTeleportation, true);
  document.addEventListener('dblclick', smartPreventTeleportation, true);
  
  // Store the handler for cleanup
  window._blockMovementHandler = smartPreventTeleportation;
}

// Remove movement blocking
function removeMovementBlocker() {
  if (!window._blockMovementHandler) return;
  
  const canvas = document.querySelector('canvas');
  const handler = window._blockMovementHandler;
  
  // Remove all the event listeners
  if (canvas) {
    canvas.removeEventListener('wheel', handler, true);
    canvas.removeEventListener('click', handler, true);
    canvas.removeEventListener('dblclick', handler, true);
    canvas.removeEventListener('mousedown', handler, false);
    canvas.removeEventListener('mouseup', handler, false);
    canvas.removeEventListener('mousemove', handler, false);
  }
  
  document.removeEventListener('wheel', handler, true);
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
