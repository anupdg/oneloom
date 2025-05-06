const viewer = WALK.getViewer();

viewer.onSceneLoadComplete(() => {
  const editableMaterials = viewer.getEditableMaterials();

  if (!editableMaterials) {
    console.error("❌ editableMaterials is null");
    return;
  }

  editableMaterials.forEach(materialName => {
    viewer.setMaterialEditable(materialName);
    console.log(`✅ Editable: ${materialName}`);
  });
});
