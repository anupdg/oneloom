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
  const i = document.createElement("div");
  (i.className = "texture-container"),
    (i.id = "texture-container"),
    o.appendChild(n),
    o.appendChild(i),
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
              Math.abs(t.x - lockedPosition.x) > 0.03 ||
              Math.abs(t.y - lockedPosition.y) > 0.03 ||
              Math.abs(t.z - lockedPosition.z) > 0.03
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
        }, 25));
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
  let t = 0,
    o = null,
    n = !1,
    i = 0,
    r = 0,
    c = !1;
  function l(l) {
    if (!isScreenLocked) return;
    let a = l.target;
    for (; a && a !== document; ) {
      if (
        "picker" === a.id ||
        "lock-button" === a.id ||
        "lock-container" === a.id ||
        a.closest("#picker") ||
        a.closest("#lock-container") ||
        a.classList.contains("texture-item") ||
        a.classList.contains("lock-button")
      )
        return !0;
      a = a.parentNode;
    }
    if ("wheel" === l.type) return l.preventDefault(), l.stopPropagation(), !1;
    if (l.target === e || "CANVAS" === l.target.tagName) {
      if ("mousedown" === l.type)
        return (
          (t = Date.now()),
          (o = { x: l.clientX, y: l.clientY }),
          (n = !1),
          (c = !1),
          !0
        );
      if ("mousemove" === l.type && o) {
        return (
          Math.sqrt(
            Math.pow(l.clientX - o.x, 2) + Math.pow(l.clientY - o.y, 2)
          ) > 3 && (n = !0),
          !0
        );
      }
      if ("mouseup" === l.type) return (o = null), !0;
      if ("click" === l.type) {
        const e = Date.now(),
          t = e - i;
        return (
          (i = e),
          t < 500 ? (r++, r >= 2 && (c = !0)) : ((r = 0), (c = !1)),
          n
            ? !0
            : c
            ? (l.preventDefault(), l.stopPropagation(), !1)
            : (setTimeout(() => {
                if (isScreenLocked && lockedPosition) {
                  const e = WALK.getViewer().getCameraPosition();
                  (Math.abs(e.x - lockedPosition.x) > 0.1 ||
                    Math.abs(e.y - lockedPosition.y) > 0.1 ||
                    Math.abs(e.z - lockedPosition.z) > 0.1) &&
                    ((r += 2), (c = !0));
                }
              }, 50),
              !0)
        );
      }
      if ("dblclick" === l.type)
        return l.preventDefault(), l.stopPropagation(), !1;
    }
    return !0;
  }
  e.addEventListener("wheel", l, !0),
    e.addEventListener("click", l, !0),
    e.addEventListener("dblclick", l, !0),
    e.addEventListener("mousedown", l, !1),
    e.addEventListener("mouseup", l, !1),
    e.addEventListener("mousemove", l, !1),
    document.addEventListener("wheel", l, !0),
    document.addEventListener("dblclick", l, !0),
    (window._blockMovementHandler = l);
}
function removeMovementBlocker() {
  if (!window._blockMovementHandler) return;
  const e = document.querySelector("canvas"),
    t = window._blockMovementHandler;
  e &&
    (e.removeEventListener("wheel", t, !0),
    e.removeEventListener("click", t, !0),
    e.removeEventListener("dblclick", t, !0),
    e.removeEventListener("mousedown", t, !1),
    e.removeEventListener("mouseup", t, !1),
    e.removeEventListener("mousemove", t, !1)),
    document.removeEventListener("wheel", t, !0),
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
    let i;
    (n.className = "texture-item"),
      (n.dataset.id = o.id),
      "video" === o.type
        ? ((i = document.createElement("video")),
          (i.autoplay = !0),
          (i.muted = !0),
          (i.loop = !0))
        : (i = document.createElement("img")),
      (i.id = o.id),
      (i.src = o.url),
      (i.crossOrigin = "anonymous");
    const r = document.createElement("div");
    (r.className = "texture-label"),
      (r.textContent = o.id),
      n.appendChild(i),
      n.appendChild(r),
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
  let i = textureCache[t.id];
  i ||
    ((i =
      "video" === t.type
        ? o.createTextureFromHtmlVideo(n)
        : o.createTextureFromHtmlImage(n)),
    (textureCache[t.id] = i));
  const r = o.findMaterial(e);
  r
    ? ((r.baseColorTexture = i),
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
