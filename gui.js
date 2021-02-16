function addGUI(){
    // GUIパラメータ
    let guiCtrl = function(){
        //this.resolution = 1;
        this.binarization = 0.94;
    };

    gui = new dat.GUI();
    guiObj = new guiCtrl();
    //gui.add( guiObj, 'resolution', {'x0.5': 0.5, 'x1': 1}).onChange(onWindowResize());
    gui.add(guiObj, 'binarization', 0., 1.);
    gui.open();
    
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