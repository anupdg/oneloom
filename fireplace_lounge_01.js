

function loadCoverJsonWithAjax() {
  const xhr = new XMLHttpRequest();
  const url = 'https://3d.oneloomxr.com/cover.json';

  xhr.open('GET', url, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (Array.isArray(data.extensions)) {
            handleExtensions(data.extensions);
          } else {
            console.warn('No valid extensions array found');
          }
        } catch (err) {
          console.error('Failed to parse JSON:', err);
        }
      } else {
        console.error('Failed to load cover.json. Status:', xhr.status);
      }
    }
  };

  xhr.send();
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

e = WALK.getViewer();

// Ensure this runs once scene is ready
e.onSceneReadyToDisplay(() => {
  console.log('Shapespark scene ready');
  loadExtensionsFromCoverJson();
});
