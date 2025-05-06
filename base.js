
  const viewer = WALK.getViewer();
var materialsNames = ['Floor_1', 'FAB_1', 'Wall_1', 'Wall_6', 'Wall_5', 'Floor_2', 'Floor_3', 'Floor_4', 'Floor_5', 'Wall_2', 'Wall_3', 'Wall_4', 'RUG_1', 'RUG_2', 'RUG_3', 'FAB_2', 'FAB_3', 'RUG_4', 'Wall_7'];
 
    materialsNames.forEach(name => {
      viewer.setMaterialEditable(name);
    });

// Assuming 'viewer' is your Shapespark viewer instance

// Listen for all pick events
viewer.addEventListener('pick', function(event) {
    // Check if the clicked object is a MaterialPicker (based on your JSON configuration)
    if (event.object && event.object.type === 'MaterialPicker') {
        console.log('Material Picker clicked: ', event.object.name);

        // You can use this to check which material is being picked and handled
        if (event.object.toPick && event.object.toPick.length > 0) {
            console.log('Picked materials: ', event.object.toPick);
        }

        // Optionally, trigger additional logic here based on the clicked material
        // For example, you can change the material of a node here
    }
});

// For more specific trigger events, like "onEnter" or "onExit":
viewer.addEventListener('triggerenter', function(event) {
    if (event.object && event.object.type === 'MaterialPicker') {
        console.log('Entered trigger zone for MaterialPicker: ', event.object.name);
    }
});

viewer.addEventListener('triggerexit', function(event) {
    if (event.object && event.object.type === 'MaterialPicker') {
        console.log('Exited trigger zone for MaterialPicker: ', event.object.name);
    }
});

