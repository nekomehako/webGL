//フルウィンドウにする
const CANVAS_SIZE_X = window.innerWidth;
const CANVAS_SIZE_Y = window.innerHeight;
//マウス座標
let mouseX = 0,mouseY = 0; omouseX = 0, omouseY = 0, mousePress = 0;
let fps = 1000 /30;

window.onload = function(){
    // canvasエレメントを取得
    const c = document.getElementById('canvas');
    //キャンバスサイズを設定
    c.width = CANVAS_SIZE_X;
    c.height = CANVAS_SIZE_Y;
    //マウスがキャンバス上を動いているときマウス座標の取得
    c.addEventListener('mousemove', {width: c.width, height: c.height, handleEvent: mouseMove}, true);
    c.addEventListener('mousedown', function(){mousePress = 1}, true);
    c.addEventListener('mouseup', function(){mousePress = 0}, true);

    // webgl2コンテキストを取得
    gl = c.getContext('webgl2');

    //シェーダーのコンパイル等
    const v_shader = create_shader("vs");
    const f_shader = create_shader("fs");
    
    // プログラムオブジェクトの生成とリンク
    const backprg = create_program(v_shader, f_shader);
    // メインのフレームバッファーオブジェクトの作成
    const backFrameBuffer = create_fbo(c.width, c.height);

    const savef_shader = create_shader("fssave");
    const saveprg = create_program(v_shader, savef_shader);

    const passf_shader = create_shader("fsp");
    const passprg = create_program(v_shader, passf_shader);
    // previous texture保存用フレームバッファーオブジェクトの作成
    const saveFrameBuffer = create_fbo(c.width, c.height);

    // テクスチャを生成
    let texture;
    // イメージオブジェクトの生成
    const img = new Image();
    // データのオンロードをトリガーにする
    img.onload = function(){texture = create_texture(img);};
    // イメージオブジェクトのソースを指定
    img.src = "texture.png";

    const vertices = new Float32Array([
        -1.0, 1.0,  0.0,      // xyz
        -1.0, -1.0, 0.0,
        1.0,  1.0,  0.0,
        1.0,  -1.0, 0.0
    ]);
    const vertexBuffer = create_vbo(vertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    setAttribuLocation(backprg, 'vPos', 3);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const indices = new Uint16Array([
        0, 1, 2,
        1, 3, 2
    ]);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    const backprgUL = {
        resolution : gl.getUniformLocation(backprg, 'resolution'),
        omouse     : gl.getUniformLocation(backprg, 'omouse'),
        mouse      : gl.getUniformLocation(backprg, 'mouse'),
        mousePress : gl.getUniformLocation(backprg, 'mousePress'),
        time       : gl.getUniformLocation(backprg, 'time'),
        tex        : gl.getUniformLocation(backprg, 'tex'),
        previous        : gl.getUniformLocation(backprg, 'previous'),
    };
    const saveprgUL = {
        previous    : gl.getUniformLocation(saveprg, 'previous'),
    };
    const passprgUL = {
        previous   : gl.getUniformLocation(passprg, 'previous'),
        resolution : gl.getUniformLocation(passprg, 'resolution'),
        binarization: gl.getUniformLocation(passprg, 'binarization'),
        lightPos   : gl.getUniformLocation(passprg, 'lightPos'),
        lightTarget: gl.getUniformLocation(passprg, 'lightTarget'),
    };
    let start_time = Date.now(); 
    let now_time = 0;
    //レンダリング
    const guiParam = addGUI();
    (function(){
        now_time = (Date.now() - start_time)/1000;

        gl.bindFramebuffer(gl.FRAMEBUFFER, backFrameBuffer.f);
        gl.useProgram(backprg);
        //色をリセット
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        //uniform vec2 resolution;
        gl.uniform2f(backprgUL['resolution'], c.width, c.height);
        //uniform vec2 omouse;
        gl.uniform2f(backprgUL['omouse'], omouseX, omouseY);
        //uniform vec2 mouse;
        gl.uniform2f(backprgUL['mouse'], mouseX, mouseY);
        //uniform float mousePress;
        gl.uniform1f(backprgUL['mousePress'], mousePress);
        //uniform float time;
        gl.uniform1f(backprgUL['time'], now_time);
        //uniform sampler2D tex;
        setUniformTexture(backprgUL['tex'], 0, texture);
        //uniform sampler2D previous;
        setUniformTexture(backprgUL['previous'], 1, saveFrameBuffer.t);
        //頂点の描画 gpuの起動
        gl.drawElements(gl.TRIANGLES, indices.length , gl.UNSIGNED_SHORT, 0);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(passprg);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        setUniformTexture(passprgUL['previous'], 0, backFrameBuffer.t);
        gl.uniform2f(passprgUL['resolution'], c.width, c.height);
        gl.uniform1f(passprgUL['binarization'], guiParam.binarization);
        gl.uniform2f(passprgUL['lightPos'], guiParam.lightPos_x, guiParam.lightPos_y);
        gl.uniform2f(passprgUL['lightTarget'], guiParam.lightTarget_x, guiParam.lightTarget_y);
        gl.drawElements(gl.TRIANGLES, indices.length , gl.UNSIGNED_SHORT, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, saveFrameBuffer.f);
        gl.useProgram(saveprg);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        setUniformTexture(saveprgUL['previous'], 0, backFrameBuffer.t);
        gl.drawElements(gl.TRIANGLES, indices.length , gl.UNSIGNED_SHORT, 0);

        gl.flush();
        //再帰する
        setTimeout(arguments.callee, fps);
    })();
};
//マウス座標取得関数
function mouseMove(e){
    omouseX = mouseX; omouseY = mouseY;
    mouseX = e.offsetX/this.width;
    mouseY = -e.offsetY/this.height + 1;
}
//シェーダーのコンパイル関数
function create_shader(id){
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
        alert("id:"+ id +"\n" + gl.getShaderInfoLog(shader));
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
        // プログラムオブジェクトを返して終了
        return program;
    }else{
        // 失敗していたらエラーログをアラートする
        alert(gl.getProgramInfoLog(program));
    }
}

