function initViewer() {
  const interval = setInterval(() => {
    if (typeof WALK === "undefined") return;

    const viewer = WALK.getViewer();
    if (!viewer) return;

    // Check if scene is loaded
    if (viewer.isSceneLoaded()) {
      clearInterval(interval);

      window.viewer = viewer;

      // Your logic
      viewer.onNodeTypeClicked(function(node) {
        console.log("node", node);
      });

      window.parent.postMessage(
        { type: '56C8AB6F-5F86-441A-9E7B-84CF4A81CDC9', payload: {} },
        "*"
      );
    }
  }, 100);
}

document.addEventListener("DOMContentLoaded", function () {
  initViewer();
});
