onload = function(){
    // canvasエレメントを取得
    const c = document.getElementById('canvas');
    c.width = 500;
    c.height = 300;

    // webglコンテキストを取得
    gl = c.getContext('webgl2')
    // canvasを黒でクリア(初期化)する
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const v_shader = create_shader("vs");
    const f_shader = create_shader("fs");
    
    // プログラムオブジェクトの生成とリンク
    const prg = create_program(v_shader, f_shader);
    
    // vLocationの取得
    const VERTEX_SIZE = 3
    const COLOR_SIZE = 4
    const STRIDE = (VERTEX_SIZE + COLOR_SIZE) * Float32Array.BYTES_PER_ELEMENT;
    const POSITION_OFFSET = 0;
    const COLOR_OFFSET = VERTEX_SIZE * Float32Array.BYTES_PER_ELEMENT;

    const vertexBuffer = gl.createBuffer();
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const indexBuffer = gl.createBuffer();

    const vAttribLocation = gl.getAttribLocation(prg, 'vertexPosition');
    gl.enableVertexAttribArray(vAttribLocation);
    gl.vertexAttribPointer(vAttribLocation, VERTEX_SIZE, gl.FLOAT, false, STRIDE, POSITION_OFFSET);
    const vertices = new Float32Array([
        -1.0, 1.0,  0.0,      // xyz
        1.0,  0.0,  0.0, 1.0, // rgba
        -1.0, -1.0, 0.0,
        0.0,  1.0,  0.0, 1.0,
        1.0,  1.0,  0.0,
        0.0,  0.0,  1.0, 1.0,
        1.0,  -1.0, 0.0,
        0.0,  0.0,  0.0, 1.0
    ]);

    const indices = new Uint16Array([
        0, 1, 2,
        1, 3, 2
    ]);

    const colorAttribLocation = gl.getAttribLocation(prg, 'color');
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.vertexAttribPointer(colorAttribLocation, COLOR_SIZE, gl.FLOAT, false, STRIDE, COLOR_OFFSET);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    
    const indexSize = indices.length;
    gl.drawElements(gl.TRIANGLES, indexSize, gl.UNSIGNED_SHORT, 0);


};

function create_shader(id){
    // シェーダを格納する変数
    let shader;
    // HTMLからscriptタグへの参照を取得
    const scriptElement = document.getElementById(id);
    // scriptタグが存在しない場合は抜ける
    if(!scriptElement){return;}
    // scriptタグのtype属性をチェック
    switch(scriptElement.type){
        // 頂点シェーダの場合
        case 'x-shader/x-vertex':
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
            
        // フラグメントシェーダの場合
        case 'x-shader/x-fragment':
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

function create_program(vs, fs){
    
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
