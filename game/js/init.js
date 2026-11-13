Physijs.scripts.worker = '../../libs/other/physijs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

//let camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 100);
let camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);

let scene = new Physijs.Scene({ fixedTimeStep: 1 / 60 });
scene.setGravity(new THREE.Vector3( 0, 0, -50.0 ));
let initialPinLayouts = [];

function buildLane(yOffset, floorMat, bumperMat, gutterWallMat) {
    let lane = new Physijs.BoxMesh(new THREE.BoxGeometry(60, 6.0, 2.0), floorMat, 0);
    lane.position.set(24, yOffset, -0.9);
    lane.receiveShadow = true;
    scene.add(lane);

    // Visual edge marker only; the open gutter remains rollable.
    let bumperLeft = new THREE.Mesh(new THREE.BoxGeometry(60, 0.5, 0.5), bumperMat);
    bumperLeft.position.set(24, yOffset - 3.25, 0.35);
    scene.add(bumperLeft);

    // Visual edge marker only; the open gutter remains rollable.
    let bumperRight = new THREE.Mesh(new THREE.BoxGeometry(60, 0.5, 0.5), bumperMat);
    bumperRight.position.set(24, yOffset + 3.25, 0.35);
    scene.add(bumperRight);

    let neonMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });

    let stripLeft = new THREE.Mesh(new THREE.BoxGeometry(60, 0.1, 0.1), neonMat);
    stripLeft.position.set(24, yOffset - 2.9, 0.15);
    scene.add(stripLeft);

    let stripRight = new THREE.Mesh(new THREE.BoxGeometry(60, 0.1, 0.1), neonMat);
    stripRight.position.set(24, yOffset + 2.9, 0.15);
    scene.add(stripRight);

    // Release 1: contain the open gutter at the charcoal strip's outer edge.
    const boardWidth = 6.0 / 39.0;
    const charcoalWidth = boardWidth * 5;


const gutterOuterEdge = 3.5 + charcoalWidth - (2 * boardWidth);

    const wallThickness = 1.0;
    const wallHeight = 2.0;
    const wallCenterY = gutterOuterEdge + wallThickness / 2;

    // Keep the open gutter level with the lane surface.
    const supportInnerEdge = 2.8;
    const supportWidth = gutterOuterEdge - supportInnerEdge;
    const supportCenterY = (gutterOuterEdge + supportInnerEdge) / 2;

    [-1, 1].forEach(side => {
        let gutterFloor = new Physijs.BoxMesh(
            new THREE.BoxGeometry(60, supportWidth, 0.2),
            gutterWallMat,
            0
        );

        gutterFloor.position.set(
            24,
            yOffset + side * supportCenterY,
            0
        );

        scene.add(gutterFloor);
    });

    let gutterWallLeft = new Physijs.BoxMesh(
        new THREE.BoxGeometry(62, wallThickness, wallHeight),
        gutterWallMat,
        0
    );
    gutterWallLeft.position.set(24, yOffset - wallCenterY, 0.7);
    scene.add(gutterWallLeft);

    let gutterWallRight = new Physijs.BoxMesh(
        new THREE.BoxGeometry(62, wallThickness, wallHeight),
        gutterWallMat,
        0
    );
    gutterWallRight.position.set(24, yOffset + wallCenterY, 0.7);
    scene.add(gutterWallRight);
}

function initGame(players, rounds, startConfig) {
    setupScoreboard(players, rounds);
    initBalls(players, startConfig);
    
    let stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

stats.domElement.style.display = "none";

let stage = document.getElementById("webgl");
let stageRect = stage.getBoundingClientRect();
camera.aspect = stageRect.width / stageRect.height;
camera.updateProjectionMatrix();

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setSize(stageRect.width, stageRect.height);

	scene.background = new THREE.Color(0x0a001a);
    scene.fog = new THREE.FogExp2(0x0a001a, 0.015);

    let grid = new THREE.GridHelper(400, 100, 0xff00ff, 0xff00ff);
    grid.rotation.x = Math.PI / 2;
    grid.position.set(25, 0, -0.1);
    grid.material.opacity = 0.25;
    grid.material.transparent = true;
    scene.add(grid);

/*
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
*/

window.addEventListener('resize', function() {
    let rect = stage.getBoundingClientRect();
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height);
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
    let gutterWallMat = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ visible: false }),
        0.6,
        0.0
    );

    let platform = new Physijs.BoxMesh(new THREE.BoxGeometry(200, 200, 20), wallMat, 0);
    platform.position.set(25, 0, -10.2);
    platform.receiveShadow = true;
    scene.add(platform);

    if (players === 1) {
        placePins(0, 0, 1.0, 1.15, 1);
        buildLane(0, floorMat, bumperMat, gutterWallMat);
    } else {
        placePins(0, -6, 1.0, 1.15, 1);
        placePins(0, 6, 1.0, 1.15, 2);
        buildLane(-6, floorMat, bumperMat, gutterWallMat);
        buildLane(6, floorMat, bumperMat, gutterWallMat);
    }

    setupStandingPins();

    let gui = new dat.GUI();

gui.domElement.style.display = "none";

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
