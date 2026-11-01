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


// function createBall(x0, y0, ballColor, decorColor) {
//
//
//     let visualGeom = getBowlingBallGeometry();
//
//
//     let physMaterial = Physijs.createMaterial(
//         new THREE.MeshBasicMaterial({ visible: false }),
//         0.6,
//         0.5
//     );
//
//     let sphereG = new THREE.SphereGeometry(ballRadius, 32, 32);
//     let ball = new Physijs.SphereMesh(sphereG, physMaterial, 7.0);
//
//     let visualMat = new THREE.MeshPhysicalMaterial({
//         color: ballColor,
//         roughness: 0.3,
//         metalness: 0.1,
//         clearcoat: 1.0,
//         clearcoatRoughness: 0.05
//     });
//
//     let visualMesh = new THREE.Mesh(visualGeom, visualMat);
//     visualMesh.castShadow = true;
//     visualMesh.receiveShadow = true;
//
//     let darkMat = new THREE.MeshStandardMaterial({
//         color: 0x010101,
//         roughness: 0.9,
//         metalness: 0.1,
//         side: THREE.BackSide
//     });
//
//     let innerThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.058, 0.24, 16), darkMat);
//     innerThumb.position.copy(thumbPos);
//     innerThumb.rotation.copy(thumbRot);
//     innerThumb.translateY(-0.08);
//     visualMesh.add(innerThumb);
//
//     let innerFinger1 = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.038, 0.24, 16), darkMat);
//     innerFinger1.position.copy(finger1Pos);
//     innerFinger1.rotation.copy(finger1Rot);
//     innerFinger1.translateY(-0.08);
//     visualMesh.add(innerFinger1);
//
//     let innerFinger2 = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.038, 0.24, 16), darkMat);
//     innerFinger2.position.copy(finger2Pos);
//     innerFinger2.rotation.copy(finger2Rot);
//     innerFinger2.translateY(-0.08);
//     visualMesh.add(innerFinger2);
//
//     let rimThumb = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.008, 16, 32), visualMat);
//     rimThumb.position.copy(thumbPos);
//     rimThumb.rotation.copy(thumbRot);
//     rimThumb.rotateX(Math.PI / 2);
//     rimThumb.translateZ(0.08);
//     visualMesh.add(rimThumb);
//
//     let rimFinger1 = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 16, 32), visualMat);
//     rimFinger1.position.copy(finger1Pos);
//     rimFinger1.rotation.copy(finger1Rot);
//     rimFinger1.rotateX(Math.PI / 2);
//     rimFinger1.translateZ(0.065);
//     visualMesh.add(rimFinger1);
//
//     let rimFinger2 = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.008, 16, 32), visualMat);
//     rimFinger2.position.copy(finger2Pos);
//     rimFinger2.rotation.copy(finger2Rot);
//     rimFinger2.rotateX(Math.PI / 2);
//     rimFinger2.translateZ(0.065);
//     visualMesh.add(rimFinger2);
//
//     visualMesh.rotation.y = Math.PI / 2;
//
//     ball.add(visualMesh);
//     ball.position.set(x0, y0, ballRadius);
//
//     return ball;
// }
function createBall(x0, y0, ballColor, decorColor) {
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
    ball.position.set(x0, y0, ballRadius);

    return ball;
}


let team1Color = 0x00e5ff;
let team2Color = 0xff0022;

let cyanBall = null;
let redBall = null;

function initBalls(players) {
    if (players === 1) {
        cyanBall = createBall(45, 0, team1Color, 0xffffff);
    } else {
        cyanBall = createBall(45, -6, team1Color, 0xffffff);
        redBall = createBall(45, 6, team2Color, 0xffffff);
    }
}
