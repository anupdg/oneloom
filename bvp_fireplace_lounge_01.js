function initViewer() {
  // Wait to ensure Shapespark has finished setting up the default menu
  setTimeout(() => {
    const viewer = WALK.getViewer();
    window.viewer = viewer;

    // Your logic
    viewer.onNodeTypeClicked(function(node) {
      console.log("node", node);
    });

    window.parent.postMessage(
      { type: '56C8AB6F-5F86-441A-9E7B-84CF4A81CDC9', payload: {} },
      "*"
    );
  }, 2000); // 2 seconds delay
}

document.addEventListener("DOMContentLoaded", function () {
  initViewer();
});
