(function () {
  "use strict";

  const SCENE_CONFIG_URL = "scene.json";
  const STYLESHEET_URL = "interior_living.css";
  const APP_ROOT_ID = "olc-configurator";

  const DEFAULT_VIEW_BUTTONS = [
    { label: "Console", view: "Console" },
    { label: "Sofa", view: "Sofa" }
  ];

  const SHAPESPARK_UI_SELECTORS = [
    "#view-menu",
    "#views-menu",
    "#navigation",
    "#navigation-ui",
    "#configurator",
    "#configurator-container",
    ".view-menu",
    ".views-menu",
    ".viewpoints",
    ".navigation",
    ".navigation-ui",
    ".bottom-right-controls",
    ".top-right-menu",
    ".configurator",
    ".configurator-ui",
    ".ww-view-menu",
    ".ww-navigation",
    ".ww-configurator",
    ".walk-view-menu",
    ".walk-navigation",
    ".walk-configurator",
    ".viewer-ui__views",
    ".viewer-ui__navigation",
    ".viewer-configurator",
    "[data-role='view-menu']",
    "[data-role='navigation']",
    "[data-role='configurator']"
  ];

  const DEFAULT_EXTENSIONS = [
    {
      enabled: true,
      name: "1",
      nodeTypes: ["s1", "s2", "s3"],
      trigger: {
        position: [-1.0541866336614973, 0.7853590668944459, 0.7981119516186964],
        type: "sphere"
      },
      type: "SwitchObjects"
    },
    {
      enabled: true,
      name: "panel1",
      toPick: ["Beigewheel", "Sagecrane", "Coralmist", "Blushaviary", "Tealaviary", "Rosagrove"],
      toReplace: "Bloom",
      trigger: {
        position: [-1.676257834427554, 1.6135037877067469, 2.472428998154937],
        type: "sphere"
      },
      type: "MaterialPicker"
    },
    {
      enabled: true,
      name: "rug",
      toPick: ["Arda", "Rosefern", "Seaforest", "Midnightfern", "Stonebloom", "Kayla", "Cloudpetal", "Verdanta", "Saharine"],
      toReplace: "Lunara",
      trigger: {
        position: [-0.22925512455841268, -0.23305861616930437, 0.051929565732100426],
        type: "sphere"
      },
      type: "MaterialPicker"
    },
    {
      enabled: true,
      name: "sofa",
      toPick: ["Clayweave", "Sandvelour", "Skybloom", "Stonegrid", "Terrastripe"],
      toReplace: "Ashloom",
      trigger: {
        position: [-1.0517995798030526, 1.5188423025327185, 0.732193496312388],
        type: "sphere"
      },
      type: "MaterialPicker"
    },
    {
      enabled: true,
      name: "panel2",
      toPick: ["Azura", "Florawood", "Teal Medallion", "Terracotta Medallione", "Featherfield", "Meadow Lace", "Oroflora", "Aqualora"],
      toReplace: "Lilacstone",
      trigger: {
        position: [3.694529930824853, 1.14799819145809, 2.406918933065865],
        type: "sphere"
      },
      type: "MaterialPicker"
    }
  ];

  const materialImageMap = {
    Bloom: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Bloom.webp?v=1755240214",
    Beigewheel: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Beigewheel.webp?v=1755236747",
    Sagecrane: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Sagecrane.webp?v=1755236747",
    Coralmist: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Coralmist.webp?v=1755236746",
    Blushaviary: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Blushaviary.webp?v=1755236747",
    Tealaviary: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Tealaviary.webp?v=1755236747",
    Rosagrove: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Rosagrove.webp?v=1755236746",
    Petalarch: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Petalarch.webp?v=1755236747",
    Lilacstone: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Lilacstone.webp?v=1755237068",
    Azura: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Azura.webp?v=1755237069",
    Florawood: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Florawood.webp?v=1755237069",
    "Teal Medallion": "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Teal_Medallion.webp?v=1755237069",
    "Terracotta Medallione": "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Terracotta_Medallione.webp?v=1755237069",
    Featherfield: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Featherfield.webp?v=1755237068",
    "Meadow Lace": "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Meadow_Lace.webp?v=1755237069",
    Oroflora: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Oraflora.webp?v=1755237068",
    Aqualora: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Aqualora.webp?v=1755237069",
    Lunara: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Lunara.webp?v=1755236572",
    Arda: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Arda.webp?v=1755236572",
    Rosefern: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Rossefern.webp?v=1755236572",
    Seaforest: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Seaforest.webp?v=1755236572",
    Midnightfern: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Rossefern.webp?v=1755236572",
    Stonebloom: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Stonebloom.webp?v=1755236572",
    Kayla: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Kayla.webp?v=1755236572",
    Cloudpetal: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Cloudpetal.webp?v=1755236572",
    Verdanta: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Verdanta.webp?v=1755236572",
    Saharine: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Saharine.webp?v=1755236630",
    Ashloom: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Ashloom.webp?v=1755236402",
    Clayweave: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Clayweave.webp?v=1755236402",
    Sandvelour: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Sandvelour.webp?v=1755236402",
    Skybloom: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Skybloom.webp?v=1755236402",
    Stonegrid: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Stonegrid.webp?v=1755236400",
    Terrastripe: "https://cdn.shopify.com/s/files/1/0579/1842/3122/files/Terrastripe.webp?v=1755236402"
  };

  const meshMap = {
    panel1: [
      {
        name: "{Petalarch}Object010",
        default: true,
        url: "https://img.freepik.com/free-vector/classic-white-wall-with-wooden-frames_107791-29834.jpg?w=740"
      }
    ],
    panel2: [
      {
        name: "{Lilacstone}Walls_01.004",
        default: true,
        url: "https://img.freepik.com/free-photo/empty-modern-luxury-room-interior-design_53876-176890.jpg?w=740"
      }
    ],
    sofa: [
      {
        name: "{sofa_fab}Shape25",
        default: true,
        url: "https://img.freepik.com/free-psd/midcentury-modern-grey-sofa-with-wooden-frame_632498-25556.jpg?w=740"
      },
      {
        name: "s2",
        url: "https://img.freepik.com/free-psd/teal-velvet-sofa-with-gold-accents-elegant-modern-living-room-furniture_191095-80919.jpg?w=740"
      },
      {
        name: "s3",
        url: "https://img.freepik.com/free-psd/modern-wooden-sofa-with-natureinspired-design_191095-83780.jpg?w=740"
      }
    ],
    rug: [
      {
        name: "SM_Living004",
        default: true,
        url: "https://img.freepik.com/free-photo/aesthetic-textile-background-ethnic-pattern_53876-128222.jpg?w=740"
      }
    ]
  };

  const viewMap = {
    panel1: "Console",
    panel2: "Console",
    rug: "Sofa",
    sofa: "Sofa"
  };

  const anchorIdToNodeKey = {
    panel1: "panel1",
    panel2: "panel2",
    rug: "rug",
    sofa: "sofa",
    1: "sofa"
  };

  const labelMap = {
    panel1: "Console Panel 1",
    panel2: "Console Panel 2",
    rug: "Rug",
    sofa: "Sofa",
    1: "Sofa"
  };

  const configuratorGroups = [
    {
      key: "console",
      label: "Console",
      view: "Console",
      nodes: ["panel1", "panel2"]
    },
    {
      key: "sofa",
      label: "Sofa",
      view: "Sofa",
      nodes: ["sofa", "rug"]
    }
  ];

  const itemLabelMap = {
    "{Petalarch}Object010": "Petalarch",
    "{Lilacstone}Walls_01.004": "Lilacstone",
    SM_Living004: "Living Room Rug",
    "{sofa_fab}Shape25": "Grey Sofa",
    s1: "Grey Sofa",
    s2: "Teal Sofa",
    s3: "Wooden Sofa",
    Bloom: "Bloom Pattern",
    Beigewheel: "Beige Wheel",
    Sagecrane: "Sage Crane",
    Coralmist: "Coral Mist",
    Blushaviary: "Blush Aviary",
    Tealaviary: "Teal Aviary",
    Rosagrove: "Rosa Grove",
    Petalarch: "Petal Arch",
    Lilacstone: "Lilac Stone",
    Azura: "Azura",
    Florawood: "Flora Wood",
    "Teal Medallion": "Teal Medallion",
    "Terracotta Medallione": "Terracotta Medallione",
    Featherfield: "Feather Field",
    "Meadow Lace": "Meadow Lace",
    Oroflora: "Oro Flora",
    Aqualora: "Aqua Lora",
    Lunara: "Lunara",
    Arda: "Arda",
    Rosefern: "Rose Fern",
    Seaforest: "Sea Forest",
    Midnightfern: "Midnight Fern",
    Stonebloom: "Stone Bloom",
    Kayla: "Kayla",
    Cloudpetal: "Cloud Petal",
    Verdanta: "Verdanta",
    Saharine: "Saharine",
    Ashloom: "Ash Loom",
    Clayweave: "Clay Weave",
    Sandvelour: "Sand Velour",
    Skybloom: "Sky Bloom",
    Stonegrid: "Stone Grid",
    Terrastripe: "Terra Stripe"
  };

  class DOMUtils {
    static clearChildren(element) {
      if (element) {
        element.replaceChildren();
      }
    }

    static button(className, label, onClick, title) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.textContent = label;
      button.setAttribute("aria-label", title || label);
      if (title) {
        button.title = title;
      }
      if (onClick) {
        button.addEventListener("click", onClick);
      }
      return button;
    }

    static create(tag, className, text) {
      const element = document.createElement(tag);
      if (className) {
        element.className = className;
      }
      if (text !== undefined) {
        element.textContent = text;
      }
      return element;
    }
  }

  class ViewerAdapter {
    constructor() {
      this.viewer = null;
      this.anchorConfigByObject = new Map();
    }

    async init() {
      this.viewer = await this.waitForViewer();
      window.viewer = this.viewer;
      return this.viewer;
    }

    waitForViewer() {
      return new Promise((resolve, reject) => {
        const startedAt = Date.now();
        const check = () => {
          if (window.WALK && typeof window.WALK.getViewer === "function") {
            const viewer = window.WALK.getViewer();
            if (viewer) {
              resolve(viewer);
              return;
            }
          }

          if (Date.now() - startedAt > 15000) {
            reject(new Error("Shapespark viewer was not available within 15 seconds."));
            return;
          }

          window.setTimeout(check, 100);
        };

        check();
      });
    }

    onSceneReady(callback) {
      if (this.viewer && typeof this.viewer.onSceneReadyToDisplay === "function") {
        this.viewer.onSceneReadyToDisplay(callback);
      } else {
        callback();
      }
    }

    hideDefaultControls() {
      document.body.classList.add("olc-hide-shapespark-ui");
      SHAPESPARK_UI_SELECTORS.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (!element.closest(`#${APP_ROOT_ID}`)) {
            element.style.display = "none";
            element.setAttribute("aria-hidden", "true");
          }
        });
      });
    }

    watchDefaultControls() {
      this.hideDefaultControls();

      const observer = new MutationObserver(() => this.hideDefaultControls());
      observer.observe(document.body, { childList: true, subtree: true });

      window.setTimeout(() => this.hideDefaultControls(), 250);
      window.setTimeout(() => this.hideDefaultControls(), 1000);
      window.setTimeout(() => this.hideDefaultControls(), 2500);
    }

    setEditableMaterials(materialNames) {
      if (!this.viewer || typeof this.viewer.setMaterialEditable !== "function") {
        return;
      }

      new Set(materialNames.filter(Boolean)).forEach((name) => {
        try {
          this.viewer.setMaterialEditable(name);
        } catch (error) {
          console.warn("Unable to mark material editable:", name, error);
        }
      });
    }

    setEditableNodes(nodeNames) {
      if (!this.viewer || typeof this.viewer.setNodeTypeEditable !== "function") {
        return;
      }

      new Set(nodeNames.filter(Boolean)).forEach((name) => {
        try {
          this.viewer.setNodeTypeEditable(name);
        } catch (error) {
          console.warn("Unable to mark node editable:", name, error);
        }
      });
    }

    addAnchors(anchorConfigs, onAnchorClick) {
      if (!this.viewer || typeof this.viewer.addAnchor !== "function") {
        return;
      }

      if ("anchorsVisible" in this.viewer) {
        this.viewer.anchorsVisible = true;
      }

      anchorConfigs.forEach((anchorConfig) => {
        try {
          const anchorObject = this.viewer.addAnchor(anchorConfig, (anchor) => {
            const config = this.anchorConfigByObject.get(anchor) || anchorConfig;
            onAnchorClick(config);
          });
          this.anchorConfigByObject.set(anchorObject, anchorConfig);
        } catch (error) {
          console.warn("Unable to add anchor:", anchorConfig.name, error);
        }
      });
    }

    switchToView(viewName) {
      if (!viewName || !this.viewer || typeof this.viewer.switchToView !== "function") {
        return;
      }

      try {
        this.viewer.switchToView(viewName);
      } catch (error) {
        console.warn("Unable to switch view:", viewName, error);
      }
    }

    showHideNode(nodeName, nodeNamesToHide) {
      if (!this.viewer || typeof this.viewer.findNodesOfType !== "function") {
        return;
      }

      nodeNamesToHide.forEach((name) => {
        this.findNodes(name).forEach((node) => {
          if (typeof node.hide === "function") {
            node.hide();
          }
        });
      });

      this.findNodes(nodeName).forEach((node) => {
        if (typeof node.show === "function") {
          node.show();
        }
      });

      this.requestFrame();
    }

    applyMaterial(nodeName, materialName) {
      if (!this.viewer || typeof this.viewer.findMaterial !== "function") {
        return;
      }

      const material = this.viewer.findMaterial(materialName);
      if (!material) {
        console.warn("Material not found:", materialName);
        return;
      }

      this.findNodes(nodeName).forEach((node) => {
        if (node.mesh && typeof this.viewer.setMaterialForMesh === "function") {
          this.viewer.setMaterialForMesh(material, node.mesh);
        }
      });

      this.requestFrame();
    }

    applyTexture(imageUrl, materialName) {
      if (!imageUrl || !materialName || !this.viewer) {
        return;
      }

      const image = new window.Image();
      image.crossOrigin = "anonymous";

      image.onload = () => {
        if (typeof this.viewer.createTextureFromHtmlImage !== "function") {
          console.warn("Shapespark createTextureFromHtmlImage API is unavailable.");
          return;
        }

        const material = this.viewer.findMaterial(materialName);
        if (!material) {
          console.warn("Material not found:", materialName);
          return;
        }

        material.baseColorTexture = this.viewer.createTextureFromHtmlImage(image);
        this.requestFrame();
      };

      image.onerror = () => {
        console.error("Failed to load material image:", imageUrl);
      };

      image.src = imageUrl;
    }

    findNodes(nodeName) {
      try {
        const nodes = this.viewer.findNodesOfType(nodeName);
        return Array.isArray(nodes) ? nodes : Array.from(nodes || []);
      } catch (error) {
        console.warn("Unable to find node type:", nodeName, error);
        return [];
      }
    }

    requestFrame() {
      if (this.viewer && typeof this.viewer.requestFrame === "function") {
        this.viewer.requestFrame();
      }
    }

    async captureScene(options) {
      if (!this.viewer || typeof this.viewer.captureImage !== "function") {
        throw new Error("Shapespark captureImage API is unavailable.");
      }

      return this.viewer.captureImage(options || { toDataUrl: true });
    }
  }

  class ConfigStore {
    constructor() {
      this.nodes = {};
      this.anchors = [];
      this.views = DEFAULT_VIEW_BUTTONS.slice();
    }

    async load() {
      const response = await fetch(SCENE_CONFIG_URL, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(`Unable to load ${SCENE_CONFIG_URL}: ${response.status}`);
      }

      const config = await response.json();
      this.buildFromConfig(config);
      return this;
    }

    buildFromConfig(config) {
      const extensions = Array.isArray(config.extensions) && config.extensions.length
        ? config.extensions
        : DEFAULT_EXTENSIONS;
      this.anchors = extensions
        .filter((extension) => extension.enabled !== false && extension.trigger && extension.trigger.position)
        .map((extension) => {
          const isSwitch = /switch/i.test(extension.type || "");
          return {
            name: extension.name,
            position: extension.trigger.position,
            type: extension.trigger.type || "sphere",
            icon: isSwitch ? "question" : "info",
            radius: 0.15,
            tabType: isSwitch ? "Mesh" : "Material"
          };
        });

      extensions.forEach((extension) => {
        if (extension.enabled === false) {
          return;
        }

        const key = anchorIdToNodeKey[extension.name] || extension.name;
        const configuredMeshes = meshMap[key] || this.meshesFromExtension(extension);
        const hasMaterials = Array.isArray(extension.toPick) || extension.toReplace;

        if (!hasMaterials && configuredMeshes.length === 0) {
          return;
        }

        const materialNames = hasMaterials
          ? [...(extension.toPick || []), extension.toReplace].filter(Boolean)
          : [];
        const materials = materialNames.map((name) => ({
          name,
          url: this.getMaterialUrl(name),
          sku: this.getMaterialSku(name)
        }));
        const existing = this.nodes[key] || {};

        this.nodes[key] = {
          key,
          label: labelMap[key] || labelMap[extension.name] || key,
          materials: existing.materials || materials,
          meshes: existing.meshes || configuredMeshes,
          defaultNode: existing.defaultNode || this.findDefaultMesh(configuredMeshes),
          defaultMaterial: existing.defaultMaterial || extension.toReplace || "",
          selectedNode: existing.selectedNode,
          selectedMaterial: existing.selectedMaterial,
          view: existing.view || viewMap[key] || viewMap[extension.name] || ""
        };
      });

      Object.keys(meshMap).forEach((key) => {
        if (!this.nodes[key]) {
          this.nodes[key] = {
            key,
            label: labelMap[key] || key,
            materials: [],
            meshes: meshMap[key],
            defaultNode: this.findDefaultMesh(meshMap[key]),
            defaultMaterial: "",
            view: viewMap[key] || ""
          };
        }
      });

      this.views = this.buildViewList(config);
    }

    meshesFromExtension(extension) {
      if (!/switch/i.test(extension.type || "") || !Array.isArray(extension.nodeTypes)) {
        return [];
      }

      return extension.nodeTypes.map((name, index) => ({
        name,
        default: index === 0,
        url: ""
      }));
    }

    getMaterialUrl(name) {
      const value = materialImageMap[name];
      if (typeof value === "string") {
        return value;
      }
      if (value && typeof value === "object") {
        return value.url || "";
      }
      return `https://via.placeholder.com/240x160?text=${encodeURIComponent(name)}`;
    }

    getMaterialSku(name) {
      const value = materialImageMap[name];
      return value && typeof value === "object" ? value.sku || "" : "";
    }

    findDefaultMesh(meshes) {
      const defaultMesh = meshes.find((mesh) => mesh.default);
      return defaultMesh ? defaultMesh.name : meshes[0]?.name || "";
    }

    buildViewList(config) {
      const byView = new Map();

      if (Array.isArray(config?.views)) {
        config.views
          .filter((view) => view && view.name && view.hideFromMenu !== true)
          .forEach((view) => byView.set(view.name, { label: view.name, view: view.name }));
      }

      DEFAULT_VIEW_BUTTONS.forEach((entry) => {
        if (!byView.has(entry.view)) {
          byView.set(entry.view, entry);
        }
      });

      Object.values(this.nodes).forEach((node) => {
        if (node.view && !byView.has(node.view)) {
          byView.set(node.view, { label: node.label, view: node.view });
        }
      });

      return Array.from(byView.values());
    }
  }

  class DisplayManager {
    constructor(container, labelResolver) {
      this.container = container;
      this.labelResolver = labelResolver;
    }

    renderItems(items, selectedName, onClick) {
      DOMUtils.clearChildren(this.container);

      if (!items.length) {
        const empty = DOMUtils.create("div", "olc-empty", "No options available");
        this.container.appendChild(empty);
        return;
      }

      items.forEach((item) => {
        const tile = DOMUtils.button("olc-item-tile", "", () => onClick(item), this.labelResolver(item.name));
        tile.dataset.name = item.name;

        if (item.name === selectedName) {
          tile.classList.add("is-selected");
          tile.setAttribute("aria-pressed", "true");
        } else {
          tile.setAttribute("aria-pressed", "false");
        }

        if (item.url) {
          const image = document.createElement("img");
          image.src = item.url;
          image.alt = this.labelResolver(item.name);
          image.className = "olc-item-thumbnail";
          image.loading = "lazy";
          tile.appendChild(image);
        } else {
          tile.appendChild(DOMUtils.create("span", "olc-item-placeholder", this.initialsFor(item.name)));
        }

        const label = DOMUtils.create("span", "olc-item-label", this.labelResolver(item.name));
        tile.appendChild(label);

        if (item.sku) {
          tile.appendChild(DOMUtils.create("span", "olc-item-meta", item.sku));
        }

        this.container.appendChild(tile);
      });
    }

    initialsFor(value) {
      return String(value || "?")
        .replace(/[{}_.-]/g, " ")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }
  }

  class OverlayUI {
    constructor(app) {
      this.app = app;
      this.root = null;
      this.infoPopover = null;
      this.menu = null;
      this.panel = null;
      this.panelTitle = null;
      this.selector = null;
      this.pickerContainer = null;
      this.materialTab = null;
      this.meshTab = null;
      this.displayContainer = null;
      this.displayManager = null;
    }

    mount() {
      const existing = document.getElementById(APP_ROOT_ID);
      if (existing) {
        existing.remove();
      }

      this.root = DOMUtils.create("div", "olc-root");
      this.root.id = APP_ROOT_ID;
      this.root.setAttribute("aria-live", "polite");

      this.createInfoButton();
      this.createFloatingMenu();
      this.createPanel();

      document.body.appendChild(this.root);
      this.displayManager = new DisplayManager(this.displayContainer, (name) => this.app.labelFor(name));
    }

    createInfoButton() {
      const topLeft = DOMUtils.create("div", "olc-top-left");
      const infoButton = DOMUtils.button("olc-round-button", "i", () => {
        this.infoPopover.classList.toggle("is-open");
      }, "Info");

      this.infoPopover = DOMUtils.create("div", "olc-info-popover");
      this.infoPopover.appendChild(DOMUtils.create("div", "olc-popover-title", "Views"));

      const viewList = DOMUtils.create("div", "olc-view-list");
      this.app.store.views.forEach((entry) => {
        const button = DOMUtils.button("olc-view-button", entry.label, () => {
          this.infoPopover.classList.remove("is-open");
          this.app.goToView(entry.view);
        }, `Go to ${entry.label}`);
        viewList.appendChild(button);
      });

      this.infoPopover.appendChild(viewList);
      topLeft.appendChild(infoButton);
      topLeft.appendChild(this.infoPopover);
      this.root.appendChild(topLeft);
    }

    createFloatingMenu() {
      this.menu = DOMUtils.create("nav", "olc-floating-menu");
      this.menu.setAttribute("aria-label", "Configurator menu");

      this.app.groups().forEach((group) => {
        const button = DOMUtils.button("olc-menu-button", group.label, () => {
          this.app.openGroup(group.key);
        }, group.label);
        button.dataset.key = group.key;
        this.menu.appendChild(button);
      });

      this.root.appendChild(this.menu);
    }

    createPanel() {
      this.panel = DOMUtils.create("section", "olc-panel");
      this.panel.setAttribute("aria-label", "Material and mesh options");

      const header = DOMUtils.create("div", "olc-panel-header");
      this.panelTitle = DOMUtils.create("div", "olc-panel-title", "Customize");
      const closeButton = DOMUtils.button("olc-icon-button", "x", () => this.app.closePanel(), "Close");
      header.appendChild(this.panelTitle);
      header.appendChild(closeButton);

      this.selector = document.createElement("select");
      this.selector.className = "olc-selector";
      this.selector.setAttribute("aria-label", "Choose object");
      Object.values(this.app.store.nodes).forEach((node) => {
        const option = document.createElement("option");
        option.value = node.key;
        option.textContent = node.label;
        this.selector.appendChild(option);
      });
      this.selector.addEventListener("change", (event) => {
        this.app.openNode(event.target.value, this.app.state.activeTab, { keepView: true });
      });

      this.pickerContainer = DOMUtils.create("div", "olc-picker-list");

      const tabs = DOMUtils.create("div", "olc-tabs");
      this.meshTab = DOMUtils.button("olc-tab", "Mesh", () => this.app.setTab("Mesh"), "Show mesh options");
      this.materialTab = DOMUtils.button("olc-tab", "Material", () => this.app.setTab("Material"), "Show material options");
      tabs.appendChild(this.meshTab);
      tabs.appendChild(this.materialTab);

      this.displayContainer = DOMUtils.create("div", "olc-display-container");

      this.panel.appendChild(header);
      this.panel.appendChild(this.pickerContainer);
      this.panel.appendChild(this.selector);
      this.panel.appendChild(tabs);
      this.panel.appendChild(this.displayContainer);
      this.root.appendChild(this.panel);
    }

    setPanelOpen(isOpen) {
      this.panel.classList.toggle("is-open", isOpen);
    }

    render() {
      if (this.app.state.mode === "Group") {
        this.renderGroup();
        return;
      }

      const node = this.app.currentNode();
      if (!node) {
        this.setPanelOpen(false);
        return;
      }

      this.pickerContainer.hidden = true;
      this.selector.hidden = false;
      this.meshTab.parentElement.hidden = false;
      this.displayContainer.hidden = false;
      this.panelTitle.textContent = node.label;
      this.selector.value = node.key;

      this.menu.querySelectorAll(".olc-menu-button").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.key === this.app.groupForNode(node.key)?.key);
      });

      const hasMeshes = node.meshes.length > 0;
      const hasMaterials = node.materials.length > 0;
      this.meshTab.disabled = !hasMeshes;
      this.materialTab.disabled = !hasMaterials;
      this.meshTab.classList.toggle("is-active", this.app.state.activeTab === "Mesh");
      this.materialTab.classList.toggle("is-active", this.app.state.activeTab === "Material");

      const isMesh = this.app.state.activeTab === "Mesh";
      const items = isMesh ? node.meshes : node.materials;
      const selectedName = isMesh ? node.selectedNode || node.defaultNode : node.selectedMaterial || node.defaultMaterial;

      this.displayManager.renderItems(items, selectedName, (item) => {
        if (isMesh) {
          this.app.selectMesh(item.name);
        } else {
          this.app.selectMaterial(item);
        }
      });

      this.setPanelOpen(this.app.state.panelOpen);
    }

    renderGroup() {
      const group = this.app.currentGroup();
      if (!group) {
        this.setPanelOpen(false);
        return;
      }

      this.panelTitle.textContent = group.label;
      this.pickerContainer.hidden = false;
      this.selector.hidden = true;
      this.meshTab.parentElement.hidden = true;
      this.displayContainer.hidden = true;
      DOMUtils.clearChildren(this.pickerContainer);

      group.nodes
        .map((key) => this.app.store.nodes[key])
        .filter(Boolean)
        .forEach((node) => {
          const button = DOMUtils.button("olc-picker-button", node.label, () => {
            const preferredTab = node.materials.length ? "Material" : "Mesh";
            this.app.openNode(node.key, preferredTab, { keepView: true });
          }, node.label);
          this.pickerContainer.appendChild(button);
        });

      this.menu.querySelectorAll(".olc-menu-button").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.key === group.key);
      });

      this.setPanelOpen(this.app.state.panelOpen);
    }
  }

  class InteriorLivingConfigurator {
    constructor() {
      this.viewer = new ViewerAdapter();
      this.store = new ConfigStore();
      this.ui = new OverlayUI(this);
      this.state = {
        activeNodeKey: "",
        activeGroupKey: "",
        activeTab: "Material",
        mode: "Node",
        panelOpen: false
      };
      this.sceneReadyHandled = false;
    }

    async init() {
      ensureStylesheet();
      await Promise.all([this.viewer.init(), this.store.load()]);

      this.ui.mount();
      this.installPublicApi();
      this.viewer.watchDefaultControls();
      this.viewer.onSceneReady(() => this.onSceneReadyOnce());
      window.setTimeout(() => this.onSceneReadyOnce(), 1000);

      const firstNode = Object.values(this.store.nodes)[0];
      if (firstNode) {
        this.state.activeNodeKey = firstNode.key;
        this.ensureValidTab(firstNode);
        this.ui.render();
      }
    }

    onSceneReadyOnce() {
      if (this.sceneReadyHandled) {
        return;
      }

      this.sceneReadyHandled = true;
      this.viewer.hideDefaultControls();
      this.viewer.setEditableMaterials(this.editableMaterialNames());
      this.viewer.setEditableNodes(this.editableNodeNames());
      this.viewer.addAnchors(this.store.anchors, (anchorConfig) => this.openAnchor(anchorConfig));
      this.viewer.requestFrame();
    }

    installPublicApi() {
      window.OneLoomInterior = {
        open: (key, tab) => this.openNode(key, tab),
        close: () => this.closePanel(),
        switchToView: (view) => this.goToView(view),
        selectMaterial: (key, materialName) => {
          this.openNode(key, "Material", { keepView: true });
          const node = this.currentNode();
          const item = node?.materials.find((material) => material.name === materialName);
          if (item) {
            this.selectMaterial(item);
          }
        },
        selectMesh: (key, meshName) => {
          this.openNode(key, "Mesh", { keepView: true });
          this.selectMesh(meshName);
        },
        captureScene: (options) => this.viewer.captureScene(options)
      };
    }

    editableMaterialNames() {
      return Object.values(this.store.nodes).flatMap((node) => [
        node.defaultMaterial,
        ...node.materials.map((material) => material.name)
      ]);
    }

    editableNodeNames() {
      return Object.values(this.store.nodes).flatMap((node) => node.meshes.map((mesh) => mesh.name));
    }

    openAnchor(anchorConfig) {
      const key = anchorIdToNodeKey[anchorConfig.name] || anchorConfig.name;
      const tab = anchorConfig.tabType || "Material";
      this.openNode(key, tab, { keepView: true });
    }

    groups() {
      return configuratorGroups.filter((group) => group.nodes.some((key) => this.store.nodes[key]));
    }

    currentGroup() {
      return this.groups().find((group) => group.key === this.state.activeGroupKey);
    }

    groupForNode(nodeKey) {
      return this.groups().find((group) => group.nodes.includes(nodeKey));
    }

    openGroup(groupKey) {
      const group = this.groups().find((entry) => entry.key === groupKey);
      if (!group) {
        console.warn("Unknown configurator group:", groupKey);
        return;
      }

      this.state.activeGroupKey = group.key;
      this.state.mode = "Group";
      this.state.panelOpen = true;

      if (group.view) {
        this.goToView(group.view);
      }

      this.ui.render();
    }

    openNode(key, preferredTab, options) {
      const node = this.store.nodes[key];
      if (!node) {
        console.warn("Unknown configurator node:", key);
        return;
      }

      this.state.activeNodeKey = key;
      this.state.activeGroupKey = this.groupForNode(key)?.key || "";
      this.state.mode = "Node";
      this.state.panelOpen = true;
      this.state.activeTab = preferredTab || this.state.activeTab;
      this.ensureValidTab(node);

      if (!options?.keepView && node.view) {
        this.goToView(node.view);
      }

      if (!node.selectedNode) {
        node.selectedNode = node.defaultNode;
      }

      this.ui.render();
    }

    closePanel() {
      this.state.panelOpen = false;
      this.ui.setPanelOpen(false);
      this.ui.menu.querySelectorAll(".olc-menu-button").forEach((button) => {
        button.classList.remove("is-active");
      });
    }

    setTab(tab) {
      const node = this.currentNode();
      if (!node) {
        return;
      }

      this.state.activeTab = tab;
      this.ensureValidTab(node);
      this.ui.render();
    }

    ensureValidTab(node) {
      if (this.state.activeTab === "Material" && node.materials.length === 0) {
        this.state.activeTab = "Mesh";
      }
      if (this.state.activeTab === "Mesh" && node.meshes.length === 0) {
        this.state.activeTab = "Material";
      }
    }

    selectMesh(meshName) {
      const node = this.currentNode();
      if (!node) {
        return;
      }

      const meshesToHide = node.meshes
        .filter((mesh) => mesh.name !== meshName)
        .map((mesh) => mesh.name);

      node.selectedNode = meshName;
      this.viewer.showHideNode(meshName, meshesToHide);
      this.ui.render();
    }

    selectMaterial(item) {
      const node = this.currentNode();
      if (!node) {
        return;
      }

      if (!node.selectedNode) {
        node.selectedNode = node.defaultNode;
      }

      node.selectedMaterial = item.name;
      this.viewer.applyTexture(item.url, node.defaultMaterial);
      this.ui.render();
    }

    goToView(viewName) {
      this.viewer.switchToView(viewName);
    }

    currentNode() {
      return this.store.nodes[this.state.activeNodeKey];
    }

    labelFor(name) {
      return itemLabelMap[name] || labelMap[name] || name;
    }
  }

  function ensureStylesheet() {
    const hasStylesheet = Array.from(document.styleSheets).some((stylesheet) => {
      return stylesheet.href && stylesheet.href.includes(STYLESHEET_URL);
    });

    if (!hasStylesheet && !document.querySelector(`link[href$="${STYLESHEET_URL}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = STYLESHEET_URL;
      document.head.appendChild(link);
    }
  }

  function bootstrap() {
    const app = new InteriorLivingConfigurator();
    app.init().catch((error) => {
      console.error("Failed to initialize OneLoom interior configurator:", error);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
