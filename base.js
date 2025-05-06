const viewer = WALK.getViewer();

// Hook to run before the scene starts loading
viewer.onSceneReadyToLoad(() => {
  const allEditableMaterials = viewer.getEditableMaterials();

  allEditableMaterials.forEach(materialName => {
    viewer.setMaterialEditable(materialName);
    console.log(`Material made editable: ${materialName}`);
  });
});

