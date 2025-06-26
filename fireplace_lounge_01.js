function initViewer() {
  window.viewer = WALK.getViewer();

  viewer.onNodeTypeClicked(function(node){
    console.log("node", node);
  });
}

window.addEventListener("message", function (e) {
  if(e.data && "MATERIALS_EDITABLE" === e.data.type){
    console.log("MATERIALS_EDITABLE", e.data)
    e.data.extensions.forEach(materialName => {
      window.viewer.setMaterialEditable(materialName);
    });
  } else if(e.data && "GOTO_VIEW" === e.data.type){
    this.window.viewer.switchToView(e.data.view);
  }
})

document.addEventListener("DOMContentLoaded", function () {
  initViewer();
});
