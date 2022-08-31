// @ts-nocheck 

(() => {
    window.addEventListener('DOMContentLoaded', () => {
        // special thanks! https://github.com/cocopon/tweakpane ===============
        const PANE = new Tweakpane({
            container: document.querySelector('#float-layer'),
        });
        PANE.addInput({'draw-box': drawBox}, 'draw-box')
        .on('change', (v) => {drawBox = v;});
        const RANGE = { min: -2, max: 2 };
        PANE.addInput({ boxX: 0 }, 'boxX', RANGE)
        .on('change', (v) => { box.position.x = v; });
        PANE.addInput({ boxZ: 0 }, 'boxZ', RANGE)
        .on('change', (v) => { box.position.z = v; });
        // ====================================================================

        window.addEventListener('click', (event) => {
            const x = event.clientX / window.innerWidth * 2.0 - 1.0;
            const y = event.clientY / window.innerHeight * 2.0 - 1.0;
            const v = new THREE.Vector2(x, -y);
            raycaster.setFromCamera(v, camera);

            const intersects = raycaster.intersectObjects(xxx.children[0].children, true);
            if(intersects.length > 0) {
                // console.log(intersects[0]);
                // alert(`
                // ${intersects[0].object.name}
                // ${intersects[0].object.uuid}
                // `);
                console.log(intersects[0].object.uuid);
                intersects[0].object.material = selectedMaterial;
                intersects[0].object.position.x += 10;
            } 
        });

        var loader = new THREE.ColladaLoader();

        // クリック時用マテリアルのパラメータ @@@
        const MATERIAL_PARAM_SELECTED = {
            color: 0xff3399,
            specular: 0xffffff,
        };
        selectedMaterial = new THREE.MeshPhongMaterial(MATERIAL_PARAM_SELECTED);

        init();
        loader.load('house.dae', (collada: any) => {
            console.log(collada.scene);
            console.log(collada.scene.children[0].children);
            xxx = collada.scene; 
            scene.add(xxx);

            const uuid = 'A408E4C9-BBE6-44E9-8C1C-D026D8B94123';
            壁 = xxx.getObjectByProperty('uuid', uuid);
            壁.position.x += 100;

            // scene.add(collada.scene.children[0].children[2].position.set(0, 0, 0));
            // scene.add(collada.scene.children[0].children[2].position.set(0, 0, 0));

            // [0][1] かべ全体
            // const y1 = collada.scene.children[0].children[1];
            // console.log(y1);
            // scene.add(y1);

            // [0][2] 扉のフレーム？
            // console.log("[0][2] 扉のフレーム？");
            // const y2 = collada.scene.children[0].children[2];
            // y2.position.set(0, 0, 0);
            // scene.add(y2);

            // houseModel = collada.scene;
            // console.log(collada.scene.children[0]);

            // houseModel = collada.scene.children[0];
            // console.log(collada.scene.children[0]);

            // houseModel = collada.scene.children[0].children[0];
            // console.log("こん");

            // var models = collada.scene;
            // const num = models.children[0].children.length;
            // console.log(`num = ${num}`);
            // for (i = 0; i < num; i++) {
            //     const modelsMesh = models.children[0].children[i];
            //     const num2 = modelsMesh.children.length;
            //     for (j = 0; j < num2; j++) {
            //         if(modelsMesh.children[j] instanceof THREE.Mesh === false) {
            //             console.log(`[${i}][${j}]: メッシュじゃない`);
            //             // console.log(modelsMesh.children[j])
            //         } else {
            //             console.log(`[${i}][${j}]: メッシュです`);
            //             scene.add(modelsMesh.children[j]);
            //         }
            //     }
            // }

            // const radian = -90 * ( Math.PI / 180 ) ;
            // houseModel.rotateX(radian);
            // scene.add(houseModel);
        });
        // 初期化処理
        // init();
    }, false);

    // 汎用変数
    let run = true; // レンダリングループフラグ
    let isDown = false; // スペースキーが押されているかどうかのフラグ
    let drawBox = false;

    // three.js に関連するオブジェクト用の変数
    let scene;      // シーン
    let camera;     // カメラ
    let renderer;   // レンダラ
    let geometry;   // ジオメトリ
    let material;   // マテリアル
    let box;        // ボックスメッシュ
    let controls;   // カメラコントロール
    let axisHelper; // 軸ヘルパーメッシュ
    let directionalLight; // ディレクショナル・ライト（平行光源） @@@
    let houseModel;
    let raycaster = new THREE.Raycaster();
    let xxx;
    let selectedMaterial;
    let 壁;

    // カメラに関するパラメータ
    const CAMERA_PARAM = {
        fovy: 60,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 1000.0,
        // x: -16.100,
        // y: -148.459707,
        // z: 117.50494,
        x: 3,
        y: 0,
        z: 0,
        lookAt: new THREE.Vector3(0, 0, 0),
    };

    // レンダラに関するパラメータ
    const RENDERER_PARAM = {
        clearColor: 0x666666,
        width: window.innerWidth,
        height: window.innerHeight,
    };
    // マテリアルに関するパラメータ
    const MATERIAL_PARAM = {
        color: 0x3399ff,
    };
    // ライトに関するパラメータの定義 @@@
    const DIRECTIONAL_LIGHT_PARAM = {
        color: 0xffffff, // 光の色
        intensity: 1.0,  // 光の強度
        x: 1.0,          // 光の向きを表すベクトルの X 要素
        y: 1.0,          // 光の向きを表すベクトルの Y 要素
        z: 1.0           // 光の向きを表すベクトルの Z 要素
    };

    function init(){
        // シーン
        scene = new THREE.Scene();

        // レンダラ
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
        renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
        const wrapper = document.querySelector('#webgl');
        wrapper.appendChild(renderer.domElement);

        // カメラ
        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAM.fovy,
            CAMERA_PARAM.aspect,
            CAMERA_PARAM.near,
            CAMERA_PARAM.far
        );
        camera.position.set(CAMERA_PARAM.x, CAMERA_PARAM.y, CAMERA_PARAM.z);
        camera.lookAt(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z + 1));

        // ジオメトリ、マテリアル、メッシュ生成
        // geometry = new THREE.BoxGeometry(0.5, 2.0, 0.5);
        // material = new THREE.MeshLambertMaterial(MATERIAL_PARAM);
        // box = new THREE.Mesh(geometry, material);
        // box.position.y = 1;
        // scene.add(box);

        directionalLight = new THREE.DirectionalLight(
            DIRECTIONAL_LIGHT_PARAM.color,
            DIRECTIONAL_LIGHT_PARAM.intensity
        );
        directionalLight.position.x = DIRECTIONAL_LIGHT_PARAM.x;
        directionalLight.position.y = DIRECTIONAL_LIGHT_PARAM.y;
        directionalLight.position.z = DIRECTIONAL_LIGHT_PARAM.z;
        scene.add(directionalLight);

        // コントロール
        controls = new THREE.OrbitControls(camera, renderer.domElement);

        // 軸ヘルパー
        axisHelper = new THREE.AxisHelper(5.0);
        scene.add(axisHelper);

        render();
    }

    function render(){
        // 再帰呼び出し
        if(run === true){requestAnimationFrame(render);}

        // コントロールの更新
        controls.update();

        // スペースキーが押されたフラグが立っている場合、メッシュを操作する
        if(isDown === true){
            box.rotation.y += 0.05;
        }

        // 描画
        renderer.render(scene, camera);
    }
})();

