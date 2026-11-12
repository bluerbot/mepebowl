
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
  const limit = 0.8;

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

    mepe.position.x = THREE.MathUtils.clamp(
      startMepeX + deltaX,
      -limit,
      limit
    );
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
  sceneHost.dispose();
}, { once: true });
