
import { SceneHost } from './scene/SceneHost.mjs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const stage = document.querySelector('#encounter');

const sceneHost = new SceneHost({
  stage,
  config: {
    renderer: { alpha: true },
    camera: {
      position: [0, -2.8, 1.1],
      target: [0, 0, 0.55]
    }
  }
});

sceneHost.scene.background = null;

let mepe = null;
let leftMarker = null;
let rightMarker = null;
let settleTimer = null;
let centerDeadZone = 0;


function createMarkers(modelSize, modelScale) {
  // Marker diameter is half the ball's approximate diameter.
  const ballDiameter =
    Math.max(modelSize.x, modelSize.y, modelSize.z) * modelScale;
  // Marker diameter reduced by 20%.
  const markerRadius = ballDiameter * 0.2;
  // Half a marker diameter is the center dead zone.
  centerDeadZone = markerRadius;
  const markerGeometry = new THREE.CircleGeometry(
    markerRadius,
    32
  );
  const markerMaterial = new THREE.MeshBasicMaterial({
    color: 0xd6b15e,
    side: THREE.DoubleSide,
    depthTest: true,
    depthWrite: true
  });

  function makeMarker(x) {
    const marker = new THREE.Mesh(
      markerGeometry,
      markerMaterial
    );

    marker.position.set(
      x,
      mepe.position.y + markerRadius,
      mepe.position.z - 3*markerRadius
    );

    sceneHost.scene.add(marker);

    return marker;
  }

  // Fixed center marker.
  makeMarker(0);

  // Configurable left and right markers.
  leftMarker = makeMarker(0);
  rightMarker = makeMarker(0);

  leftMarker.visible = false;
  rightMarker.visible = false;
}

function scheduleMarkerPlacement() {
  if (settleTimer !== null) {
    clearTimeout(settleTimer);
  }

  settleTimer = setTimeout(() => {
    settleTimer = null;

    if (!mepe || !leftMarker || !rightMarker) return;

    const x = mepe.position.x;

    // Center is reserved for the permanent center marker.
    if (Math.abs(x) <= centerDeadZone) return;

    // Update only the marker belonging to Mepe's side.
    const marker = x < 0 ? leftMarker : rightMarker;

    marker.position.x = x;
    marker.visible = true;

  }, 300);
}

function loadMepe() {
  const loader = new GLTFLoader();

  loader.load(
    '/game/models/mepe-bowling.glb',
    (gltf) => {
      mepe = gltf.scene;

      const bounds = new THREE.Box3().setFromObject(mepe);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();

      bounds.getCenter(center);
      bounds.getSize(size);

      const scale = 0.9 / Math.max(size.x, size.y, size.z);

      mepe.scale.setScalar(scale);
      mepe.position.sub(center.multiplyScalar(scale));

      // Current experimental orientation — preserve.
      mepe.rotation.z = Math.PI / 3.5;
      mepe.rotation.y = Math.PI / 3.5;
      mepe.rotation.x = Math.PI / 2.8;

      mepe.position.z = 0.55;

      mepe.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      sceneHost.scene.add(mepe);

      // Markers share Mepe's encounter plane.
      createMarkers(size, scale);
    },
    undefined,
    (error) => {
      console.error('Mepe model failed to load:', error);
    }
  );
}

function pointerToLaneX(event) {
  const rect = stage.getBoundingClientRect();

  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, sceneHost.camera);

  const lanePlane = new THREE.Plane(
    new THREE.Vector3(0, 0, 1),
    -0.55
  );

  const intersection = new THREE.Vector3();

  if (!raycaster.ray.intersectPlane(lanePlane, intersection)) {
    return null;
  }

  return intersection.x;
}

function installLateralDrag() {
  const limit = 1.2;

  let activePointer = null;
  let startPointerX = 0;
  let startMepeX = 0;

  stage.style.touchAction = 'none';
  stage.style.cursor = 'ew-resize';

  function onPointerDown(event) {
    if (!mepe || activePointer !== null) return;
    if (event.button !== 0) return;

    const laneX = pointerToLaneX(event);
    if (laneX === null) return;

    event.preventDefault();

    activePointer = event.pointerId;
    startPointerX = laneX;
    startMepeX = mepe.position.x;

    stage.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    if (event.pointerId !== activePointer || !mepe) return;

    event.preventDefault();

    const laneX = pointerToLaneX(event);
    if (laneX === null) return;

    const deltaX = laneX - startPointerX;

    const nextX = THREE.MathUtils.clamp(
      startMepeX + deltaX,
      -limit,
      limit
    );

    // Only meaningful movement resets the settling timer.
    if (Math.abs(nextX - mepe.position.x) < 0.001) return;

    mepe.position.x = nextX;

    scheduleMarkerPlacement();
  }

  function onPointerEnd(event) {
    if (event.pointerId !== activePointer) return;

    activePointer = null;

    if (stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
  }

  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerup', onPointerEnd);
  stage.addEventListener('pointercancel', onPointerEnd);
}

sceneHost.mount().start();

loadMepe();
installLateralDrag();

window.addEventListener('pagehide', () => {
  if (settleTimer !== null) {
    clearTimeout(settleTimer);
  }

  sceneHost.dispose();
}, { once: true });
