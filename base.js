const viewer = WALK.getViewer();

// ✅ This MUST come immediately — BEFORE any load events
const editableMaterials = viewer.getEditableMaterials();
editableMaterials.forEach(materialName => {
  viewer.setMaterialEditable(materialName);
  console.log(`Material made editable: ${materialName}`);
});

// Optional: After the scene has loaded, you can now react to interactions
viewer.onSceneLoadComplete(() => {
  console.log('Scene loaded and ready');
});
