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
      label: "Switch to Console View",
      view: "Console",
      nodes: ["panel2"]
    },
    {
      key: "sofa",
      label: "Switch to Sofa View",
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
    root.style.left = "20px";
    root.style.zIndex = "999999";

    const toggleButton = document.createElement("button");

    toggleButton.innerHTML = "☰";

    toggleButton.style.width = "58px";
    toggleButton.style.height = "58px";
    toggleButton.style.borderRadius = "50%";
    toggleButton.style.border =
      "1px solid rgba(255,255,255,0.15)";
    toggleButton.style.cursor = "pointer";
    toggleButton.style.fontSize = "22px";

    toggleButton.style.background =
      "linear-gradient(to bottom right, rgba(255,255,255,0.12), rgba(255,255,255,0.04))";

    toggleButton.style.backdropFilter = "blur(18px)";
    toggleButton.style.webkitBackdropFilter = "blur(18px)";

    toggleButton.style.boxShadow =
      "0 8px 25px rgba(0,0,0,0.25)";

    toggleButton.style.color = "white";

    const panel = document.createElement("div");

    panel.id = "ol-menu-panel";

    panel.style.width = "360px";
    panel.style.maxHeight = "78vh";
    panel.style.overflowY = "auto";
    panel.style.marginTop = "14px";
    panel.style.padding = "20px";

    panel.style.borderRadius = "24px";

    panel.style.background =
      "linear-gradient(to bottom right, rgba(25,25,25,0.55), rgba(40,40,40,0.30))";

    panel.style.backdropFilter = "blur(22px)";
    panel.style.webkitBackdropFilter = "blur(22px)";

    panel.style.border =
      "1px solid rgba(255,255,255,0.10)";

    panel.style.boxShadow =
      "0 12px 40px rgba(0,0,0,0.35)";

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

  function renderMenu() {

    const panel = document.getElementById("ol-menu-panel");

    if (!panel) return;

    panel.innerHTML = "";

    const current = currentState();

    if (!current) return;

    if (state.stack.length > 1) {

      const backBtn = createButton("← Back");

      backBtn.style.fontWeight = "600";

      backBtn.style.background =
        "rgba(255,255,255,0.06)";

      backBtn.style.marginBottom = "18px";

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

      const materialBtn = createButton("Change Material");

      materialBtn.onclick = () => {

        pushState({
          type: "material-group"
        });
      };

      panel.appendChild(materialBtn);

      const meshBtn = createButton("Change Mesh");

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

    const grid = document.createElement("div");

    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "1fr 1fr";
    grid.style.gap = "14px";

    node.materials.forEach(materialName => {

      const wrapper = document.createElement("div");

      wrapper.style.cursor = "pointer";

      wrapper.style.background =
        "rgba(255,255,255,0.04)";

      wrapper.style.padding = "8px";

      wrapper.style.borderRadius = "18px";

      wrapper.style.border =
        "1px solid rgba(255,255,255,0.08)";

      wrapper.style.backdropFilter = "blur(12px)";

      wrapper.style.transition =
        "all 0.25s ease";

      wrapper.onmouseenter = () => {

        wrapper.style.transform = "translateY(-3px)";

        wrapper.style.boxShadow =
          "0 10px 24px rgba(0,0,0,0.28)";
      };

      wrapper.onmouseleave = () => {

        wrapper.style.transform = "translateY(0px)";

        wrapper.style.boxShadow = "none";
      };

      const image = document.createElement("img");

      image.src = materialImageMap[materialName];

      image.style.width = "100%";

      image.style.aspectRatio = "1 / 1";

      image.style.objectFit = "cover";

      image.style.borderRadius = "14px";

      const label = document.createElement("div");

      label.innerHTML = materialName;

      label.style.color = "white";

      label.style.marginTop = "8px";

      label.style.fontSize = "13px";

      label.style.textAlign = "center";

      wrapper.appendChild(image);

      wrapper.appendChild(label);

      wrapper.onclick = () => {

        applyTexture(
          materialImageMap[materialName],
          node.defaultMaterial
        );
      };

      grid.appendChild(wrapper);
    });

    panel.appendChild(grid);
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

      wrapper.style.background =
        "rgba(255,255,255,0.04)";

      wrapper.style.padding = "10px";

      wrapper.style.borderRadius = "18px";

      wrapper.style.border =
        "1px solid rgba(255,255,255,0.08)";

      wrapper.style.backdropFilter = "blur(12px)";

      wrapper.style.transition =
        "all 0.25s ease";

      wrapper.onmouseenter = () => {

        wrapper.style.transform = "translateY(-3px)";

        wrapper.style.boxShadow =
          "0 10px 24px rgba(0,0,0,0.28)";
      };

      wrapper.onmouseleave = () => {

        wrapper.style.transform = "translateY(0px)";

        wrapper.style.boxShadow = "none";
      };

      const image = document.createElement("img");

      image.src = mesh.image;

      image.style.width = "100%";

      image.style.borderRadius = "14px";

      const label = document.createElement("div");

      label.innerHTML = mesh.label;

      label.style.color = "white";

      label.style.marginTop = "8px";

      label.style.textAlign = "center";

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

    btn.style.padding = "14px 16px";

    btn.style.marginBottom = "12px";

    btn.style.border =
      "1px solid rgba(255,255,255,0.12)";

    btn.style.borderRadius = "18px";

    btn.style.cursor = "pointer";

    btn.style.fontSize = "15px";

    btn.style.color =
      "rgba(255,255,255,0.92)";

    btn.style.background =
      "linear-gradient(to bottom right, rgba(255,255,255,0.10), rgba(255,255,255,0.04))";

    btn.style.backdropFilter = "blur(18px)";

    btn.style.webkitBackdropFilter = "blur(18px)";

    btn.style.boxShadow =
      "0 8px 32px rgba(0,0,0,0.25)";

    btn.style.transition =
      "all 0.25s ease";

    btn.onmouseenter = () => {

      btn.style.background =
        "linear-gradient(to bottom right, rgba(255,255,255,0.18), rgba(255,255,255,0.08))";

      btn.style.transform = "translateY(-2px)";
    };

    btn.onmouseleave = () => {

      btn.style.background =
        "linear-gradient(to bottom right, rgba(255,255,255,0.10), rgba(255,255,255,0.04))";

      btn.style.transform = "translateY(0px)";
    };

    return btn;
  }

  async function init() {

    viewer = await waitForViewer();

    window.viewer = viewer;

    viewer.anchorsVisible = false;

    function hideDefaultShapesparkUI() {

      const ids = [
        "view-list",
        "menu-bar-slide"
      ];

      ids.forEach(id => {

        const el = document.getElementById(id);

        if (!el) return;

        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        el.style.visibility = "hidden";
        el.style.display = "none";
      });
    }

    viewer.onSceneReadyToDisplay(() => {

      hideDefaultShapesparkUI();

      setTimeout(() => {
        hideDefaultShapesparkUI();
      }, 1000);

      setInterval(() => {
        hideDefaultShapesparkUI();
      }, 100);
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