//テクスチャの生成ヘルパー関数
function create_texture(img) {
    const texture = gl.createTexture();
    // テクスチャをバインドする
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // テクスチャへイメージを適用
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    // ミップマップを生成
    gl.generateMipmap(gl.TEXTURE_2D);
    // テクスチャのバインドを無効化
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

//テクスチャをuniform変数に割り当てる
function setUniformTexture(location, index, texture) {
    gl.activeTexture(gl.TEXTURE0 + index);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(location, index);
}

function create_screenTexture(width, height){
    // テクスチャオブジェクトの作成
    const texture = gl.createTexture();
    // テクスチャオブジェクトの関連付け
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // テクスチャオブジェクトの設定
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // テクスチャオブジェクトの関連付け解除
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

function create_fbo(width, height){
    // フレームバッファーオブジェクトの作成
    const frameBuffer = gl.createFramebuffer();
    // フレームバッファーオブジェクトの関連付け
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    // テクスチャオブジェクトの作成
    const frameTexture = create_screenTexture(width, height);
    // テクスチャオブジェクトの関連付け
    gl.bindTexture(gl.TEXTURE_2D, frameTexture);
    // フレームバッファーにテクスチャオブジェクトを入れる
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frameTexture, 0);
    // どこに描画するか
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    //　関連付けの解除
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return {f: frameBuffer, t:frameTexture}
}

function create_vbo(data){
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

function setAttribuLocation(prg, name, size){
    const vAttribLocation = gl.getAttribLocation(prg, name);
    gl.enableVertexAttribArray(vAttribLocation);
    gl.vertexAttribPointer(vAttribLocation, size, gl.FLOAT, false, 0, 0);
}