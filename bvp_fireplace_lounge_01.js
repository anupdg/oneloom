function initViewer() {
  // window.viewer = WALK.getViewer();

  // if (!window.viewer) {
  //   window.viewer = WALK.getViewer();
  // }

  const viewer = WALK.getViewer();



  const existingHandler = viewer.onSceneReadyToDisplay;

  // Safely combine the default handler + your logic
  viewer.onSceneReadyToDisplay = () => {
    // Call the built-in handler to initialize UI
    if (typeof existingHandler === "function") {
      existingHandler();
    }

    // Your custom logic
    viewer.onNodeTypeClicked(function(node) {
      console.log("node", node);
    });

    window.parent.postMessage(
      { type: '56C8AB6F-5F86-441A-9E7B-84CF4A81CDC9', payload: {} },
      "*"
    );
  };

  // Store the viewer reference for message handlers
  window._customViewer = viewer;
}

window.addEventListener("message", function (e) {

  const viewer = window._customViewer || window.getViewer();

  if (!viewer) {
    console.warn("Viewer not initialized yet.");
    return;
  }

  if(e.data && 'FC9B8633-FB7E-4CDB-B9B4-9C7402805EB8' === e.data.type){
    console.log("MATERIALS_EDITABLE", e.data)
    e.data.extensions.forEach(materialName => {
      viewer.setMaterialEditable(materialName);
    });
  }else if(e.data && 'B3331D7E-5FEA-4763-959F-BB468F7A2252' === e.data.type){
    console.log("NODES_EDITABLE", e.data)
    e.data.nodes.forEach(node => {
      viewer.setNodeTypeEditable(node);
    });
  } else if(e.data && '0047F251-C4C9-4163-BD66-E78E2096AB0B' === e.data.type){
    viewer.switchToView(e.data.view);
  }else if(e.data && '980A9415-2888-4596-BDB0-37DE9CA99702' === e.data.type){
    for (const nodeName of e.data.nodesTohide) {
      for (const node of viewer.findNodesOfType(nodeName)) {
        node.hide();  
      }
    }
    for (const node of viewer.findNodesOfType(e.data.node)) {
      node.show();  
    }
    // window.viewer.requestFrame();
  }else if(e.data && '22D78DEB-39B2-4DB4-A560-5B0C143B02F8' === e.data.type){
    const material = viewer.findMaterial(e.data.material);
    for (const node of viewer.findNodesOfType(e.data.node)) {
      viewer.setMaterialForMesh(material, node.mesh)
    }
    // window.viewer.requestFrame();
  }
})

document.addEventListener("DOMContentLoaded", initViewer);
