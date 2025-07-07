function initViewer() {
  window.viewer = WALK.getViewer();

  // Keep a reference to any existing handler
  const originalHandler = window.viewer.onSceneReadyToDisplay;

  // Replace with a wrapper that calls both
  window.viewer.onSceneReadyToDisplay = function() {
    if (typeof originalHandler === 'function') {
      originalHandler();
    }

    // Your custom logic
    window.viewer.onNodeTypeClicked(function(node){
      console.log("node", node);
    });

    window.parent.postMessage(
      { type: '56C8AB6F-5F86-441A-9E7B-84CF4A81CDC9', payload: {} },
      "*"
    );
  };
}

document.addEventListener("DOMContentLoaded", function () {
  initViewer();
});
