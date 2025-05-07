
// Initialize the global selection object
window.selection = {};

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Function to initialize viewer interaction once it's available
  function initViewer() {
    // Try to get the viewer
    const viewer = WALK.getViewer();
    
    if (!viewer) {
      // If viewer is not yet available, try again after a short delay
      setTimeout(initViewer, 500);
      return;
    }
    
    console.log("Shapespark viewer initialized");
    
    // Set up state change listener
    viewer.onApiUserStateChanged(function(key, value) {
      // Parse the key to get the category (removing the "MaterialPicker:" prefix)
      const category = key.replace("MaterialPicker:", "");
      
      // Update the selection object
      window.selection[category] = value;
      
      console.log("Material changed:", category, value);
      
      // Send the updated selection to the parent window
      window.parent.postMessage({
        type: 'SELECTION_UPDATE',
        payload: {
          selection: window.selection
        }
      }, '*');  // In production, replace '*' with your actual origin
    });
  }
  
  // Start initialization
  initViewer();
});
