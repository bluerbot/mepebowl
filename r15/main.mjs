
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

function loadMepe() {
  const loader = new GLTFLoader();

  loader.load(
    '/game/models/mepe-bowling.glb',
    (gltf) => {
      const mepe = gltf.scene;

      const bounds = new THREE.Box3().setFromObject(mepe);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();

      bounds.getCenter(center);
      bounds.getSize(size);

      const scale = 0.9 / Math.max(size.x, size.y, size.z);

      mepe.scale.setScalar(scale);
      mepe.position.sub(center.multiplyScalar(scale));

      mepe.rotation.z = Math.PI / 3.5;
      mepe.rotation.y = Math.PI / 3.5;
      mepe.rotation.x = Math.PI / 2.8;
      //mepe.rotation.x = Math.PI / 2.5 + Math.PI / 2;;

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

sceneHost.mount().start();
loadMepe();

window.addEventListener('pagehide', () => {
  sceneHost.dispose();
}, { once: true });
