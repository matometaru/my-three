(() => {
    window.addEventListener('DOMContentLoaded', () => {
        init();
        render();
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }, false);
    }, false);

    let scene;
    let camera;
    let renderer;
    let controls;
    let axesHelper;

    let material,
        caseMaterial,
        wingGeometry,
        propGeometry,
        baseGeometry,
        motorGeometry,
        caseGeometry,
        joinGeometry,
        ambientLight,
        wrapper,
        bodyGroup,
        wingGroup,
        time = 0;

    const CAMERA_PARAM = {
        fovy: 60,
        aspect: window.innerWidth / window.innerHeight,
        near: 0.1,
        far: 10000.0,
        x: 0.0,
        y: 0.0,
        z: 45.0,
        lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };

    const RENDERER_PARAM = {
        clearColor: 0x000000,
        width: window.innerWidth,
        height: window.innerHeight,
    };

    const DIRECTIONAL_LIGHT_PARAM = {
        color: 0xffffff, // å…‰ã®è‰²
        intensity: 1.0,  // å…‰ã®å¼·åº¦
        x: 10.0,          // å…‰ã®å‘ãã‚’è¡¨ã™ãƒ™ã‚¯ãƒˆãƒ«ã® X è¦ç´ 
        y: 20.0,          // å…‰ã®å‘ãã‚’è¡¨ã™ãƒ™ã‚¯ãƒˆãƒ«ã® Y è¦ç´ 
        z: 100.0           // å…‰ã®å‘ãã‚’è¡¨ã™ãƒ™ã‚¯ãƒˆãƒ«ã® Z è¦ç´ 
    };

    const AMBIENT_LIGHT_PARAM = {
        color: 0xffffff,
        intensity: 0.2,
    };

    const MATERIAL_PARAM = {
        color: 0xffffff
    }

    const CASE_MATERIAL_PARAM = {
        color: 0xffffff,
        wireframe: true
    }

    function init(){
        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAM.clearColor));
        renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height);
        wrapper = document.querySelector('#webgl');
        wrapper.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAM.fovy,
            CAMERA_PARAM.aspect,
            CAMERA_PARAM.near,
            CAMERA_PARAM.far
        );
        camera.position.set(CAMERA_PARAM.x, CAMERA_PARAM.y, CAMERA_PARAM.z);
        camera.lookAt(CAMERA_PARAM.lookAt);

        wingGroup = new THREE.Group();
        bodyGroup = new THREE.Group();
        scene.add(wingGroup);
        scene.add(bodyGroup);

        const PROP_HEIGHT = 20

        material = new THREE.MeshPhongMaterial(MATERIAL_PARAM);
        caseMaterial = new THREE.MeshPhongMaterial(CASE_MATERIAL_PARAM);

        propGeometry = new THREE.CylinderGeometry(0.5, 0.5, PROP_HEIGHT, 64);
        baseGeometry = new THREE.CylinderGeometry(5, 5, 0.5, 64);
        motorGeometry = new THREE.CylinderGeometry(2, 2, 4, 64);
        caseGeometry = new THREE.CylinderGeometry(10, 10, 4, 64);
        joinGeometry = new THREE.CylinderGeometry(1, 1, 4, 64);
        const bodyMesh = new THREE.Mesh(propGeometry, material);
        const baseMesh = new THREE.Mesh(baseGeometry, material);
        const motorMesh = new THREE.Mesh(motorGeometry, material);
        const joinMesh = new THREE.Mesh(joinGeometry, material);
        const caseMesh = new THREE.Mesh(caseGeometry, caseMaterial);
        bodyMesh.position.set(0, -PROP_HEIGHT / 2, 0)
        baseMesh.position.set(0, -PROP_HEIGHT, 0)
        motorMesh.rotation.x = caseMesh.rotation.x = joinMesh.rotation.x = Math.PI / 2
        motorMesh.position.set(0, 0, 0)
        joinMesh.position.set(0, 0, 4)
        caseMesh.position.set(0, 0, 4)
        scene.add(bodyMesh)
        scene.add(baseMesh)
        wingGroup.add(joinMesh)
        bodyGroup.add(motorMesh)
        bodyGroup.add(caseMesh)
        wingGeometry = new THREE.BoxGeometry(1.5, 8, 0.5);
        const wingMesh1 = new THREE.Mesh(wingGeometry, material);
        const wingMesh2 = new THREE.Mesh(wingGeometry, material);
        const wingMesh3 = new THREE.Mesh(wingGeometry, material);
        const wingMesh4 = new THREE.Mesh(wingGeometry, material);
        wingMesh1.rotation.y = wingMesh2.rotation.y = wingMesh3.rotation.x = wingMesh4.rotation.x = 0.5
        wingMesh1.position.z = wingMesh2.position.z = wingMesh3.position.z = wingMesh4.position.z = 4
        wingMesh3.rotation.z = wingMesh4.rotation.z = Math.PI / 2
        wingMesh1.position.y = 5;
        wingMesh2.position.y = -5;
        wingMesh4.position.x = 5;
        wingMesh3.position.x = 5;
        wingGroup.add(wingMesh1);
        wingGroup.add(wingMesh2);
        wingGroup.add(wingMesh3);
        wingGroup.add(wingMesh4);

        directionalLight = new THREE.DirectionalLight(
            DIRECTIONAL_LIGHT_PARAM.color,
            DIRECTIONAL_LIGHT_PARAM.intensity
        );
        directionalLight.position.x = DIRECTIONAL_LIGHT_PARAM.x;
        directionalLight.position.y = DIRECTIONAL_LIGHT_PARAM.y;
        directionalLight.position.z = DIRECTIONAL_LIGHT_PARAM.z;
        scene.add(directionalLight);

        ambientLight = new THREE.AmbientLight(
            AMBIENT_LIGHT_PARAM.color,
            AMBIENT_LIGHT_PARAM.intensity
        );
        scene.add(ambientLight);

        // è»¸ãƒ˜ãƒ«ãƒ‘ãƒ¼
        axesHelper = new THREE.AxesHelper(5.0);
        scene.add(axesHelper);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
    }

    function render(){
        time += 4
        requestAnimationFrame(render)
        wingGroup.rotation.z = -time
        wingGroup.rotation.y = Math.sin(-time / 400) * 1.5
        bodyGroup.rotation.y = Math.sin(-time / 400) * 1.5
        controls.update();
        renderer.render(scene, camera);
    }
})();

