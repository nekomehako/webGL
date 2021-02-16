function addGUI(){
    // GUIパラメータ
    let guiCtrl = function(){
        //this.resolution = 1;
        this.binarization = 0.94;
        this.lightPos_x = 0.5;
        this.lightPos_y = 0.5;
        this.lightTarget_x = 0.6;
        this.lightTarget_y = 0.6;
    };

    gui = new dat.GUI();
    guiObj = new guiCtrl();
    let folder = gui.addFolder('Folder');
    //folder.add( guiObj, 'resolution', {'x0.5': 0.5, 'x1': 1}).onChange(onWindowResize());
    folder.add(guiObj, 'binarization', 0., 1.);
    folder.add(guiObj, 'lightPos_x', 0., 1.);
    folder.add(guiObj, 'lightPos_y', 0., 1.);
    folder.add(guiObj, 'lightTarget_x', 0., 1.);
    folder.add(guiObj, 'lightTarget_y', 0., 1.);
    folder.open();
    
    function onWindowResize() {
        width = window.innerWidth;
        height = window.innerHeight;
    
        canvas.width = width * this.resolution;
        canvas.height = height * this.resolution;
    
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
    }
    return guiObj;
}