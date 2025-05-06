const viewer = WALK.getViewer();

viewer.whenSceneReady().then(() => {
  const editableMaterials = viewer.getEditableMaterials();

  editableMaterials.forEach(materialName => {
    viewer.setMaterialEditable(materialName);
    console.log(`Material made editable: ${materialName}`);
  });

  // Safe to add picker listeners, apply materials, etc. here
});
