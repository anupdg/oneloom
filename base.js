document.addEventListener('viewerloaded', () => {
  const viewer = WALK.getViewer();

  // Wait for the scene to load enough to access nodes and materials
  viewer.onSceneReadyToDisplay(() => {
    // 1. Log all editable materials
    const editableMaterials = viewer.getEditableMaterials();
    console.log('🎨 Editable Materials:', editableMaterials);

    // 2. Make all materials editable
    editableMaterials.forEach(name => {
      viewer.setMaterialEditable(name);
    });

    // 3. Log all mesh nodes
    const meshNodes = viewer.findNodesOfType('Mesh');
    console.log('🧱 Mesh Nodes:', meshNodes);
  });
});
