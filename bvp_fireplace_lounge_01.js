function initViewer() {
  setTimeout(() => {
    const viewer = WALK.getViewer();
    window.viewer = viewer;

    viewer.setMaterialEditable([]);
    
    let sofaSelectionApplied = false;

    viewer.onNodeTypeClicked(function(node) {
      console.log("node", node);


      const nodeType = (typeof node.type === "function") ? node.type() : node.type;
      const transform = viewer.getNodeTransform(node);
      console.log(`NodeType: ${nodeType}, Position: ${transform.position}`);

      console.log("Sending node type:", nodeType);

      if (nodeType) {
        window.parent.postMessage(
          {
            type: "SELECT_FROM_SCENE_CLICK",
            payload: {
              nodeType: nodeType
            }
          },
          "*"
        );
      } else {
        console.warn("Node type was undefined.");
      }

    });

    window.parent.postMessage(
      { type: '56C8AB6F-5F86-441A-9E7B-84CF4A81CDC9', payload: {} },
      "*"
    );
  }, 2000);
}

window.addEventListener("message", function(e) {
  if (e.data && 'FC9B8633-FB7E-4CDB-B9B4-9C7402805EB8' === e.data.type) {
    console.log("Skipping setMaterialEditable to suppress default material picker.");
  } else if (e.data && 'B3331D7E-5FEA-4763-959F-BB468F7A2252' === e.data.type) {
    console.log("NODES_EDITABLE", e.data);
    e.data.nodes.forEach(node => {
      window.viewer.setNodeTypeEditable(node);
    });
    window.viewer.setMaterialEditable([]);
  } else if (e.data && '0047F251-C4C9-4163-BD66-E78E2096AB0B' === e.data.type) {
    window.viewer.switchToView(e.data.view);
  } else if (e.data && '980A9415-2888-4596-BDB0-37DE9CA99702' === e.data.type) {
    for (const nodeName of e.data.nodesTohide) {
      for (const node of window.viewer.findNodesOfType(nodeName)) {
        node.hide();
      }
    }
    for (const node of window.viewer.findNodesOfType(e.data.node)) {
      node.show();
    }
    window.viewer.requestFrame();
  } else if (e.data && '22D78DEB-39B2-4DB4-A560-5B0C143B02F8' === e.data.type) {
    const material = window.viewer.findMaterial(e.data.material);
    for (const node of window.viewer.findNodesOfType(e.data.node)) {
      window.viewer.setMaterialForMesh(material, node.mesh);
    }
    window.viewer.requestFrame();
  }
});

document.addEventListener("DOMContentLoaded", function() {
  initViewer();
});
