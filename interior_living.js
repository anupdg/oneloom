let anchorsFromMenu = [];

function applyCustomSofaTexture(imageUrl, node) {
  const sofaMaterialName = "FAB_1";
  window.viewer.setMaterialEditable(sofaMaterialName);

  const img = new window.Image();
  img.crossOrigin = "anonymous"; // REQUIRED if the image is loaded from another domain for WebGL

  img.onload = function () {
    const texture = window.viewer.createTextureFromHtmlImage(img);
    const material = window.viewer.findMaterial(sofaMaterialName);
    if (material) {
      material.baseColorTexture = texture;
      window.viewer.requestFrame(); // Force a re-render
    } else {
      console.error("Sofa material not found:", sofaMaterialName);
    }
  };
  img.onerror = function() {
    console.error("Failed to load image:", imageUrl);
  };

  img.src = imageUrl;
}



function initViewer() {
  window.viewer = WALK.getViewer();

  window.parent.postMessage({ type: '11AC52C9-D395-4B50-A0BE-B8F993218F8A' }, '*');

  const anchorIdToAnchor = new Map();

    function anchorClicked(anchor) {
      const config = anchorIdToAnchor.get(anchor);
      if (config) {
        console.log("Anchor clicked:", config.name);
        window.parent.postMessage(
          {
            type: "ANCHOR_CLICK",
            payload: {
              anchorId: config.name,
              tabType: config.tabType
            }
          },
          "*"
        );
      } else {
        console.warn("No config found for clicked anchor", anchor);
      }
    }


  function sceneReadyToDisplay() {
      window.viewer.anchorsVisible = false;
      
      const anchors = anchorsFromMenu.length > 0 ? anchorsFromMenu : [];
      anchors.forEach(anchorConfig => {
        const anchorObject = viewer.addAnchor(anchorConfig, anchorClicked);
        anchorIdToAnchor.set(anchorObject, anchorConfig);
      });
  }
  viewer.onSceneReadyToDisplay(sceneReadyToDisplay);
}

window.addEventListener("message", function (e) {
  if (e.data && "9BFBEC93-95BA-4CC4-996B-EB889F5C0E7C" === e.data.type) {
    console.log("inside custom texture postmessage");
    console.log(e.data.url, e.data.node);
    applyCustomSofaTexture(e.data.url);
  }
  if(e.data && 'FC9B8633-FB7E-4CDB-B9B4-9C7402805EB8' === e.data.type){
    console.log("MATERIALS_EDITABLE", e.data)
    e.data.extensions.forEach(materialName => {
      window.viewer.setMaterialEditable(materialName);
    });
  }else if(e.data && 'B615910B-0253-4334-B7FD-B9CFCFD3E155' === e.data.type){
    anchorsFromMenu = e.data.anchors;
  }else if(e.data && 'B3331D7E-5FEA-4763-959F-BB468F7A2252' === e.data.type){
    console.log("NODES_EDITABLE", e.data)
    e.data.nodes.forEach(node => {
      window.viewer.setNodeTypeEditable(node);
    });
  } else if(e.data && '0047F251-C4C9-4163-BD66-E78E2096AB0B' === e.data.type){
    this.window.viewer.switchToView(e.data.view);
  }else if(e.data && '980A9415-2888-4596-BDB0-37DE9CA99702' === e.data.type){
    for (const nodeName of e.data.nodesTohide) {
      for (const node of window.viewer.findNodesOfType(nodeName)) {
        node.hide();  
      }
    }
    for (const node of window.viewer.findNodesOfType(e.data.node)) {
      node.show();  
    }
    window.viewer.requestFrame();
  }else if(e.data && '22D78DEB-39B2-4DB4-A560-5B0C143B02F8' === e.data.type){
    const material = window.viewer.findMaterial(e.data.material);
    for (const node of window.viewer.findNodesOfType(e.data.node)) {
      window.viewer.setMaterialForMesh(material, node.mesh);
    }
    window.viewer.requestFrame();
  }else if (e.data && e.data.type === "CAPTURE_SCENE") {
    (async () => {
      try {
        // Capture screenshot at current camera view as a base64 JPEG string
        const dataUrl = await window.viewer.captureImage({
          toDataUrl: true
        });

        // Send the base64 data URL back to the parent page
        window.parent.postMessage(
          {
            type: "CAPTURE_SCENE_RESULT",
            image: dataUrl
          },
          "*"
        );
      } catch (err) {
        console.error("Screenshot capture error:", err);
        window.parent.postMessage(
          {
            type: "CAPTURE_SCENE_ERROR",
            message: err?.message || String(err)
          },
          "*"
        );
      }
    })();
  }


})

document.addEventListener("DOMContentLoaded", function () {
  initViewer();
});
