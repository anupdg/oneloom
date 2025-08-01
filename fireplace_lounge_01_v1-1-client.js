const selectionData = document.getElementById("selectionData"),
  lastUpdate = document.getElementById("lastUpdate"),
  sceneFrame = document.getElementById("sceneFrame");
let currentSelection = {},
  materialsConfig = null;
function loadMaterialsConfig() {
  fetch("/materials-config.json")
    .then((e) => {
      if (!e.ok) throw new Error("Failed to load materials config");
      return e.json();
    })
    .then((e) => {
      materialsConfig = e;
    })
    .catch((e) => {
      console.error("Error loading materials configuration:", e);
    });
}
function updateSelectionDisplay() {
  if (
    ((selectionData.innerHTML = ""),
    !currentSelection || !currentSelection.texture)
  )
    return void (selectionData.innerHTML =
      "<p>No selection data available yet.</p>");
  const e = document.createElement("div");
  e.className = "selection-item";
  let t = "No additional details available";
  if (materialsConfig && materialsConfig.materials[currentSelection.material]) {
    const e = materialsConfig.materials[
      currentSelection.material
    ].textures.find((e) => e.id === currentSelection.texture);
    e &&
      (t = `\n        <strong>Texture ID:</strong> ${e.id}<br>\n        <strong>Type:</strong> ${e.type}<br>\n        <strong>URL:</strong> <span class="texture-url">${e.url}</span>\n      `);
  }
  (e.innerHTML = `\n    <strong>Material:</strong> ${currentSelection.material}<br>\n    <strong>Texture:</strong> ${currentSelection.texture}<br>\n    <div class="texture-details">\n      ${t}\n    </div>\n  `),
    selectionData.appendChild(e);
}
window.addEventListener("message", (e) => {
  e.data &&
    "SELECTION_UPDATE" === e.data.type &&
    ((currentSelection = e.data.payload.selection),
    updateSelectionDisplay(),
    (lastUpdate.textContent =
      "Last updated: " + new Date().toLocaleTimeString()));
}),
  window.addEventListener("load", () => {
    loadMaterialsConfig(),
      setTimeout(() => {
        sceneFrame.contentWindow.postMessage({ type: "GET_SELECTION" }, "*");
      }, 3e3);
  });
