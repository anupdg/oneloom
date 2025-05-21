// Initialize the global selection object
window.selection = {
  material: null,
  texture: null
};

// Store materials configuration
let materialsConfig = null;

// Store textures cache
const textureCache = {};

// Hardcoded material name - change this when needed
// const MATERIAL_NAME = "Wall plaster";
const MATERIAL_NAME = "ceiling";

// Variable to track locked state
let isScreenLocked = false;

// Variable to store the position when locked
let lockedPosition = null;
let lockedRotation = null;

// Function to create the texture picker UI
function createPickerUI() {
  // Create the main container
  const picker = document.createElement('div');
  picker.id = 'picker';
  picker.className = 'collapsed';

  // Add positioning styles
  picker.style.position = 'absolute';
  picker.style.top = '30%';  // Position it above the middle
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
  lockContainer.style.top  = '50%';
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

// Function to lock the screen
function lockScreen() {
  const viewer = WALK.getViewer();
  if (!viewer) {
    console.error('Viewer not available');
    return;
  }
  
  try {
    // Get the current position and rotation values
    const currentPos = viewer.getCameraPosition();
    const currentRot = viewer.getCameraRotation();
    
    // Create deep copies of position and rotation
    lockedPosition = {
      x: currentPos.x,
      y: currentPos.y,
      z: currentPos.z,
      clone: function() { return { x: this.x, y: this.y, z: this.z }; },
      distanceTo: function(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const dz = this.z - other.z;
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
      }
    };
    
    lockedRotation = {
      yaw: currentRot.yaw,
      pitch: currentRot.pitch,
      roll: currentRot.roll,
      clone: function() { return { yaw: this.yaw, pitch: this.pitch, roll: this.roll }; }
    };
    
    // Store current view name if available
    window._lockedViewName = null;
    try {
      // Try to get the current view name if this information is available
      if (viewer.getCurrentViewName) {
        window._lockedViewName = viewer.getCurrentViewName();
      }
    } catch (e) {
      console.error('Error getting current view name:', e);
    }
    
    // IMPORTANT: Track when view transitions are happening
    window._isViewTransitioning = false;
    
    // Hook into view switch events if available
    if (typeof viewer.onViewSwitchStarted === 'function') {
      // Create a tracking function to catch view switch events
      window._viewSwitchStartedHandler = function(viewName) {
        window._isViewTransitioning = true;
        window._lockedViewName = viewName; // Update the target view name
        console.log('View transition started to:', viewName);
      };
      
      viewer.onViewSwitchStarted(window._viewSwitchStartedHandler);
    }
    
    if (typeof viewer.onViewSwitchDone === 'function') {
      // Create a function to update our position when a view switch is done
      window._viewSwitchDoneHandler = function(viewName) {
        window._isViewTransitioning = false;
        
        // Update our locked position and rotation to the new view
        const newPos = viewer.getCameraPosition();
        const newRot = viewer.getCameraRotation();
        
        // Update the locked position
        lockedPosition.x = newPos.x;
        lockedPosition.y = newPos.y;
        lockedPosition.z = newPos.z;
        
        // Update the locked rotation
        lockedRotation.yaw = newRot.yaw;
        lockedRotation.pitch = newRot.pitch;
        lockedRotation.roll = newRot.roll;
        
        // Create a new custom view based on the new position
        try {
          if (typeof WALK.View === 'function') {
            window._lockedCustomView = new WALK.View();
            window._lockedCustomView.position = lockedPosition;
            window._lockedCustomView.rotation = lockedRotation;
          } else {
            window._lockedCustomView = {
              position: lockedPosition,
              rotation: lockedRotation
            };
          }
        } catch (e) {
          console.error('Error creating view object after transition:', e);
          window._lockedCustomView = {
            position: lockedPosition,
            rotation: lockedRotation
          };
        }
        
        console.log('View transition completed to:', viewName);
      };
      
      viewer.onViewSwitchDone(window._viewSwitchDoneHandler);
    }
    
    // Create a custom view definition
    let customView = {};
    
    try {
      if (typeof WALK.View === 'function') {
        customView = new WALK.View();
        customView.position = lockedPosition;
        customView.rotation = lockedRotation;
      } else {
        customView = {
          position: lockedPosition,
          rotation: lockedRotation
        };
      }
    } catch (e) {
      console.error('Error creating View object:', e);
      customView = {
        position: lockedPosition,
        rotation: lockedRotation
      };
    }
    
    // Store the view for later use
    window._lockedCustomView = customView;
    
    // Instead of setting pointerEvents='none' which disables all interactions,
    // we'll use a more targeted approach to maintain UI functionality
    
    // Find the room selector buttons and make sure they stay interactive
    const roomButtons = document.querySelectorAll('.view-menu a, [data-view], [data-viewid], [data-roomid]');
    roomButtons.forEach(button => {
      if (button) button.style.zIndex = '2000';
    });
    
    // Setup canvas event handlers instead of using an overlay
    setupCanvasEventHandlers();
    
    // Create a more aggressive position enforcement that respects view transitions
    if (window._lockInterval) {
      clearInterval(window._lockInterval);
    }
    
    // Use a frequent interval to enforce position
    window._lockInterval = setInterval(() => {
      try {
        // If we're in the middle of a view transition, don't enforce position
        if (window._isViewTransitioning) {
          return;
        }
        
        // Force the camera to stay exactly at our locked position
        if (typeof viewer.switchToView === 'function') {
          viewer.switchToView(window._lockedCustomView, 0); // instant switch
        }
        
        // Additional enforcement - directly set position and rotation if possible
        if (viewer.camera) {
          if (viewer.camera.position) {
            viewer.camera.position.x = lockedPosition.x;
            viewer.camera.position.y = lockedPosition.y;
            viewer.camera.position.z = lockedPosition.z;
          }
          
          if (viewer.camera.rotation) {
            viewer.camera.rotation.x = lockedRotation.pitch;
            viewer.camera.rotation.y = lockedRotation.yaw;
            viewer.camera.rotation.z = lockedRotation.roll;
          }
        }
      } catch (e) {
        console.error('Error in position enforcement:', e);
      }
    }, 20); // Slightly longer interval to reduce CPU usage
    
    // Try to disable keyboard movement as well by installing a keyboard event handler
    document.addEventListener('keydown', blockNavigationKeys);
    
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
    // Clear the interval that enforces position
    if (window._lockInterval) {
      clearInterval(window._lockInterval);
      window._lockInterval = null;
    }
    
    // Remove event handlers
    removeCanvasEventHandlers();
    
    // Remove keyboard event handler
    document.removeEventListener('keydown', blockNavigationKeys);
    
    // Remove view switch handlers
    if (typeof viewer.onViewSwitchStarted === 'function' && window._viewSwitchStartedHandler) {
      // Remove the handler (if the API supports this)
      try {
        viewer.offViewSwitchStarted(window._viewSwitchStartedHandler);
      } catch (e) {
        // Some versions might not support 'off' methods, so we'll just swallow the error
      }
      window._viewSwitchStartedHandler = null;
    }
    
    if (typeof viewer.onViewSwitchDone === 'function' && window._viewSwitchDoneHandler) {
      // Remove the handler (if the API supports this)
      try {
        viewer.offViewSwitchDone(window._viewSwitchDoneHandler);
      } catch (e) {
        // Some versions might not support 'off' methods, so we'll just swallow the error
      }
      window._viewSwitchDoneHandler = null;
    }
    
    // Re-enable controls if they exist
    if (viewer.controls && typeof viewer.controls.enabled !== 'undefined') {
      viewer.controls.enabled = true;
    }
    
    // Re-enable navigation if it exists
    if (viewer.navigation && typeof viewer.navigation.enabled !== 'undefined') {
      viewer.navigation.enabled = true;
    }
    
    // Update the lock button to show unlocked state
    const lockButton = document.getElementById('lock-button');
    if (lockButton) {
      lockButton.classList.remove('locked');
    }
    
    // Update state
    isScreenLocked = false;
    
    // Clear stored position
    lockedPosition = null;
    lockedRotation = null;
    window._lockedCustomView = null;
    window._lockedViewName = null;
    window._isViewTransitioning = false;
  } catch (error) {
    console.error('Error unlocking screen:', error);
  }
}

// Block navigation keys
function blockNavigationKeys(e) {
  // Only block if screen is locked
  if (!isScreenLocked) return;
  
  // List of key codes used for navigation
  const navigationKeys = [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', // Arrow keys
    'w', 'a', 's', 'd', 'W', 'A', 'S', 'D',           // WASD
    ' '                                               // Space (jump)
  ];
  
  if (navigationKeys.includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}

// Setup canvas event handlers instead of using an overlay
function setupCanvasEventHandlers() {
  // Find the canvas
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }
  
  // Store original event handlers if needed
  window._originalPointerEvents = canvas.style.pointerEvents;
  
  // Add a property to track that we're in locked mode
  canvas._lockHandlersInstalled = true;
  
  // Function to intercept and block navigation events on the canvas
  function blockNavigation(e) {
    // Get the target element
    const target = e.target;
    
    // Check if the target is a UI element that should still work
    // This includes room selector buttons, material pickers, etc.
    const isUIElement = target.closest('.view-menu') || 
                        target.closest('[data-view]') || 
                        target.closest('[data-viewid]') || 
                        target.closest('[data-roomid]') || 
                        target.closest('.material-picker') || 
                        target.closest('#picker') ||
                        target.closest('#lock-container');
    
    // If it's a UI element, allow the event to pass through
    if (isUIElement) {
      return true;
    }
    
    // Otherwise, block the event to prevent camera movement
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  
  // Install handlers directly on the canvas
  canvas.addEventListener('mousedown', blockNavigation, true);
  canvas.addEventListener('mousemove', blockNavigation, true);
  canvas.addEventListener('mouseup', blockNavigation, true);
  canvas.addEventListener('wheel', blockNavigation, true);
  canvas.addEventListener('touchstart', blockNavigation, true);
  canvas.addEventListener('touchmove', blockNavigation, true);
  canvas.addEventListener('touchend', blockNavigation, true);
  
  // Store references to the handlers for later removal
  canvas._blockNavigation = blockNavigation;
  
  // We'll use a targeted approach instead of making the entire canvas click-through
  // This allows the UI elements to work while still blocking camera movement
  
  // Additionally, try to target the actual Shapespark navigation component if it exists
  const viewer = WALK.getViewer();
  if (viewer && viewer.navigation) {
    // Try different approaches to disable navigation
    if (typeof viewer.navigation.enabled !== 'undefined') {
      // Don't completely disable navigation as it may affect view switching
      // Instead, we'll rely on the position enforcement
    }
  }
  
  // Make sure UI elements like room selectors are elevated and clickable
  document.querySelectorAll('.view-menu, [data-view], [data-viewid], [data-roomid], .material-picker, #picker, #lock-container').forEach(el => {
    if (el) {
      el.style.zIndex = '2000';
      el.style.pointerEvents = 'auto';
    }
  });
}

// Remove the canvas event handlers
function removeCanvasEventHandlers() {
  const canvas = document.querySelector('canvas');
  if (!canvas || !canvas._lockHandlersInstalled) {
    return;
  }
  
  // Remove the handlers
  if (canvas._blockNavigation) {
    canvas.removeEventListener('mousedown', canvas._blockNavigation, true);
    canvas.removeEventListener('mousemove', canvas._blockNavigation, true);
    canvas.removeEventListener('mouseup', canvas._blockNavigation, true);
    canvas.removeEventListener('wheel', canvas._blockNavigation, true);
    canvas.removeEventListener('touchstart', canvas._blockNavigation, true);
    canvas.removeEventListener('touchmove', canvas._blockNavigation, true);
    canvas.removeEventListener('touchend', canvas._blockNavigation, true);
  }
  
  // Restore original pointer events
  canvas.style.pointerEvents = window._originalPointerEvents || '';
  
  // Remove the tracking property
  canvas._lockHandlersInstalled = false;
  
  // Re-enable Shapespark navigation if it exists
  const viewer = WALK.getViewer();
  if (viewer && viewer.navigation) {
    if (typeof viewer.navigation.enabled !== 'undefined') {
      viewer.navigation.enabled = true;
    }
    
    if (viewer.navigation.domElement) {
      viewer.navigation.domElement.style.pointerEvents = '';
    }
  }
  
  // Reset z-index and pointer-events for UI elements
  document.querySelectorAll('.view-menu, [data-view], [data-viewid], [data-roomid], .material-picker, #picker, #lock-container').forEach(el => {
    if (el) {
      el.style.zIndex = '';
      el.style.pointerEvents = '';
    }
  });
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
  } else {
  }
  
  // Handle messages from parent window
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'GET_SELECTION') {
      // Send the current selection to the parent window
      sendSelectionUpdate();
    }
  });
}
