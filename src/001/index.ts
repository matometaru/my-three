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

const BLOCK_MATERIAL_PARAM = {
    color: 0xAAAAAA,
};
const GROUND_MATERIAL_PARAM = {
    color: 0x2E694F,
};

const BLOCK_SIZE = 1;
const BLOCK_MARGIN = 2;
const BLOCK_HALF_SIZE = 1/2;
const FIELD_SIZE = 20;
const BLOCK_LENGTH = FIELD_SIZE / 2 - 2;

window.addEventListener("DOMContentLoaded", () => {
    // レンダラー
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.querySelector('#canvas') as HTMLCanvasElement,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // シーン
    const scene = new THREE.Scene();

    // カメラ
    const camera = new THREE.PerspectiveCamera(
        CAMERA_PARAM.fovy,
        CAMERA_PARAM.aspect,
        CAMERA_PARAM.near,
        CAMERA_PARAM.far
    );
    camera.position.set(CAMERA_PARAM.x, CAMERA_PARAM.y, CAMERA_PARAM.z);
    camera.lookAt(CAMERA_PARAM.lookAt);
    const controls = new OrbitControls(camera);

    const light = createLight();
    scene.add(light);

    createGround();
    createOuterBlock();
    createInnerBlock();

    const axes = new THREE.AxesHelper(30);
    scene.add(axes);

    const tick = (): void => {
        requestAnimationFrame(tick);
        controls.update();

        renderer.render(scene, camera);
    };
    tick();

    /**
     * ライトを作成する
     */
    function createLight() {
        const ambientColor = "#dddddd";
        const light = new THREE.AmbientLight(ambientColor);
        return light;
    }

    function createGround() {
        const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const material = new THREE.MeshBasicMaterial(GROUND_MATERIAL_PARAM);
        for (let i = 0; i <= FIELD_SIZE; i++) {
            for (let j = 0; j <= FIELD_SIZE; j++) {
                console.log(`ground: i=${i} j=${j}`);
                const cube = new THREE.Mesh( geometry, material );
                cube.position.x = i+BLOCK_HALF_SIZE;
                cube.position.z = j+BLOCK_HALF_SIZE;
                cube.position.y = -BLOCK_HALF_SIZE;
                scene.add( cube );
            }
        }
    }

    function createOuterBlock() {
        const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const material = new THREE.MeshBasicMaterial(BLOCK_MATERIAL_PARAM);
        for (let i = 0; i <= FIELD_SIZE; i++) {
            for (let j = 0; j <= FIELD_SIZE; j++) {
                if ((j !== 0 && j <= FIELD_SIZE-1) && (i !== 0 && i <= FIELD_SIZE-1)) {
                    continue;
                }
                const canvasMap = new THREE.Texture();
                const cube = new THREE.Mesh( geometry, material );
                cube.position.x = i+BLOCK_HALF_SIZE;
                cube.position.z = j+BLOCK_HALF_SIZE;
                cube.position.y = +BLOCK_HALF_SIZE;
                scene.add( cube );
            }
        }
    }

    function createInnerBlock() {
        const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        const material = new THREE.MeshBasicMaterial(BLOCK_MATERIAL_PARAM);
        for (let i = 0; i <= BLOCK_LENGTH; i++) {
            for (let j = 0; j <= BLOCK_LENGTH; j++) {
                const cube = new THREE.Mesh( geometry, material );
                cube.position.x = i*BLOCK_MARGIN+BLOCK_HALF_SIZE+2;
                cube.position.z = j*BLOCK_MARGIN+BLOCK_HALF_SIZE+2;
                cube.position.y = BLOCK_HALF_SIZE;
                scene.add( cube );
            }
        }
    }

    function downBlock() {
        // 再帰処理
        downBlock();
    }
});