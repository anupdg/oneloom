const viewer = WALK.getViewer();

// Call this IMMEDIATELY after viewer creation
const editableMaterials = viewer.getEditableMaterials();
editableMaterials.forEach(materialName => {
  viewer.setMaterialEditable(materialName);
  console.log(`Material made editable: ${materialName}`);
});

// THEN attach event hooks like this
viewer.onSceneReadyToDisplay(() => {
  console.log('Scene is ready!');
  // You can now interact with the materials or UI
});
