onload = function(){
    // canvasエレメントを取得
    const c = document.getElementById('canvas');
    const CANVAS_SIZE_X = 600.0;
    const CANVAS_SIZE_Y = 300.0;

    c.width = CANVAS_SIZE_X;
    c.height = CANVAS_SIZE_Y;

    // webglコンテキストを取得
    const gl = c.getContext('webgl2')
    // canvasを黒でクリア(初期化)する
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const v_shader = create_shader(gl,"vs");
    const f_shader = create_shader(gl,"fs");
    
    // プログラムオブジェクトの生成とリンク
    const prg = create_program(gl,v_shader, f_shader);
    
    gl.uniform2f(gl.getUniformLocation(prg, 'resolution'), CANVAS_SIZE_X, CANVAS_SIZE_Y);

    //texture
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    const velocityTexture = createTexture(gl, CANVAS_SIZE_X, CANVAS_SIZE_Y, gl.RG32F, gl.RG, gl.FLOAT)
    gl.bindTexture(gl.TEXTURE_2D, velocityTexture);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, velocityTexture, 0);

    const dencityTexture = createTexture(gl, CANVAS_SIZE_X, CANVAS_SIZE_Y, gl.R32F, gl.RED, gl.FLOAT)
    gl.bindTexture(gl.TEXTURE_2D, dencityTexture);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, dencityTexture, 0);

    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    const velocityLocation = gl.getUniformLocation(prg, 'u_velocity');
    setUniformTexture(gl, velocityLocation, velocityTexture);

    const dencityLocation = gl.getUniformLocation(prg, 'u_dencity');
    setUniformTexture(gl, dencityLocation, dencityTexture);

    // vLocationの取得
    const VERTEX_SIZE = 3

    const vertexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const indexBuffer = gl.createBuffer();

    const vAttribLocation = gl.getAttribLocation(prg, 'vertexPosition');
    gl.enableVertexAttribArray(vAttribLocation);
    gl.vertexAttribPointer(vAttribLocation, VERTEX_SIZE, gl.FLOAT, false, 0, 0);
    const vertices = new Float32Array([
        -1.0, 1.0,  0.0,      // xyz
        -1.0, -1.0, 0.0,
        1.0,  1.0,  0.0,
        1.0,  -1.0, 0.0,
    ]);

    const indices = new Uint16Array([
        0, 1, 2,
        1, 3, 2
    ]);


    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    const indexSize = indices.length;
    gl.drawElements(gl.TRIANGLES, indexSize, gl.UNSIGNED_SHORT, 0);

    gl.flush(); 
};

function create_shader(gl, id){
    // シェーダを格納する変数
    let shader;
    // HTMLからscriptタグへの参照を取得
    const scriptElement = document.getElementById(id);
    // scriptタグが存在しない場合は抜ける
    if(!scriptElement){return;}
    // scriptタグのtype属性をチェック
    switch(scriptElement.type){
        // 頂点シェーダの場合
        case 'vertex-shader':
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
            
        // フラグメントシェーダの場合
        case 'fragment-shader':
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            break;
        default :
            return;
    }
    
    // 生成されたシェーダにソースを割り当てる
    gl.shaderSource(shader, scriptElement.text);
    // シェーダをコンパイルする
    gl.compileShader(shader);
    // シェーダが正しくコンパイルされたかチェック
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){ 
        // 成功していたらシェーダを返して終了
        return shader;
    }else{
        // 失敗していたらエラーログをアラートする
        alert(gl.getShaderInfoLog(shader));
    }
}

function create_program(gl, vs, fs){
    
    // プログラムオブジェクトの生成
    const program = gl.createProgram();
    // プログラムオブジェクトにシェーダを割り当てる
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);

    // シェーダをリンク
    gl.linkProgram(program);
    
    // シェーダのリンクが正しく行なわれたかチェック
    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
    
        // 成功していたらプログラムオブジェクトを有効にする
        gl.useProgram(program);
        
        // プログラムオブジェクトを返して終了
        return program;
    }else{
        
        // 失敗していたらエラーログをアラートする
        alert(gl.getProgramInfoLog(program));
    }
}

function createTexture(gl, sizeX, sizeY, internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, sizeX, sizeY, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

function setUniformTexture(gl, index, texture, location) {
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, index);
}

function setUniformTexture(gl, index, texture, location) {
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, index);
  }