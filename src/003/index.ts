import * as THREE from "three";
import { Group } from "three";
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

// マテリアルのパラメータ
const MATERIAL_PARAM = {
    color: 0xffffff,
};

// ライトに関するパラメータ
const DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1.0,
    x: 1.0,
    y: 1.0,
    z: 1.0
};

// アンビエントライトに関するパラメータ
const AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.2,
};

// レンダラに関するパラメータ
const RENDERER_PARAM = {
    clearColor: 0,
    width: window.innerWidth,
    height: window.innerHeight,
};

const MATERIAL_PARAM_POINT = {
    color: 0xffffff,      // 頂点の色
    size: 0.05,           // 頂点の基本となるサイズ
    sizeAttenuation: true // 遠近感を出すかどうかの真偽値 @@@
};

// 月の移動量に対するスケール
const MOON_RANGE = 2.75;

const MOON_ORBIT = {
    vector1: new THREE.Vector3(1*MOON_RANGE, 1*MOON_RANGE, 0),
    vector2: new THREE.Vector3(0, 0, -1*MOON_RANGE),
};

// 地球の移動量に対するスケール
const EARTH_RANGE = 10.75;

const EARTH_ORBIT = {
    vector1: new THREE.Vector3(1*EARTH_RANGE, -0.2*EARTH_RANGE, 0),
    vector2: new THREE.Vector3(0, 0.2*EARTH_RANGE, 1*EARTH_RANGE),
};

