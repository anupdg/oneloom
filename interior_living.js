(function () {
  "use strict";

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
