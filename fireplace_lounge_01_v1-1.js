window.selection = { material: null, texture: null };
let materialsConfig = null;
const textureCache = {},
  MATERIAL_NAME = "ceiling";
let isScreenLocked = !1,
  lockedPosition = null;
function createPickerUI() {
  const e = document.createElement("div");
  (e.id = "picker"),
    (e.className = "collapsed"),
    (e.style.position = "absolute"),
    (e.style.top = "30%"),
    (e.style.left = "20px"),
    (e.style.zIndex = "1000");
  const t = document.createElement("button");
  (t.id = "toggle-picker"), (t.textContent = "→");
  const o = document.createElement("div");
  o.id = "picker-content";
  const n = document.createElement("h3");
  n.textContent = "Textures";
  const r = document.createElement("div");
  (r.className = "texture-container"),
    (r.id = "texture-container"),
    o.appendChild(n),
    o.appendChild(r),
    e.appendChild(t),
    e.appendChild(o),
    document.body.appendChild(e),
    t.addEventListener("click", function () {
      e.classList.toggle("collapsed"),
        e.classList.contains("collapsed")
          ? (this.textContent = "→")
          : (this.textContent = "←");
    });
}
function createLockButton() {
  const e = document.createElement("div");
  (e.id = "lock-container"),
    (e.style.position = "absolute"),
    (e.style.top = "50%"),
    (e.style.right = "20px"),
    (e.style.transform = "translateY(-50%)"),
    (e.style.zIndex = "1000");
  const t = document.createElement("button");
  (t.id = "lock-button"),
    (t.className = "lock-button"),
    (t.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'),
    t.addEventListener("click", toggleScreenLock),
    e.appendChild(t),
    document.body.appendChild(e);
}
function toggleScreenLock() {
  isScreenLocked ? unlockScreen() : lockScreen();
}
function lockScreen() {
  const e = WALK.getViewer();
  if (e)
    try {
      const t = e.getCameraPosition();
      (lockedPosition = { x: t.x, y: t.y, z: t.z }),
        setupMovementBlocker(),
        document.addEventListener("keydown", blockNavigationKeys, !0),
        document.addEventListener("keyup", blockNavigationKeys, !0),
        window._lockInterval && clearInterval(window._lockInterval),
        (window._lockInterval = setInterval(() => {
          try {
            const t = e.getCameraPosition();
            if (
              Math.abs(t.x - lockedPosition.x) > 0.01 ||
              Math.abs(t.y - lockedPosition.y) > 0.01 ||
              Math.abs(t.z - lockedPosition.z) > 0.01
            ) {
              const t = e.getCameraRotation();
              let o = {};
              try {
                "function" == typeof WALK.View
                  ? ((o = new WALK.View()),
                    (o.position = lockedPosition),
                    (o.rotation = t))
                  : (o = { position: lockedPosition, rotation: t });
              } catch (e) {
                o = { position: lockedPosition, rotation: t };
              }
              "function" == typeof e.switchToView && e.switchToView(o, 0);
            }
          } catch (e) {
            console.error("Error in position enforcement:", e);
          }
        }, 50));
      const o = document.getElementById("lock-button");
      o && o.classList.add("locked"), (isScreenLocked = !0);
    } catch (e) {
      console.error("Error locking screen:", e);
    }
  else console.error("Viewer not available");
}
function unlockScreen() {
  if (WALK.getViewer())
    try {
      window._lockInterval &&
        (clearInterval(window._lockInterval), (window._lockInterval = null)),
        removeMovementBlocker(),
        document.removeEventListener("keydown", blockNavigationKeys, !0),
        document.removeEventListener("keyup", blockNavigationKeys, !0);
      const e = document.getElementById("lock-button");
      e && e.classList.remove("locked"),
        (isScreenLocked = !1),
        (lockedPosition = null);
    } catch (e) {
      console.error("Error unlocking screen:", e);
    }
  else console.error("Viewer not available");
}
function setupMovementBlocker() {
  const e = document.querySelector("canvas");
  if (!e) return void console.error("Canvas not found");
  let t = !1,
    o = 0;
  function n(n) {
    if (!isScreenLocked) return;
    let r = n.target,
      i = !1;
    for (; r && r !== document; ) {
      if (
        "picker" === r.id ||
        "lock-button" === r.id ||
        "lock-container" === r.id ||
        r.closest("#picker") ||
        r.closest("#lock-container") ||
        r.classList.contains("texture-item") ||
        r.classList.contains("lock-button")
      ) {
        i = !0;
        break;
      }
      r = r.parentNode;
    }
    if (i) return !0;
    if ("wheel" === n.type) return n.preventDefault(), n.stopPropagation(), !1;
    if (n.target === e || "CANVAS" === n.target.tagName) {
      if ("mousedown" === n.type) return (t = !0), (o = Date.now()), !0;
      if ("mousemove" === n.type && t) return !0;
      if ("mouseup" === n.type) {
        const e = Date.now() - o;
        return (
          (t = !1), !(e < 200) || (n.preventDefault(), n.stopPropagation(), !1)
        );
      }
      if ("click" === n.type || "dblclick" === n.type)
        return n.preventDefault(), n.stopPropagation(), !1;
    }
    return !n.type.startsWith("touch") ||
      (n.target !== e && "CANVAS" !== n.target.tagName)
      ? void 0
      : (n.preventDefault(), n.stopPropagation(), !1);
  }
  e.addEventListener("wheel", n, !0),
    e.addEventListener("click", n, !0),
    e.addEventListener("mousedown", n, !1),
    e.addEventListener("mouseup", n, !0),
    e.addEventListener("mousemove", n, !1),
    e.addEventListener("dblclick", n, !0),
    e.addEventListener("touchstart", n, !0),
    e.addEventListener("touchmove", n, !0),
    e.addEventListener("touchend", n, !0),
    document.addEventListener("wheel", n, !0),
    document.addEventListener("dblclick", n, !0),
    (window._blockMovementHandler = n);
}
function removeMovementBlocker() {
  if (!window._blockMovementHandler) return;
  const e = document.querySelector("canvas"),
    t = window._blockMovementHandler;
  e &&
    (e.removeEventListener("wheel", t, !0),
    e.removeEventListener("click", t, !0),
    e.removeEventListener("mousedown", t, !0),
    e.removeEventListener("dblclick", t, !0),
    e.removeEventListener("touchstart", t, !0),
    e.removeEventListener("touchmove", t, !0),
    e.removeEventListener("touchend", t, !0)),
    document.removeEventListener("wheel", t, !0),
    document.removeEventListener("click", t, !0),
    document.removeEventListener("mousedown", t, !0),
    document.removeEventListener("dblclick", t, !0),
    (window._blockMovementHandler = null);
}
function blockNavigationKeys(e) {
  if (!isScreenLocked) return;
  return [
    "KeyW",
    "KeyA",
    "KeyS",
    "KeyD",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "Space",
    "ShiftLeft",
    "ShiftRight",
    "ControlLeft",
    "ControlRight",
  ].includes(e.code) ||
    [
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "Shift",
      "Control",
    ].includes(e.key)
    ? (e.preventDefault(), e.stopPropagation(), !1)
    : void 0;
}
function loadMaterialsConfig() {
  fetch("https://anupdg.github.io/oneloom/materials-config.json")
    .then((e) => {
      if (!e.ok) throw new Error("Failed to load materials config");
      return e.json();
    })
    .then((e) => {
      (materialsConfig = e), loadTexturesForMaterial(MATERIAL_NAME);
    })
    .catch((e) => {
      console.error("Error loading materials config:", e);
    });
}
function loadTexturesForMaterial(e) {
  if (!materialsConfig || !materialsConfig.materials[e])
    return void console.error("Material not found:", e);
  const t = document.getElementById("texture-container");
  t.innerHTML = "";
  materialsConfig.materials[e].textures.forEach((o) => {
    const n = document.createElement("div");
    let r;
    (n.className = "texture-item"),
      (n.dataset.id = o.id),
      "video" === o.type
        ? ((r = document.createElement("video")),
          (r.autoplay = !0),
          (r.muted = !0),
          (r.loop = !0))
        : (r = document.createElement("img")),
      (r.id = o.id),
      (r.src = o.url),
      (r.crossOrigin = "anonymous");
    const i = document.createElement("div");
    (i.className = "texture-label"),
      (i.textContent = o.id),
      n.appendChild(r),
      n.appendChild(i),
      t.appendChild(n),
      n.addEventListener("click", function () {
        document.querySelectorAll(".texture-item").forEach((e) => {
          e.classList.remove("selected");
        }),
          n.classList.add("selected"),
          applyTextureToMaterial(e, o);
      });
  });
}
function applyTextureToMaterial(e, t) {
  const o = WALK.getViewer();
  if (!o) return void console.error("Viewer not available");
  const n = document.getElementById(t.id);
  if (!n) return void console.error("Texture element not found:", t.id);
  let r = textureCache[t.id];
  r ||
    ((r =
      "video" === t.type
        ? o.createTextureFromHtmlVideo(n)
        : o.createTextureFromHtmlImage(n)),
    (textureCache[t.id] = r));
  const i = o.findMaterial(e);
  i
    ? ((i.baseColorTexture = r),
      (window.selection = { material: e, texture: t.id }),
      sendSelectionUpdate(),
      o.requestFrame())
    : console.error("Material not found:", e);
}
function sendSelectionUpdate() {
  window.parent.postMessage(
    { type: "SELECTION_UPDATE", payload: { selection: window.selection } },
    "*"
  );
}
function initViewer() {
  const e = WALK.getViewer();
  e
    ? (e.setMaterialEditable(MATERIAL_NAME),
      loadMaterialsConfig(),
      "function" == typeof e.onApiUserStateChanged &&
        e.onApiUserStateChanged(function (e, t) {
          if (e.startsWith("MaterialPicker:")) {
            const o = e.replace("MaterialPicker:", "");
            (window.selection = { material: o, texture: t }),
              sendSelectionUpdate();
          }
        }),
      window.addEventListener("message", function (e) {
        e.data && "GET_SELECTION" === e.data.type && sendSelectionUpdate();
      }))
    : setTimeout(initViewer, 500);
}
document.addEventListener("DOMContentLoaded", function () {
  createPickerUI(), createLockButton(), initViewer();
});
