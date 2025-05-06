const viewer = WALK.getViewer();

viewer.onSceneReadyToDisplay(() => {
  const editableMaterials = viewer.getEditableMaterials();

  editableMaterials.forEach(materialName => {
    viewer.setMaterialEditable(materialName);
    console.log(`✅ Material made editable: ${materialName}`);
  });

  // You can now safely listen to material pickers or apply materials
});
