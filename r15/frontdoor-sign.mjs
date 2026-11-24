
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const stage = document.querySelector('#lane22-sign');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 100);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x777777, 2));

const key = new THREE.DirectionalLight(0xffffff, 3);
key.position.set(2, 3, 5);
scene.add(key);

function resize() {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  if (!width || !height) return;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

new GLTFLoader().load(
  './assets/lane22sign.glb',
  ({ scene: sign }) => {
    const bounds = new THREE.Box3().setFromObject(sign);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());

    sign.position.sub(center);

    // Present the broad face of the rectangular object.
    const depthAxis = size.x < size.y && size.x < size.z
      ? 'x'
      : size.y < size.z ? 'y' : 'z';

    if (depthAxis === 'x') sign.rotation.y = Math.PI / 2;
    if (depthAxis === 'y') sign.rotation.x = Math.PI / 2;

    scene.add(sign);

    // A geometry-based camera fit; visual tuning comes next.
    // // const diagonal = size.length();
    // // const distance = Math.max(1, diagonal * 2.2);
    // const distance = Math.max(0.1, diagonal * 0.65);
    // camera.position.set(0, 0, distance);
    // camera.lookAt(0, 0, 0);
    // Fit the sign to the available canvas dimensions.
    const visibleWidth = depthAxis === 'x' ? size.z : size.x;
    const visibleHeight = depthAxis === 'y' ? size.z : size.y;
    const verticalFov = THREE.MathUtils.degToRad(camera.fov);
    const horizontalFov = 2 * Math.atan(
      Math.tan(verticalFov / 2) * (stage.clientWidth / stage.clientHeight)
    );
    const distance = Math.max(
      visibleHeight / (2 * Math.tan(verticalFov / 2)),
      visibleWidth / (2 * Math.tan(horizontalFov / 2))
    ) * 1.15;
    camera.position.set(0, 0, distance);
    camera.lookAt(0, 0, 0);


    resize();
  },
  undefined,
  error => console.error('Lane 22 sign load failed:', error)
);

window.addEventListener('resize', resize);
resize();
