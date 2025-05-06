const viewer = WALK.getViewer();

// THEN attach event hooks like this
viewer.onSceneReadyToDisplay(() => {
  const editableMaterials = viewer.getEditableMaterials();
editableMaterials.forEach(materialName => {
  viewer.setMaterialEditable(materialName);
  console.log(`Material made editable: ${materialName}`);
});
});
