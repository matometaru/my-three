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
    x: 5.0,
    y: 10.0,
    z: 10.0,
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

    createBox();
    // createGround();
    // createOuterBlock();
    // createInnerBlock();

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

    function createBox() {
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true
        });

        const geometry1 = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); 
        geometry1.setAttribute
        const box1 = new THREE.Mesh( geometry1, material );
        box1.position.set(1, 0, 1)
        scene.add(box1);
        const wVec1 = box1.getWorldPosition(new THREE.Vector3(2, 100, 2));
        console.log(`wVec1`)
        console.log(wVec1)
        const wVec2 = box1.localToWorld(new THREE.Vector3(2, 100, 2));
        console.log(`wVec2`)
        console.log(wVec2)

        // const geometry = new THREE.SphereGeometry(BLOCK_SIZE); 
        // geometry1.setAttribute
        // const sphere = new THREE.Mesh( geometry, material );
        // sphere.position.set(0, 0, -1)
        // box1.add(sphere)
        // console.log(`sphere.position`)
        // console.log(sphere.position)
        // console.log(`sphere.getWorldPosition`)
        // console.log(sphere.getWorldPosition(new THREE.Vector3(1,2,1)))
        // console.log(`sphere.localToWorld`)
        // console.log(sphere.localToWorld(new THREE.Vector3(1,2,1)))

        const geometry2 = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE); 
        const box2 = new THREE.Mesh( geometry2, material );
        box2.position.set(4 , 0, 1.500001)
        scene.add(box2);

        // マウスのクリックイベントの定義
        window.addEventListener('click', (event) => {
            console.log(box1.position)
            const raycaster = new THREE.Raycaster();
            raycaster.params.Line = { threshold: 100 }
            raycaster.params.Points = { threshold: 100 }
            const origin = new THREE.Vector3(box1.position.x+BLOCK_SIZE/2, box1.position.y, box1.position.z)
            const direction = new THREE.Vector3(1, 0, 0).normalize()
            raycaster.set(origin, direction)
            const intersects = raycaster.intersectObject(box2)
            console.log(intersects)
            if (intersects.length > 0) {
                for (const intersect of intersects) {
                    const points = [];
                    points.push(origin);
                    points.push(intersect.point);
                    
                    const geometry = new THREE.BufferGeometry().setFromPoints( points );
                    const material = new THREE.LineBasicMaterial({
                        color: 0xffff00
                    });
                    const line = new THREE.Line( geometry, material );
                    scene.add( line );
                    console.log(`2つのジオメトリの間の距離: ${intersect.distance}`)
                }
            }
        })
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