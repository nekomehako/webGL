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
    const vLocationBuffer = gl.createBuffer();
    const vLocation = gl.getAttribLocation(prg, 'vertexPosition');
    gl.bindBuffer(gl.ARRAY_BUFFER, vLocationBuffer);
    gl.enableVertexAttribArray(vLocation);
    gl.vertexAttribPointer(vLocation, VERTEX_SIZE, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vLocationBuffer);
    const vertices = new Float32Array([
        -0.5, 0.5,  0.0,
        -0.5, -0.5, 0.0,
        0.5,  0.5,  0.0,
        -0.5, -0.5, 0.0,
        0.5,  -0.5, 0.0,
        0.5,  0.5,  0.0
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const COLOR_SIZE = 4
    const colorBuffer = gl.createBuffer();
    const color = gl.getAttribLocation(prg, 'color');
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.enableVertexAttribArray(color);
    gl.vertexAttribPointer(color, COLOR_SIZE, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const colors = new Float32Array([
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    const VERTEX_NUMS = 6;
    gl.drawArrays(gl.TRIANGLES, 0, VERTEX_NUMS);


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
