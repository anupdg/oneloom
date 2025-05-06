
  const viewer = WALK.getViewer();
var materialsNames = ['Floor_1', 'FAB_1', 'Wall_1', 'Wall_6', 'Wall_5', 'Floor_2', 'Floor_3', 'Floor_4', 'Floor_5', 'Wall_2', 'Wall_3', 'Wall_4', 'RUG_1', 'RUG_2', 'RUG_3', 'FAB_2', 'FAB_3', 'RUG_4', 'Wall_7'];
 
    materialsNames.forEach(name => {
      viewer.setMaterialEditable(name);
    });


