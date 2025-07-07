function initViewer() {
  window.viewer = WALK.getViewer();

  window.viewer.whenSceneReady(() => {
    console.log('Scene is ready.');
  });
}
document.addEventListener("DOMContentLoaded", function () {
  initViewer();
});
