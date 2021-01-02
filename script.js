//フルウィンドウにする
const CANVAS_SIZE_X = window.innerWidth;
const CANVAS_SIZE_Y = window.innerHeight;
//マウス座標
let mouseX = 0,mouseY = 0; omouseX = 0, omouseY = 0, mousePress = 0;
let time = 0;
let fps = 1000 /30

window.onload = function(){
    // canvasエレメントを取得
    const c = document.getElementById('canvas');
    //キャンバスサイズを設定
    c.width = CANVAS_SIZE_X;
    c.height = CANVAS_SIZE_Y;
    //マウスがキャンバス上を動いているときマウス座標の取得
    c.addEventListener('mousemove', mouseMove, true);
    c.addEventListener('mousedown', mouseDown, true);
    c.addEventListener('mouseup', mouseUp, true);

    // webgl2コンテキストを取得
    const gl = c.getContext('webgl2')

    //シェーダーのコンパイル等
    const v_shader = create_shader(gl,"vs");
    const f_shader = create_shader(gl,"fs");
    
    // プログラムオブジェクトの生成とリンク
    const prg = create_program(gl ,v_shader, f_shader);

    //テクスチャ
    //フレームバッファの作成
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // 頂点情報の設定
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

    //レンダリング
    (function(){
        //色をリセット
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        //uniform vec2 resolution;
        gl.uniform2f(gl.getUniformLocation(prg, 'resolution'), CANVAS_SIZE_X, CANVAS_SIZE_Y);
        //uniform vec2 omouse;
        gl.uniform2f(gl.getUniformLocation(prg, 'omouse'), omouseX/CANVAS_SIZE_X, omouseY/CANVAS_SIZE_Y);
        //uniform vec2 mouse;
        gl.uniform2f(gl.getUniformLocation(prg, 'mouse'), mouseX/CANVAS_SIZE_X, mouseY/CANVAS_SIZE_Y);
        //uniform vec2 mousePress;
        gl.uniform1f(gl.getUniformLocation(prg, 'mousePress'), mousePress);
        //頂点の描画 gpuの起動
        gl.drawElements(gl.TRIANGLES, indices.length , gl.UNSIGNED_SHORT, 0);
        gl.flush();
        //再帰する
        setTimeout(arguments.callee, fps);
    })();
};
//マウス座標取得関数
function mouseMove(e){
    omouseX = mouseX; omouseY = mouseY;
    const rect = e.target.getBoundingClientRect();
    mouseX = e.offsetX-rect.left;
    mouseY = e.offsetY-rect.top;
}

//マウスがクリックされたときの関数
function mouseDown(e){
    mousePress = 1;
}

function mouseUp(e){
    mousePress = 0;
}
//シェーダーのコンパイル関数
function create_shader(gl, id){
    // シェーダを格納する変数
    let shader;
    // HTMLからscriptタグへの参照を取得
    const scriptElement = document.getElementById(id);
    // scriptタグが存在しない場合は抜ける
    if(!scriptElement){return;}
    // scriptタグのtype属性をチェック
    switch(scriptElement.type){
        // 頂点シェーダだったら
        case 'vertex-shader':
            shader = gl.createShader(gl.VERTEX_SHADER);
            break;
            
        // フラグメントシェーダだったら
        case 'fragment-shader':
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            break;
        default :
            return;
    }
    
    // 生成されたシェーダにソースを割り当てる
    gl.shaderSource(shader, scriptElement.text);
    // シェーダをコンパイル
    gl.compileShader(shader);
    // シェーダが正しくコンパイルできたか
    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){ 
        // 成功していたらシェーダを返して終了
        return shader;
    }else{
        // エラーログをアラートする
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
//テクスチャの生成ヘルパー関数
function createTexture(gl, sizeX, sizeY, internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, sizeX, sizeY, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}
//テクスチャをuniform変数に割り当てる
function setUniformTexture(gl, index, texture, location) {
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, index);
}