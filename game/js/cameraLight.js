let targetCamPos = new THREE.Vector3(70, 0, 7);
let targetCamLook = new THREE.Vector3(0, 0, 0);
let currentCamLook = new THREE.Vector3(0, 0, 0);

function setupCamera(scene, camera) {
    camera.up = new THREE.Vector3(0, 0, 1);
    camera.position.set(targetCamPos.x, targetCamPos.y, targetCamPos.z);
    camera.lookAt(targetCamLook.x, targetCamLook.y, targetCamLook.z);
    camera.updateProjectionMatrix();
}

function updateCameraTransition() {
    camera.position.lerp(targetCamPos, 0.05);
    currentCamLook.lerp(targetCamLook, 0.05);
    camera.lookAt(currentCamLook);
}

function createSpotlight(x, y, z, targetY, scene) {
    let spot = new THREE.SpotLight(0xffffff, 4.0);
    spot.position.set(x, y, z);
    spot.target.position.set(0, targetY, 0);
    spot.angle = Math.PI / 6;
    spot.penumbra = 0.5;
    spot.castShadow = true;
    scene.add(spot);
    scene.add(spot.target);
    return spot;
}

function setupLighting(scene, players) {
    let ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    let centralLight = new THREE.PointLight(0xffffff, 0.6, 200);
    centralLight.position.set(20, 0, 30);
    centralLight.castShadow = true;
    centralLight.shadow.mapSize.width = 2048;
    centralLight.shadow.mapSize.height = 2048;
    scene.add(centralLight);

    let dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(-10, 0, 20);
    scene.add(dirLight);

    if (players === 1) {
        createSpotlight(10, 0, 15, 0, scene);
    } else {
        createSpotlight(10, -6, 15, -6, scene);
        createSpotlight(10, 6, 15, 6, scene);
    }
}
