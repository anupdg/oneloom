

async function loadExtensionsFromCoverJson() {
  try {
    const response = await fetch('../cover.json'); // Use correct relative path
    const data = await response.json();

    if (!data.extensions || !Array.isArray(data.extensions)) {
      console.warn('No extensions found in cover.json');
      return;
    }

    const extensions = data.extensions;
    processExtensions(extensions);
  } catch (err) {
    console.error('Failed to load or parse cover.json:', err);
  }
}

function processExtensions(extensions) {
  console.log('Extensions:', extensions);

  extensions.forEach(ext => {
    if (!ext.enabled) return;

    switch (ext.type) {
      case 'MaterialPicker':
        setupMaterialPicker(ext);
        break;
      case 'SwitchObjects':
        setupSwitchObjects(ext);
        break;
      case 'Audio':
        setupAudio(ext);
        break;
      case 'HideAnchors':
        setupHideAnchors(ext);
        break;
      default:
        console.warn('Unknown extension type:', ext.type);
    }
  });
}

// Example handler implementations
function setupMaterialPicker(ext) {
  console.log('MaterialPicker:', ext.name);
  // implement logic using WALK API, for example
  // viewer.setMaterialForNode(...)
}

function setupSwitchObjects(ext) {
  console.log('SwitchObjects:', ext.name);
  // Hide/show or cycle through ext.nodeTypes
}

function setupAudio(ext) {
  console.log('Audio setup:', ext.file?.path);
  // Use WALK API audio playback if needed
}

function setupHideAnchors(ext) {
  console.log('Hide anchors triggered:', ext.name);
  // Walk viewer API for anchor visibility control
}

// Ensure this runs once scene is ready
walk.ready.then(() => {
  console.log('Shapespark scene ready');
  loadExtensionsFromCoverJson();
});