(() => {
    window.addEventListener("DOMContentLoaded", async () => {
        // キーダウンイベント
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            switch(event.key){
                case 'Escape':
                    run = !run;
                    if(run === true){requestAnimationFrame(render);}
                    break;
                case ' ':
                    isShotted = true;
                    // その時の弾の単位ベクトルを求める
                    bulletUnitVector = sun.position.clone().sub(earthAndMoon.position).normalize();
                    bulletVector = bulletUnitVector.clone().multiplyScalar(0.1);
                    // 弾の初期位置を地球と同じにする
                    bullet.position.set(
                        earthAndMoon.position.x,
                        earthAndMoon.position.y,
                        earthAndMoon.position.z,
                    );
                    break;
                default:
            }
        }, false);

        // リサイズイベントの定義
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }, false);

        // 2つの画像のロードとテクスチャの生成
        [sunTexture, earthTexture, moonTexture, sunGlowTexture] = await Promise.all([
            asyncLoader('./magma.png'),
            asyncLoader('./earth.jpg'),
            asyncLoader('./moon.jpg'),
            asyncLoader('./glow2.png'),
        ]);
        init();
    }, false);

    let run = true;
    let startTime = 0; // レンダリング開始時のタイムスタンプ @@@

    let directionalLight;  // ディレクショナル・ライト（平行光源）
    let ambientLight;      // アンビエントライト（環境光）
    
    let geometry;          // ジオメトリ

    let sun: THREE.Mesh;
    let sunMaterial: THREE.MeshLambertMaterial;
    let sunTexture: THREE.Texture;
    let sunGlowTexture: THREE.Texture;
    let sunGlowMaterial: THREE.SpriteMaterial;

    let bullet: THREE.Mesh;
    // スペース押された時の弾の単位ベクトル
    let bulletUnitVector: THREE.Vector3;
    // 単位ベクトルをスカラー倍した実際の移動量
    let bulletVector: THREE.Vector3;
    let isShotted: boolean = false;

    let earthAndMoon = new THREE.Group();
    let earth: THREE.Mesh;
    let earthMaterial: THREE.MeshLambertMaterial;
    let earthTexture: THREE.Texture
    let moon: THREE.Mesh;
    let moonMaterial: THREE.MeshLambertMaterial; 
    let moonTexture: THREE.Texture

    let rocketGeometry;
    let rocket: THREE.Mesh;
    let rocketMaterial;
    let rocketVector: THREE.Vector3;

    // three.js に関連するオブジェクト用の変数
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;

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
        controls = new OrbitControls(camera, renderer.domElement);

        // スフィアジオメトリの生成
        geometry = new THREE.SphereGeometry(1.0, 64, 64);

        // 弾
        bullet = new THREE.Mesh(geometry, moonMaterial);
        bullet.scale.setScalar(0.3);
        scene.add(bullet);

        // 太陽
        sunMaterial = new THREE.MeshLambertMaterial(MATERIAL_PARAM);
        sunMaterial.map = sunTexture;
        sunTexture.wrapS = sunTexture.wrapT = THREE.RepeatWrapping;
        sun = new THREE.Mesh(geometry, sunMaterial);
        sun.scale.setScalar(3);
        scene.add(sun);

        sunGlowMaterial = new THREE.SpriteMaterial({
            map: sunGlowTexture,
            color: 0xffffff,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        const sprite = new THREE.Sprite(sunGlowMaterial)
        sprite.scale.multiplyScalar(10);
        scene.add(sprite);

        // 地球
        earthMaterial = new THREE.MeshLambertMaterial(MATERIAL_PARAM);
        earthMaterial.map = earthTexture;
        earth = new THREE.Mesh(geometry, earthMaterial);
        earthAndMoon.add(earth);

        // 月
        moonMaterial = new THREE.MeshLambertMaterial(MATERIAL_PARAM);
        moonMaterial.map = moonTexture;
        moon = new THREE.Mesh(geometry, moonMaterial);
        moon.scale.setScalar(0.36);
        moon.position.set(MOON_RANGE, 0.0, 0.0);
        earthAndMoon.add(moon);

        // ロケット @@@
        rocketGeometry = new THREE.ConeGeometry(0.2, 0.5, 32);
        rocketMaterial = new THREE.MeshLambertMaterial({color: 0x00ffff});
        rocket = new THREE.Mesh(rocketGeometry, rocketMaterial);
        rocket.scale.setScalar(5);
        // 初期位置を地球の上のあたりに移動させておく
        rocket.position.set(0.0, 2.0, 0.0);
        // ロケットの進行方向の初期値を設定しておく（初期の三角錐の向きと同じ真上に向かうベクトルを設定）
        rocketVector = new THREE.Vector3(0.0, 1.0, 0.0);
        earthAndMoon.add(rocket);

        // 月の軌道を作成
        const moonPoints = creatOrbitPoints(
            MOON_ORBIT.vector1,
            MOON_ORBIT.vector2,
            100
        );
        const moonOrbitGeometry = new THREE.BufferGeometry();
        moonOrbitGeometry.setFromPoints(moonPoints);
        const moonOrbitPoints = new THREE.Points(moonOrbitGeometry, new THREE.PointsMaterial(MATERIAL_PARAM_POINT));
        earthAndMoon.add(moonOrbitPoints);
        earthAndMoon.position.set(EARTH_RANGE, 0.0, 0.0);
        scene.add(earthAndMoon);
        earthAndMoon.position

        // 地球の軌道を作成
        const earthPoints = creatOrbitPoints(
            EARTH_ORBIT.vector1,
            EARTH_ORBIT.vector2,
            200
        );
        const earthOrbitGeometry = new THREE.BufferGeometry();
        earthOrbitGeometry.setFromPoints(earthPoints);
        const earthOrbitPoints = new THREE.Points(earthOrbitGeometry, new THREE.PointsMaterial(MATERIAL_PARAM_POINT));
        scene.add(earthOrbitPoints);

        // ディレクショナルライト
        directionalLight = new THREE.DirectionalLight(
            DIRECTIONAL_LIGHT_PARAM.color,
            DIRECTIONAL_LIGHT_PARAM.intensity
        );
        directionalLight.position.x = DIRECTIONAL_LIGHT_PARAM.x;
        directionalLight.position.y = DIRECTIONAL_LIGHT_PARAM.y;
        directionalLight.position.z = DIRECTIONAL_LIGHT_PARAM.z;
        scene.add(directionalLight);

        // アンビエントライト
        ambientLight = new THREE.AmbientLight(
            AMBIENT_LIGHT_PARAM.color,
            AMBIENT_LIGHT_PARAM.intensity
        );
        scene.add(ambientLight);

        // const axes = new THREE.AxesHelper(30);
        // scene.add(axes);
    
        // レンダリング開始の瞬間のタイムスタンプを変数に保持しておく @@@
        startTime = Date.now();

        render();
    }

    function render() {
        if(run === true){requestAnimationFrame(render);}
        
        const nowTime = (Date.now() - startTime) / 1000;
        // 月の軌道上を動かす
        const moonVector3 = getOrbit(MOON_ORBIT.vector1, MOON_ORBIT.vector2, nowTime);
        moon.position.set(moonVector3.x, moonVector3.y, moonVector3.z);

        // 地球の軌道上を動かす
        const earthVector3 = getOrbit(EARTH_ORBIT.vector1, EARTH_ORBIT.vector2, nowTime/4);
        earthAndMoon.position.set(earthVector3.x, earthVector3.y, earthVector3.z);

        // 弾の位置を更新
        if (isShotted) {
            bullet.position.add(bulletVector);
        }

        // 地球と太陽の位置関係からベクトルを作り、単位化する
        const vectorOfRocketToSun = sun.position.clone().sub(earthAndMoon.position);
        vectorOfRocketToSun.normalize();
        // 回転前後の2のベクトルから外積で接線ベクトルを求める
        const tangent = new THREE.Vector3().crossVectors(rocketVector, vectorOfRocketToSun).normalize();
        // 回転前後の2のベクトルから内積でコサインを取り出す
        const cos = rocketVector.dot(vectorOfRocketToSun);
        // コサインをラジアンに戻す
        const radians = Math.acos(cos);
        // 求めた接線ベクトルとラジアンからクォータニオンを定義
        const qtn = new THREE.Quaternion();
        qtn.setFromAxisAngle(new THREE.Vector3(tangent.x, tangent.y, tangent.z), radians);
        // ロケットの現在のクォータニオンに乗算する（実際の回転処理を行うのはここ）
        rocket.quaternion.premultiply(qtn);
        // ロケットの進行方向の値を更新する（次のフレームで計算に使用するため更新）
        rocketVector = vectorOfRocketToSun;

        // 太陽のアニメーション
        sunTexture.offset.x += 0.001;
        sunTexture.offset.y += 0.001;

        // 地球自転
        earth.rotation.y += 0.005;

        renderer.render(scene, camera);
    };

    /**
     * 2つのベクトルから軌道を取得（内部でクオータニオンを使用）
     */
    const getOrbit = (
        vector1: THREE.Vector3,
        vector2: THREE.Vector3,
        radian: number,
    ) => {
        const baseVector = vector1.clone();
        const axis = getTangentVector(vector1, vector2);
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(axis, radian);
        return baseVector.applyQuaternion(quaternion);
    }

    /**
     * 接線ベクトルを取得します
     */
    const getTangentVector = (
        vector1: THREE.Vector3,
        vector2: THREE.Vector3,
    ) => {
        return vector1.clone().cross(vector2).normalize();
    }

    /**
     * 円の軌道の座標を配列で返します
     */
    const creatOrbitPoints = (
        startPos: THREE.Vector3,
        endPos: THREE.Vector3,
        segmentNum: number
    ):THREE.Vector3[]  => {
        // 頂点を格納する配列
        const vertices = [];
        const startVec = startPos.clone();
        const endVec = endPos.clone();

        // 2つのベクトルの回転軸
        const axis = getTangentVector(startVec, endVec);
        // 360度のラジアン
        const radian = 2 * Math.PI;

        // 2つの点を結ぶ弧を描くための頂点を打つ
        for (let i = 0; i < segmentNum; i++) {
            // axisを軸としたクォータニオンを生成
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(axis, radian / segmentNum * i);
            const vector3 = startVec.clone().applyQuaternion(quaternion);
            vertices.push(vector3);
        }
        return vertices;
    };

    /**
     * Promiseを返すテクスチャloader
     */
    async function asyncLoader(path: string): Promise<THREE.Texture> {
        const loader = new THREE.TextureLoader();
        return new Promise((resolve, reject) => {
            loader.load(path, (texture) => {resolve(texture)});
        });
    }
})();