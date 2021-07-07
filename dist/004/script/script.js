
// = 004 ======================================================================
// このサンプルは、最初の状態では 003 とまったく同じ内容です。
// これを、みなさん自身の手で修正を加えて「描かれる図形を五角形に」してみてくだ
// さい。
// そんなの余裕じゃろ～ と思うかも知れませんが……結構最初は難しく感じる人も多い
// かもしれません。なお、正確な正五角形でなくても良いものとします。
// ポイントは以下の点を意識すること！
// * canvas 全体が XY 共に -1.0 ～ 1.0 の空間になっている
// * gl.TRIANGLES では頂点３個がワンセットで１枚のポリゴンになる
// * つまりいくつかの頂点は「まったく同じ位置に重複して配置される」ことになる
// * 頂点座標だけでなく、頂点カラーも同じ個数分必要になる！
// ============================================================================

(() => {
    // 複数の関数で利用する広いスコープが必要な変数を宣言しておく
    let position = [];
    let color = null;
    let vbo = null;
    let uniform = null;
    let mouse = [0, 0];
    let vertex = 5;

    // webgl.js に記載のクラスをインスタンス化する
    const webgl = new WebGLUtility();

    // ドキュメントの読み込みが完了したら実行されるようイベントを設定する
    window.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('webgl-canvas');
        webgl.initialize(canvas);
        const size = Math.min(window.innerWidth, window.innerHeight);
        webgl.width  = size;
        webgl.height = size;

        // マウスカーソルが動いた際のイベントを登録しておく
        window.addEventListener('mousemove', (event) => {
            mouse[0] = event.clientX / window.innerWidth;
            mouse[1] = event.clientY / window.innerHeight;
        }, false);

        // キーダウンイベント
        window.addEventListener('keydown', (event) => {
            switch(event.key){
                case 'ArrowRight':
                    vertex++;
                    break;
                case 'ArrowLeft':
                    vertex--;
                    break;
            }
        });

        let vs = null;
        let fs = null;
        WebGLUtility.loadFile('./shader/main.vert')
        .then((vertexShaderSource) => {
            vs = webgl.createShaderObject(vertexShaderSource, webgl.gl.VERTEX_SHADER);
            return WebGLUtility.loadFile('./shader/main.frag');
        })
        .then((fragmentShaderSource) => {
            fs = webgl.createShaderObject(fragmentShaderSource, webgl.gl.FRAGMENT_SHADER);
            webgl.program = webgl.createProgramObject(vs, fs);

            // 頂点とロケーションのセットアップは先に行っておく
            setupGeometry();
            setupLocation();

            // 準備ができたらレンダリングを開始
            render();
        });
    }, false);
    
    /**
     * N個の頂点座標を作成
     * デフォルトは三角形
     */
    function createCirclePositions(n = 3) {
        const positions = [];
        const radian = 2 * Math.PI / n;
        for (let i=1; i<=n; i++) {
            const x = Math.cos(radian * i);
            const y = Math.sin(radian * i);
            positions.push([x, y, 0]);
        }
        return positions;
    }

    /**
     * N個の頂点座標を作成
     * デフォルトは三角形
     */
    function createCircleColors(n = 3) {
        const colors = [];
        const radian = 2 * Math.PI / n;
        for (let i=1; i<=n; i++) {
            const x = Math.cos(radian * i);
            const y = Math.sin(radian * i);
            colors.push([x, y, x, 1.0]);
        }
        return colors;
    }

    /**
     * 頂点属性（頂点ジオメトリ）のセットアップを行う
     */
    function setupGeometry(){
        position = []
        color = []

        const positions = createCirclePositions(vertex);
        for (let i=0; i<vertex; i++) {
            let last = i + 1;
            if (i+1===vertex) last = 0;
            position.push([0, 0, 0])
            position.push(positions[i])
            position.push(positions[last])
        }
        position = position.flat();
        
        const colors = createCircleColors(vertex);
        for (let i=0; i<vertex; i++) {
            let last = i + 1;
            if (i+1===vertex) last = 0;
            color.push([0,0,0,1])
            color.push(colors[i])
            color.push(colors[last])
        }
        color = color.flat();

        // 配列に入れておく
        vbo = [
            webgl.createVBO(position),
            webgl.createVBO(color),
        ];
    }

    /**
     * 頂点属性のロケーションに関するセットアップを行う
     */
    function setupLocation(){
        const gl = webgl.gl;
        // attribute location の取得と有効化
        const attLocation = [
            gl.getAttribLocation(webgl.program, 'position'),
            gl.getAttribLocation(webgl.program, 'color'),
        ];
        const attStride = [3, 4];
        webgl.enableAttribute(vbo, attLocation, attStride);

        // uniform 変数のロケーションを取得する
        uniform = {
            mouse: gl.getUniformLocation(webgl.program, 'mouse'),
            // vertex: gl.getUniformLocation(webgl.program, 'vertex'),
        };
    }

    /**
     * レンダリングのためのセットアップを行う
     */
    function setupRendering(){
        const gl = webgl.gl;
        gl.viewport(0, 0, webgl.width, webgl.height);
        gl.clearColor(0.3, 0.3, 0.3, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    /**
     * レンダリングを行う
     */
    function render(){
        const gl = webgl.gl;

        // 再帰呼び出しを行う
        requestAnimationFrame(render);

        // レンダリング時のクリア処理など
        setupGeometry();
        setupLocation();
        setupRendering();

        // uniform 変数は常に変化し得るので毎フレーム値を送信する
        gl.uniform2fv(uniform.mouse, mouse);
        // gl.uniform1i(uniform.vertex, vertex);

        // 登録されている VBO の情報をもとに頂点を描画する
        gl.drawArrays(gl.TRIANGLES, 0, position.length / 3);
    }
})();

