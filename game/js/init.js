Physijs.scripts.worker = '../../libs/other/physijs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

let camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);
let scene = new Physijs.Scene({ fixedTimeStep: 1 / 60 });
scene.setGravity(new THREE.Vector3( 0, 0, -50.0 ));
let initialPinLayouts = [];

function buildLane(yOffset, floorMat, bumperMat) {
    let lane = new Physijs.BoxMesh(new THREE.BoxGeometry(60, 6.0, 2.0), floorMat, 0);
    lane.position.set(24, yOffset, -0.9);
    lane.receiveShadow = true;
    scene.add(lane);

    let bumperLeft = new Physijs.BoxMesh(new THREE.BoxGeometry(60, 0.5, 0.5), bumperMat, 0);
    bumperLeft.position.set(24, yOffset - 3.25, 0.35);
    scene.add(bumperLeft);

    let bumperRight = new Physijs.BoxMesh(new THREE.BoxGeometry(60, 0.5, 0.5), bumperMat, 0);
    bumperRight.position.set(24, yOffset + 3.25, 0.35);
    scene.add(bumperRight);

    let neonMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    let stripLeft = new THREE.Mesh(new THREE.BoxGeometry(60, 0.1, 0.1), neonMat);
    stripLeft.position.set(24, yOffset - 2.9, 0.15);
    scene.add(stripLeft);

    let stripRight = new THREE.Mesh(new THREE.BoxGeometry(60, 0.1, 0.1), neonMat);
    stripRight.position.set(24, yOffset + 2.9, 0.15);
    scene.add(stripRight);
}

function initGame(players, rounds) {
    setupScoreboard(players, rounds);
    initBalls(players);

    let stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    scene.background = new THREE.Color(0x0a001a);
    scene.fog = new THREE.FogExp2(0x0a001a, 0.015);

    let grid = new THREE.GridHelper(400, 100, 0xff00ff, 0xff00ff);
    grid.rotation.x = Math.PI / 2;
    grid.position.set(25, 0, -0.1);
    grid.material.opacity = 0.25;
    grid.material.transparent = true;
    scene.add(grid);

    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);

    setupCamera(scene, camera);
    setupLighting(scene, players);

    scene.add(cyanBall);
    if (players === 2) {
        scene.add(redBall);
    }

    let wallMat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x2a3b4c, roughness: 0.7 }), 0.8, 0.4);
    let floorMat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.3, metalness: 0.1 }), 0.8, 0.4);
    let bumperMat = Physijs.createMaterial(new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 }), 0.8, 0.4);

    let platform = new Physijs.BoxMesh(new THREE.BoxGeometry(200, 200, 20), wallMat, 0);
    platform.position.set(25, 0, -10.2);
    platform.receiveShadow = true;
    scene.add(platform);

    if (players === 1) {
        placePins(0, 0, 1.0, 1.15, 1);
        buildLane(0, floorMat, bumperMat);
    } else {
        placePins(0, -6, 1.0, 1.15, 1);
        placePins(0, 6, 1.0, 1.15, 2);
        buildLane(-6, floorMat, bumperMat);
        buildLane(6, floorMat, bumperMat);
    }

    setupStandingPins();

    let gui = new dat.GUI();
    let menu = {
        xPos: targetCamPos.x, yPos: targetCamPos.y, zPos: targetCamPos.z,
        zoom: camera.zoom,
        xDir: targetCamLook.x, yDir: targetCamLook.y, zDir: targetCamLook.z
    };

    let camFolder = gui.addFolder("Camera");
    const camProps = ['xPos', 'yPos', 'zPos', 'zoom', 'xDir', 'yDir', 'zDir'];
    camProps.forEach(prop => {
        let min = prop === 'zoom' ? 0 : -50;
        let max = prop === 'zoom' ? 40 : 50;
        camFolder.add(menu, prop, min, max).onChange(() => {
            if (prop === 'zoom') {
                camera.zoom = menu.zoom;
                camera.updateProjectionMatrix();
            } else if (prop.endsWith('Pos')) {
                targetCamPos[prop[0]] = menu[prop];
            } else {
                targetCamLook[prop[0]] = menu[prop];
            }
        });
    });

    document.getElementById("webgl").appendChild(renderer.domElement);

    function renderAnim() {
        stats.update();
        scene.simulate();
        renderer.render(scene, camera);
        requestAnimationFrame(renderAnim);
    }
    renderAnim();
}
