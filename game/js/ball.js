let ballRadius = 0.55;
let ep = 0.005;

let mepeModel = null;

let sharedBowlingBallGeometry = null;

let thumbPos, thumbRot;
let finger1Pos, finger1Rot;
let finger2Pos, finger2Rot;

function getBowlingBallGeometry() {
    if (sharedBowlingBallGeometry) return sharedBowlingBallGeometry;

    let sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(ballRadius, 32, 32));
    let sphereBSP = new ThreeBSP(sphereMesh);

    let thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.4, 16));
    thumb.position.set(0, -0.15, ballRadius - 0.1);
    thumb.rotation.x = Math.PI / 2 + Math.asin(0.15 / ballRadius);

    thumbPos = thumb.position.clone();
    thumbRot = thumb.rotation.clone();

    let finger1 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.4, 16));
    finger1.position.set(-0.12, 0.15, ballRadius - 0.1);
    finger1.rotation.x = Math.PI / 2 - Math.asin(0.15 / ballRadius);
    finger1.rotation.y = Math.asin(-0.12 / ballRadius);

    finger1Pos = finger1.position.clone();
    finger1Rot = finger1.rotation.clone();

    let finger2 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.4, 16));
    finger2.position.set(0.12, 0.15, ballRadius - 0.1);
    finger2.rotation.x = Math.PI / 2 - Math.asin(0.15 / ballRadius);
    finger2.rotation.y = Math.asin(0.12 / ballRadius);

    finger2Pos = finger2.position.clone();
    finger2Rot = finger2.rotation.clone();

    let resultBSP = sphereBSP
        .subtract(new ThreeBSP(thumb))
        .subtract(new ThreeBSP(finger1))
        .subtract(new ThreeBSP(finger2));

    let finalMesh = resultBSP.toMesh();
    finalMesh.geometry.computeVertexNormals();

    sharedBowlingBallGeometry = finalMesh.geometry;
    return sharedBowlingBallGeometry;
}


function loadMepeModel(onLoad) {
    let loader = new THREE.GLTFLoader();

    loader.load(
        "../models/mepe-bowling.glb",
        function(gltf) {
            mepeModel = gltf.scene;

            // Center the model around the physics sphere.
            let box = new THREE.Box3().setFromObject(mepeModel);
            let center = new THREE.Vector3();
            let size = new THREE.Vector3();

            box.getCenter(center);
            box.getSize(size);

            let maxDim = Math.max(size.x, size.y, size.z);
            let scale = 0.9 / maxDim;

            mepeModel.scale.setScalar(scale);
            mepeModel.position.sub(center.multiplyScalar(scale));
            mepeModel.rotation.z = Math.PI / 2.5;
            mepeModel.rotation.y = Math.PI / 2.5;

            onLoad();
        },
        undefined,
        function(error) {
            console.error("Mepe GLB failed to load:", error);
        }
    );
}


function createBall(x0, y0, ballColor, decorColor, z0 = ballRadius) {
    let physMaterial = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({ visible: false }),
        0.6,
        0.5
    );

    let sphereG = new THREE.SphereGeometry(ballRadius, 32, 32);
    let ball = new Physijs.SphereMesh(sphereG, physMaterial, 7.0);

    let visualMesh = mepeModel.clone(true);

    visualMesh.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });

    ball.add(visualMesh);
    ball.position.set(x0, y0, z0);
    return ball;
}


let team1Color = 0x00e5ff;
let team2Color = 0xff0022;

let cyanBall = null;
let redBall = null;

function initBalls(players, startConfig) {
    if (players === 1) {
        const start = startConfig?.stance?.position
            ?? { x: 45, y: 0, z: ballRadius };

        cyanBall = createBall(
            start.x,
            start.y,
            team1Color,
            0xffffff,
            start.z
        );
    } else {
        cyanBall = createBall(45, -6, team1Color, 0xffffff);
        redBall = createBall(45, 6, team2Color, 0xffffff);
    }
}
