function initViewer() {
  setTimeout(() => {
    const viewer = WALK.getViewer();
    window.viewer = viewer;

    viewer.setMaterialEditable([]);
    
    // Create a container div to hold labels on top of the canvas
    const labelsContainer = document.createElement('div');
    labelsContainer.id = 'labels-container';
    labelsContainer.style.position = 'absolute';
    labelsContainer.style.top = '0';
    labelsContainer.style.left = '0';
    labelsContainer.style.pointerEvents = 'none'; // Allow clicks to pass through by default
    labelsContainer.style.width = '100%';
    labelsContainer.style.height = '100%';
    document.body.appendChild(labelsContainer);

    // Define hotspots with pre-measured positions from scene.json
    const hotspots = [
      {
        id: 'Floor_Living_003',
        position: [2.0, 0.05, -3.5],
        icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
      },
      {
        id: 'sofa',
        position: [1.0, 0.6, -2.0],
        icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
      },
      {
        id: 'Liv_wall_001',
        position: [1.5, 1.5, -4.0],
        icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png'
      }
      // Add more as needed
    ];

    // Create HTML elements for each hotspot
    hotspots.forEach(hs => {
      const div = document.createElement('div');
      div.className = 'custom-label';
      div.style.position = 'absolute';
      div.style.width = '32px';
      div.style.height = '32px';
      div.style.pointerEvents = 'auto'; // So this element *can* be clicked
      div.style.cursor = 'pointer';
      div.innerHTML = `<img src="${hs.icon}" style="width:32px;height:32px;">`;
      div.onclick = () => {
        console.log(`Custom picker clicked: ${hs.id}`);
        window.parent.postMessage(
          {
            type: "SELECT_FROM_SCENE_CLICK",
            payload: { nodeType: hs.id }
          },
          "*"
        );
      };
      hs.element = div;
      labelsContainer.appendChild(div);
    });

    // Animate: reposition hotspots each frame
    viewer.onFrameViewer(() => {
      const camera = viewer.getCamera();
      hotspots.forEach(hs => {
        // Convert 3D to 2D screen coordinates
        const screenPos = camera.worldToScreen(hs.position);

        if (screenPos) {
          hs.element.style.display = "block";
          hs.element.style.left = `${screenPos[0] - 16}px`; // Center icon
          hs.element.style.top = `${screenPos[1] - 16}px`;
        } else {
          // Behind the camera
          hs.element.style.display = "none";
        }
      });
    });


    viewer.onNodeTypeClicked(function(node) {
      console.log("node", node);


      const nodeType = (typeof node.type === "function") ? node.type() : node.type;

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
