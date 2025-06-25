function initViewer() {
  window.viewer = WALK.getViewer();
}

window.addEventListener("message", function (e) {
  if(e.data && "MATERIALS_EDITABLE" === e.data.type){
    console.log("MATERIALS_EDITABLE", e.data)
    e.data.extensions.forEach(materialName => {
      window.viewer.setMaterialEditable(materialName);
    });
    
  }
})

document.addEventListener("DOMContentLoaded", function () {
  initViewer();
});
