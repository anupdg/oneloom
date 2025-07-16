function initViewer() {
  window.viewer = WALK.getViewer();
  // viewer.anchorsVisible = false;

  function anchorClicked() {
    window.alert('clicked');
  }
  function sceneReadyToDisplay() {
      window.viewer.anchorsVisible = false;

      // const anchors = [
      //   {
      //     position: [3, 1.5, 0.05],
      //     type: 'sphere',
      //     icon: 'info',  
      //     radius: 0.05,
      //   },
      //   {
      //     position: [2.0, 2.0, 2.5],
      //     type: 'sphere',
      //     icon: 'question',
      //     radius: 0.05,
      //   },
      //   {
      //     position: [2.5, 2.5, 0.05],
      //     type: 'sphere',
      //     icon: 'image',
      //     radius: 0.05,
      //   },
      //   {
      //     position: [2.0, 1.7, 0.05],
      //     type: 'sphere',
      //     icon: 'warning',
      //     radius: 0.05,
      //   },
      //   {
      //     position: [2.5, 1.0, 2.8],
      //     type: 'sphere',
      //     icon: 'shopping',
      //     radius: 0.05,
      //   }
      // ];

        const anchors = [
        {
          id: "SOFA_LONG",
          position: [
                    2.455455424602945,
                    2.461209885835784,
                    0.09
                ],
          type: 'sphere',
          icon: 'info',  
          radius: 0.15,
        },
        {
          id: "ARM_CHAIRS",
          position: [
                    2.4146124949487735,
                    0.43170449376177983,
                    0.053848478839140894
                ],
          type: 'sphere',
          icon: 'info',  
          radius: 0.15,
        },
        {
          id: "FLOOR",
          position: [
                    3.326692921677223,
                    1.410632145356301,
                    0.04647076463319892
                ],
          type: 'sphere',
          icon: 'info',  
          radius: 0.15,
        },
                {
          id: "DINING_CARPET",
          position: [
                    -3.877094249470993,
                    -1.2222199698167233,
                    0.08
                ],
          type: 'sphere',
          icon: 'info',  
          radius: 0.15,
        },
        {
          id: "DINING_WALL",
          position: [
                    -6.595282729676232,
                    -0.5821483559815583,
                    1.9847833473345315
                ],
          type: 'sphere',
          icon: 'info',  
          radius: 0.15,
        },
        {
          id: "LIVING_WALL",
          position: [
                    0.9859365044695398,
                    3.7932437701105357,
                    1.571453019965263
                ],
          type: 'sphere',
          icon: 'question',
          radius: 0.15,
        },
        {
          id: "LONG_SOFA_MAT",
          position: [
                    2.673152774936188,
                    2.4944383025154413,
                    0.04098008049063872
                ],
          type: 'sphere',
          icon: 'question',
          radius: 0.15,
        },
        {
          id:"LIVING_CARPET",
          position: [
                    2.060774875400001,
                    1.6782010356026829,
                    0.04555584985714865
                ],
          type: 'sphere',
          icon: 'info',
          radius: 0.15,
        },
                {
          id:"DINING_FLOOR",
          position: [
                    -2.9217184117301214,
                    1.2104482636169263,
                    0.11
                ],
          type: 'sphere',
          icon: 'info',
          radius: 0.15,
        },
        {
          id:"BEDROOM_CARPET",
          position: [
                    -4.242119991482763,
                    -3.362161518445343,
                    0.06730263768225293
                ],
          type: 'sphere',
          icon: 'info',
          radius: 0.15,
        },
        {
          id:"BEDROOM_FLOOR",
          position: [
                    -6.090789058661746,
                    -4.05315297660159,
                    0.09
                ],
          type: 'sphere',
          icon: 'info',
          radius: 0.15,
        },
                {
          id:"BEDROOM_WALL",
          position:[
                    -6.603469518041618,
                    -4.404376424420667,
                    0.932759642122266
                ],
          type: 'sphere',
          icon: 'info',
          radius: 0.15,
        },
      ];
      anchors.forEach(anchorConfig => {
        viewer.addAnchor(anchorConfig, anchorClicked);
      });

      window.parent.postMessage(
        { type: '56C8AB6F-5F86-441A-9E7B-84CF4A81CDC9', payload: {} },
      "*"
    );
  }
  viewer.onSceneReadyToDisplay(sceneReadyToDisplay);
}

window.addEventListener("message", function (e) {
  if(e.data && 'FC9B8633-FB7E-4CDB-B9B4-9C7402805EB8' === e.data.type){
    console.log("MATERIALS_EDITABLE", e.data)
    e.data.extensions.forEach(materialName => {
      window.viewer.setMaterialEditable(materialName);
    });
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
      window.viewer.setMaterialForMesh(material, node.mesh)
    }
    window.viewer.requestFrame();
  }
})

document.addEventListener("DOMContentLoaded", function () {
  initViewer();
});
