function initViewer() {
  window.viewer = WALK.getViewer();
   //['ALORA_SOFA', 'Vernon Sofa', 'sofa'].forEach(node => {
   //   window.viewer.setNodeTypeEditable(node);
   //});
  viewer.onNodeTypeClicked(function(node){
    console.log("node", node);
  });
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
  }
})

//document.addEventListener("DOMContentLoaded", function () {
  initViewer();
//});
