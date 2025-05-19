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
// const MATERIAL_NAME = "Floor";
const MATERIAL_NAME = "walls";

// 'Base','Wall plaster','Floor','Ceiling','Table'

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
  lockContainer.style.left = '20px';
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
    // Immediately create the overlay to prevent any movement during the lock process
    createMovementBlockerOverlay();
    
    // Get the current position and rotation values
    const currentPos = viewer.getCameraPosition();
    const currentRot = viewer.getCameraRotation();
    
    // Create deep copies of position and rotation to ensure we don't have reference issues
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
    
    console.log('Locking camera at exact position:', { 
      position: { x: lockedPosition.x, y: lockedPosition.y, z: lockedPosition.z },
      rotation: { yaw: lockedRotation.yaw, pitch: lockedRotation.pitch, roll: lockedRotation.roll }
    });
    
    // Create a custom view definition with exact position/rotation values
    let customView = {};
    
    try {
      // Try to create a WALK.View if available
      if (typeof WALK.View === 'function') {
        customView = new WALK.View();
        customView.position = lockedPosition;
        customView.rotation = lockedRotation;
      } else {
        // Or create a plain object if WALK.View isn't available
        customView = {
          position: lockedPosition,
          rotation: lockedRotation
        };
      }
      console.log('Created precise view at current position');
    } catch (e) {
      console.error('Error creating View object:', e);
      // Fall back to a simple object
      customView = {
        position: lockedPosition,
        rotation: lockedRotation
      };
    }
    
    // Store the view for later use
    window._lockedCustomView = customView;
    
    // Disable mouse and keyboard events on the viewer if possible
    if (viewer.canvas) {
      viewer.canvas.style.pointerEvents = 'none';
    }
    
    // Create interval to ensure position is maintained (helpful for some Shapespark versions)
    if (window._lockInterval) {
      clearInterval(window._lockInterval);
    }
    
    window._lockInterval = setInterval(() => {
      try {
        // Force the camera to stay at our locked position
        if (typeof viewer.switchToView === 'function') {
          viewer.switchToView(window._lockedCustomView, 0); // instant switch
        }
      } catch (e) {
        console.error('Error in position enforcement:', e);
      }
    }, 50); // Check frequently (50ms)
    
    // Update the lock button to show locked state
    const lockButton = document.getElementById('lock-button');
    lockButton.classList.add('locked');
    
    // Update state
    isScreenLocked = true;
    
    console.log('Screen locked at exact current position');
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
      console.log('Stopped position enforcement');
    }
    
    // Re-enable navigation if we disabled it
    if (viewer.navigation && typeof viewer.navigation.enabled !== 'undefined') {
      viewer.navigation.enabled = true;
      console.log('Re-enabled navigation');
    }
    
    // Remove the overlay
    removeMovementBlockerOverlay();
    
    // Update the lock button to show unlocked state
    const lockButton = document.getElementById('lock-button');
    lockButton.classList.remove('locked');
    
    // Update state
    isScreenLocked = false;
    
    // Clear stored position
    lockedPosition = null;
    lockedRotation = null;
    
    console.log('Screen unlocked');
  } catch (error) {
    console.error('Error unlocking screen:', error);
  }
}

// Function to create a transparent overlay to block movements
function createMovementBlockerOverlay() {
  // Remove any existing overlay first
  removeMovementBlockerOverlay();
  
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.id = 'movement-blocker-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'transparent';
  overlay.style.zIndex = '999';
  overlay.style.cursor = 'not-allowed';
  
  // Add event listeners to prevent interactions
  function blockEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  
  overlay.addEventListener('mousedown', blockEvent, true);
  overlay.addEventListener('mousemove', blockEvent, true);
  overlay.addEventListener('mouseup', blockEvent, true);
  overlay.addEventListener('wheel', blockEvent, true);
  overlay.addEventListener('touchstart', blockEvent, true);
  overlay.addEventListener('touchmove', blockEvent, true);
  overlay.addEventListener('touchend', blockEvent, true);
  
  // Find the canvas and add the overlay as a sibling
  const canvas = document.querySelector('canvas');
  if (canvas && canvas.parentNode) {
    canvas.parentNode.appendChild(overlay);
    console.log('Created movement blocker overlay');
    
    // Make sure our lock button stays on top
    const lockContainer = document.getElementById('lock-container');
    if (lockContainer) {
      lockContainer.style.zIndex = '1001';
    }
  } else {
    console.error('Could not find canvas element to block');
  }
}

// Function to remove the movement blocker overlay
function removeMovementBlockerOverlay() {
  const overlay = document.getElementById('movement-blocker-overlay');
  if (overlay) {
    overlay.parentNode.removeChild(overlay);
    console.log('Removed movement blocker overlay');
  }
}

// Function to add CSS for the lock button


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
      console.log(response.json());
      return response.json();
    })
    .then(config => {
      materialsConfig = config;
      loadTexturesForMaterial(MATERIAL_NAME);
    })
    .catch(error => {
      console.error('Error loading materials config:', error);
      loadTexturesForMaterial(MATERIAL_NAME);
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
  window.parent.postMessage({
    type: 'SELECTION_UPDATE',
    payload: {
      selection: window.selection
    }
  }, '*');  // In production, replace '*' with your actual origin
  
  // Force the frame to be rendered
  viewer.requestFrame();
}

// Initialize the viewer
function initViewer() {
  const viewer = WALK.getViewer();
  if (!viewer) {
    // If viewer is not yet available, try again after a delay
    setTimeout(initViewer, 500);
    return;
  }
  
  console.log("Shapespark viewer initialized");
  
  // Set hardcoded material as editable
  viewer.setMaterialEditable(MATERIAL_NAME);
  
  // Load materials configuration and initialize UI
  loadMaterialsConfig();
  
  // Handle messages from parent window
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'GET_SELECTION') {
      // Send the current selection to the parent window
      window.parent.postMessage({
        type: 'SELECTION_UPDATE',
        payload: {
          selection: window.selection
        }
      }, '*');
    }
  });
}
