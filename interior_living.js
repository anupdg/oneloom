(function () {
  "use strict";

  const materialImageMap = {
    Bloom: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Bloom.webp?v=1755240214",
    Beigewheel: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Beigewheel.webp?v=1755236747",
    Sagecrane: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Sagecrane.webp?v=1755236747",
    Coralmist: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Coralmist.webp?v=1755236746",
    Blushaviary: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Blushaviary.webp?v=1755236747",
    Tealaviary: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Tealaviary.webp?v=1755236747",
    Rosagrove: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Rosagrove.webp?v=1755236746",

    Lilacstone: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Lilacstone.webp?v=1755237068",
    Azura: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Azura.webp?v=1755237069",
    Florawood: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Florawood.webp?v=1755237069",
    "Teal Medallion": "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Teal_Medallion.webp?v=1755237069",
    "Terracotta Medallione": "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Terracotta_Medallione.webp?v=1755237069",

    Lunara: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Lunara.webp?v=1755236572",
    Arda: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Arda.webp?v=1755236572",
    Rosefern: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Rossefern.webp?v=1755236572",
    Seaforest: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Seaforest.webp?v=1755236572",

    Ashloom: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Ashloom.webp?v=1755236402",
    Clayweave: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Clayweave.webp?v=1755236402",
    Sandvelour: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Sandvelour.webp?v=1755236402",
    Skybloom: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Skybloom.webp?v=1755236402",
    Stonegrid: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Stonegrid.webp?v=1755236400",
    Terrastripe: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Terrastripe.webp?v=1755236402"
  };

  const configuratorGroups = [
    {
      key: "console",
      label: "Console",
      view: "Console",
      nodes: ["panel2"]
    },
    {
      key: "sofa",
      label: "Sofa",
      view: "Sofa",
      nodes: ["panel1", "sofa", "rug"]
    }
  ];

  const nodes = {
    panel1: {
      label: "Panel 1",
      view: "Sofa",
      defaultMaterial: "Bloom",
      materials: [
        "Ashloom",
        "Clayweave",
        "Sandvelour",
        "Skybloom",
        "Stonegrid",
        "Arda",
        "Terrastripe"
      ]
    },

    panel2: {
      label: "Panel 2",
      view: "Console",
      defaultMaterial: "Lilacstone",
      materials: [
        "Ashloom",
        "Clayweave",
        "Sandvelour",
        "Skybloom",
        "Stonegrid"
      ]
    },

    sofa: {
      label: "Sofa Fabric",
      view: "Sofa",
      defaultMaterial: "Ashloom",
      materials: [
        "Ashloom",
        "Clayweave",
        "Sandvelour",
        "Skybloom",
        "Stonegrid",
        "Terrastripe"
      ]
    },

    rug: {
      label: "Rug",
      view: "Sofa",
      defaultMaterial: "Lunara",
      materials: [
        "Lunara",
        "Arda",
        "Rosefern",
        "Seaforest"
      ]
    }
  };

  const meshMap = {
    sofa: [
      {
        name: "{sofa_fab}Shape25",
        label: "Grey Sofa",
        image:
          "https://img.freepik.com/free-psd/midcentury-modern-grey-sofa-with-wooden-frame_632498-25556.jpg?w=740"
      },
      {
        name: "s2",
        label: "Teal Sofa",
        image:
          "https://img.freepik.com/free-psd/teal-velvet-sofa-with-gold-accents-elegant-modern-living-room-furniture_191095-80919.jpg?w=740"
      },
      {
        name: "s3",
        label: "Wood Sofa",
        image:
          "https://img.freepik.com/free-psd/modern-wooden-sofa-with-natureinspired-design_191095-83780.jpg?w=740"
      }
    ]
  };

  let viewer = null;

  const state = {
    menuOpen: false,
    stack: []
  };

  function waitForViewer() {

    return new Promise((resolve) => {

      const interval = setInterval(() => {

        if (window.WALK && WALK.getViewer()) {

          clearInterval(interval);

          resolve(WALK.getViewer());
        }

      }, 100);

    });
  }

  function applyTexture(imageUrl, materialName) {

    const img = new Image();

    img.crossOrigin = "anonymous";

    img.onload = function () {

      const material = viewer.findMaterial(materialName);

      if (!material) return;

      const texture = viewer.createTextureFromHtmlImage(img);

      material.baseColorTexture = texture;

      viewer.requestFrame();
    };

    img.src = imageUrl;
  }

  function switchMesh(showNode, allNodes) {

    allNodes.forEach(nodeName => {

      viewer.findNodesOfType(nodeName).forEach(node => {

        node.hide();
      });
    });

    viewer.findNodesOfType(showNode).forEach(node => {

      node.show();
    });

    viewer.requestFrame();
  }

  function goToView(view) {

    if (!view) return;

    viewer.switchToView(view);
  }

  function pushState(newState) {

    state.stack.push(newState);

    renderMenu();
  }

  function popState() {

    if (state.stack.length > 1) {

      state.stack.pop();

      renderMenu();
    }
  }

  function currentState() {

    return state.stack[state.stack.length - 1];
  }

  function createMenuUI() {

    const root = document.createElement("div");

    root.id = "ol-menu-root";

    root.style.position = "fixed";
    root.style.top = "20px";
    root.style.right = "20px";
    root.style.zIndex = "999999";

    const toggleButton = document.createElement("button");

    toggleButton.innerHTML = "☰";

    toggleButton.style.width = "56px";
    toggleButton.style.height = "56px";
    toggleButton.style.borderRadius = "50%";
    toggleButton.style.border = "none";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.fontSize = "22px";
    toggleButton.style.background = "rgba(80,80,80,0.65)";
    toggleButton.style.backdropFilter = "blur(12px)";
    toggleButton.style.color = "white";

    const panel = document.createElement("div");

    panel.id = "ol-menu-panel";

    panel.style.width = "320px";
    panel.style.maxHeight = "75vh";
    panel.style.overflowY = "auto";
    panel.style.marginTop = "12px";
    panel.style.padding = "18px";
    panel.style.borderRadius = "20px";
    panel.style.background = "rgba(50,50,50,0.72)";
    panel.style.backdropFilter = "blur(18px)";
    panel.style.display = "none";

    toggleButton.onclick = () => {

      state.menuOpen = !state.menuOpen;

      panel.style.display =
        state.menuOpen ? "block" : "none";
    };

    root.appendChild(toggleButton);

    root.appendChild(panel);

    document.body.appendChild(root);
  }

  function hideDefaultShapesparkUI() {

    const selectors = [

      ".view-menu",
      ".views-menu",
      ".navigation",
      ".navigation-ui",
      ".viewer-ui",
      ".viewer-controls",
      ".walk-ui",
      ".walk-navigation",
      ".walk-view-menu",
      ".configurator",
      ".configurator-ui",

      "#view-menu",
      "#views-menu",
      "#navigation",
      "#navigation-ui",

      "[data-role='navigation']",
      "[data-role='view-menu']",
      "[data-role='configurator']"
    ];

    selectors.forEach(selector => {

      document.querySelectorAll(selector)
        .forEach(el => {

          el.style.display = "none";
          el.style.visibility = "hidden";
          el.style.pointerEvents = "none";
          el.style.opacity = "0";
        });
    });

    document.querySelectorAll("div").forEach(el => {

      const text = el.innerText?.trim();

      if (
        text === "Views" ||
        text === "Walk" ||
        text === "Fly"
      ) {

        el.style.display = "none";
      }
    });
  }

  function continuouslyHideUI() {

    hideDefaultShapesparkUI();

    setInterval(() => {

      hideDefaultShapesparkUI();

    }, 1000);
  }

  function renderMenu() {

    const panel = document.getElementById("ol-menu-panel");

    if (!panel) return;

    panel.innerHTML = "";

    const current = currentState();

    if (!current) return;

    if (state.stack.length > 1) {

      const backBtn = createButton("← Back");

      backBtn.style.marginBottom = "16px";

      backBtn.onclick = () => popState();

      panel.appendChild(backBtn);
    }

    if (current.type === "main") {

      renderMainMenu(panel);
    }

    if (current.type === "group") {

      renderGroupMenu(panel, current.group);
    }

    if (current.type === "material-group") {

      renderMaterialGroup(panel);
    }

    if (current.type === "material") {

      renderMaterialMenu(panel, current.nodeKey);
    }

    if (current.type === "mesh") {

      renderMeshMenu(panel, current.nodeKey);
    }
  }

  function renderMainMenu(panel) {

    configuratorGroups.forEach(group => {

      const btn = createButton(group.label);

      btn.onclick = () => {

        goToView(group.view);

        pushState({
          type: "group",
          group
        });
      };

      panel.appendChild(btn);
    });
  }

  function renderGroupMenu(panel, group) {

    if (group.key === "sofa") {

      const materialBtn = createButton("Material Change");

      materialBtn.onclick = () => {

        pushState({
          type: "material-group"
        });
      };

      panel.appendChild(materialBtn);

      const meshBtn = createButton("Mesh Change");

      meshBtn.onclick = () => {

        pushState({
          type: "mesh",
          nodeKey: "sofa"
        });
      };

      panel.appendChild(meshBtn);

      return;
    }

    group.nodes.forEach(nodeKey => {

      const node = nodes[nodeKey];

      if (!node) return;

      const btn = createButton(node.label);

      btn.onclick = () => {

        goToView(node.view);

        pushState({
          type: "material",
          nodeKey
        });
      };

      panel.appendChild(btn);
    });
  }

  function renderMaterialGroup(panel) {

    const sofaItems = ["panel1", "sofa", "rug"];

    sofaItems.forEach(nodeKey => {

      const node = nodes[nodeKey];

      if (!node) return;

      const btn = createButton(node.label);

      btn.onclick = () => {

        goToView(node.view);

        pushState({
          type: "material",
          nodeKey
        });
      };

      panel.appendChild(btn);
    });
  }

  function renderMaterialMenu(panel, nodeKey) {

    const node = nodes[nodeKey];

    if (!node) return;

    const title = document.createElement("div");

    title.innerHTML = node.label;

    title.style.color = "white";
    title.style.fontSize = "20px";
    title.style.marginBottom = "18px";

    panel.appendChild(title);

    node.materials.forEach(materialName => {

      const wrapper = document.createElement("div");

      wrapper.style.marginBottom = "18px";
      wrapper.style.cursor = "pointer";

      const image = document.createElement("img");

      image.src = materialImageMap[materialName];

      image.style.width = "100%";
      image.style.borderRadius = "14px";

      const label = document.createElement("div");

      label.innerHTML = materialName;

      label.style.color = "white";
      label.style.marginTop = "8px";
      label.style.fontSize = "15px";

      wrapper.appendChild(image);

      wrapper.appendChild(label);

      wrapper.onclick = () => {

        applyTexture(
          materialImageMap[materialName],
          node.defaultMaterial
        );
      };

      panel.appendChild(wrapper);
    });
  }

  function renderMeshMenu(panel, nodeKey) {

    const meshes = meshMap[nodeKey];

    if (!meshes) return;

    const title = document.createElement("div");

    title.innerHTML = "Choose Sofa";

    title.style.color = "white";
    title.style.fontSize = "20px";
    title.style.marginBottom = "18px";

    panel.appendChild(title);

    meshes.forEach(mesh => {

      const wrapper = document.createElement("div");

      wrapper.style.marginBottom = "18px";
      wrapper.style.cursor = "pointer";

      const image = document.createElement("img");

      image.src = mesh.image;

      image.style.width = "100%";
      image.style.borderRadius = "14px";

      const label = document.createElement("div");

      label.innerHTML = mesh.label;

      label.style.color = "white";

      label.style.marginTop = "8px";

      wrapper.appendChild(image);

      wrapper.appendChild(label);

      wrapper.onclick = () => {

        switchMesh(
          mesh.name,
          meshes.map(m => m.name)
        );

        popState();
      };

      panel.appendChild(wrapper);
    });
  }

  function createButton(text) {

    const btn = document.createElement("button");

    btn.innerHTML = text;

    btn.style.width = "100%";
    btn.style.padding = "14px";
    btn.style.marginBottom = "12px";
    btn.style.border = "none";
    btn.style.borderRadius = "14px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "16px";
    btn.style.background = "rgba(255,255,255,0.12)";
    btn.style.color = "white";
    btn.style.backdropFilter = "blur(10px)";

    return btn;
  }

  async function init() {

    viewer = await waitForViewer();

    window.viewer = viewer;

    continuouslyHideUI();

    viewer.onSceneReadyToDisplay(() => {

      viewer.anchorsVisible = false;
    });

    createMenuUI();

    state.stack = [
      {
        type: "main"
      }
    ];

    renderMenu();
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();
  }

})();
