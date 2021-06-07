import * as THREE from "three";
import { OrbitControls } from "three-orbitcontrols-ts";

// カメラに関するパラメータ @@@
const CAMERA_PARAM = {
    // fovy は Field of View Y のことで、縦方向の視野角を意味する
    fovy: 60,
    // アスペクト、とは縦横比（撮影する空間の縦横の比）のこと
    aspect: window.innerWidth / window.innerHeight,
    // ニア・クリップ面への距離（視錐台の最前面）
    near: 0.1,
    // ファー・クリップ面への距離（視錐台の最遠面）
    far: 60.0,
    // カメラの位置を XYZ で指定する（カメラも実は Object3D を継承しています！）
    x: 10.0,
    y: 20.0,
    z: 20.0,
    // カメラの注視点の座標（カメラが見つめている場所）
    lookAt: new THREE.Vector3(10.0, 0.0, 10.0),
};

// レンダラに関するパラメータ
const RENDERER_PARAM = {
    clearColor: 0,
    width: window.innerWidth,
    height: window.innerHeight,
};

const 弱 = 0.05;
const 中 = 0.2;
const 強 = 0.4;

const OFF = 0;
const ON = 1;

// 扇風機に関するパラメータ
const FAN = {
    speed: 弱,
    run: ON,
};

// 扇風機のカバーに関するパラメータ
const COVER_PARAM = {
    radius: 3, // 半径
    tube: 1, // 輪の太さ
    segments: 4,
    tubularSegments: 6,
    color: 0xc0c0c0
}

// 扇風機の羽に関するパラメータ
const WING_PARAM = {
    count: 3, // 羽の数
    radius: 3, // 半径
    segments: 3,
    thetaStart: 0,
    thetaLength: 1,
    color: 0xc0c0c0
};

(() => {
    window.addEventListener("DOMContentLoaded", () => {
        // リサイズイベントの定義
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }, false);

        // マウスのクリックイベントの定義
        window.addEventListener('click', (event) => {
            const x = event.clientX / window.innerWidth * 2.0 - 1.0;
            const y = event.clientY / window.innerHeight * 2.0 - 1.0;
            const v = new THREE.Vector2(x, -y);
            raycaster.setFromCamera(v, camera);

            const intersects = raycaster.intersectObjects([fanOnButton, fanOffButton]);
            if(intersects.length > 0){
                console.log(intersects);
                if (intersects[0].object.userData.isOnButton) {
                    if (fanSpeed === 弱) {
                        fanSpeed = 中;
                    }else if (fanSpeed === 中) {
                        fanSpeed = 強;
                    }else if (fanSpeed === 強 || fanSpeed === 0) {
                        fanSpeed = 弱;
                        swingSpeed = 0.01;
                    }
                }
                if (intersects[0].object.userData.isOffButton) {
                    fanSpeed = 0;
                    swingSpeed = 0;
                }
            }
        }, false);

        init();
    }, false);

    // three.js に関連するオブジェクト用の変数
    let scene;
    let camera;
    let renderer: THREE.WebGLRenderer;
    const raycaster = new THREE.Raycaster();

    let fanSpeed = FAN.speed;
    let swingSpeed = 0.01;

    const motorAndWing = new THREE.Group();
    // 扇風機の顔（カバー+モーター+羽）
    const fanFace = new THREE.Group();
    let fanOnButton: THREE.Mesh;
    let fanOffButton: THREE.Mesh;

    function init() {
        // レンダラー
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
        renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
        const wrapper = document.querySelector('#webgl');
        wrapper.appendChild(renderer.domElement);

        // シーン
        scene = new THREE.Scene();

        // カメラ
        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAM.fovy,
            CAMERA_PARAM.aspect,
            CAMERA_PARAM.near,
            CAMERA_PARAM.far
        );
        camera.position.set(CAMERA_PARAM.x, CAMERA_PARAM.y, CAMERA_PARAM.z);
        camera.lookAt(CAMERA_PARAM.lookAt);
        new OrbitControls(camera, renderer.domElement);

        const axes = new THREE.AxesHelper(30);
        scene.add(axes);

        // モーター
        const motorGeometry = new THREE.BoxGeometry(1, 1);
        const motor = new THREE.Mesh(motorGeometry);
        motorAndWing.add(motor);

        // 扇風機の羽
        const wingGroup = new THREE.Group();
        const wingMesh = new THREE.MeshBasicMaterial({color: WING_PARAM.color});
        for(let i = 0; i < WING_PARAM.count; ++i){
            const wingGeometry = new THREE.CircleGeometry(
                WING_PARAM.radius,
                WING_PARAM.segments,
                i*2,
                WING_PARAM.thetaLength
            );
            const wing = new THREE.Mesh(wingGeometry, wingMesh);
            wingGroup.add(wing);
        }
        motorAndWing.add(wingGroup);

        // 扇風機のカバー
        const coverGeometry = new THREE.TorusGeometry(
            COVER_PARAM.radius,
            COVER_PARAM.tube,
            COVER_PARAM.segments,
            COVER_PARAM.tubularSegments
        );
        const coverMaterial = new THREE.MeshBasicMaterial({color: COVER_PARAM.color, wireframe: true});
        const cover = new THREE.Mesh( coverGeometry, coverMaterial );
        fanFace.add(motorAndWing);
        fanFace.add(cover);
        scene.add(fanFace);
        fanFace.position.set(0, 8, 0);

        // 扇風機の支柱
        const propGeometry = new THREE.ConeGeometry(2, 4);
        const propMaterial = new THREE.MeshBasicMaterial({color: COVER_PARAM.color});
        const 扇風機の支柱 = new THREE.Mesh(propGeometry, propMaterial);
        扇風機の支柱.position.set(0, 2, 0);
        scene.add(扇風機の支柱);

        // 扇風機の「入」ボタン
        const fanButtonGeometry = new THREE.SphereGeometry(0.5);
        const fanOnButtonMaterial = new THREE.MeshBasicMaterial({color: 0x0000FF });
        fanOnButton = new THREE.Mesh(fanButtonGeometry, fanOnButtonMaterial);
        fanOnButton.position.x = 1;
        fanOnButton.position.z = 1.5;
        fanOnButton.position.y = 1;
        fanOnButton.userData.isOnButton = true;
        scene.add(fanOnButton);
        
        // 扇風機の「切」ボタン
        const fanOffButtonMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000 });
        fanOffButton = new THREE.Mesh(fanButtonGeometry, fanOffButtonMaterial);
        fanOffButton.position.x = -1;
        fanOffButton.position.z = 1.5;
        fanOffButton.position.y = 1;
        fanOffButton.userData.isOffButton = true;
        scene.add(fanOffButton);

        render();
    }

    let radian = 0;
    function render() {
        requestAnimationFrame(render);
        radian += swingSpeed;

        motorAndWing.rotation.z -= fanSpeed;
        fanFace.rotation.y = Math.sin(radian);

        renderer.render(scene, camera);
    };

})();