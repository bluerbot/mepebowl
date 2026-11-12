import * as THREE from 'three';

export class SceneHost {
  constructor({ stage, config = {} } = {}) {
    if (!stage?.getBoundingClientRect) {
      throw new TypeError('SceneHost requires a stage element');
    }

    this.stage = stage;
    this.scene = new THREE.Scene();

    this.scene.background = new THREE.Color(
      config.background ?? 0x10131a
    );


this.scene.add(
  new THREE.HemisphereLight(0xffffff, 0x39404d, 2)
);

/*
const keyLight = new THREE.DirectionalLight(0xffffff, 3);
keyLight.position.set(5, -5, 8);
this.scene.add(keyLight);
*/

//| Trying lighting setup from mepebowl world
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
this.scene.add(ambient);
const point = new THREE.PointLight(0xffffff, 0.6, 10);
point.position.set(2, -2, 3);
this.scene.add(point);
const directional = new THREE.DirectionalLight(0xffffff, 0.8);
directional.position.set(-2, 0, 3);
this.scene.add(directional);
const spot = new THREE.SpotLight(0xffffff, 4);
spot.position.set(2, -2, 3);
spot.target.position.set(0, 0, 0);
spot.angle = Math.PI / 6;
spot.penumbra = 0.5;
spot.castShadow = true;
this.scene.add(spot, spot.target);





    const cameraConfig = config.camera ?? {};

    this.camera = new THREE.PerspectiveCamera(
      cameraConfig.fov ?? 35,
      1,
      cameraConfig.near ?? 0.1,
      cameraConfig.far ?? 100
    );

    // Grunt Emissions world convention: Z-up.
    this.camera.up.set(0, 0, 1);

    this.camera.position.set(
      ...(cameraConfig.position ?? [6, -8, 5])
    );

    this.camera.lookAt(
      ...(cameraConfig.target ?? [0, 0, 0])
    );

    const rendererConfig = config.renderer ?? {};

    this.maxPixelRatio = rendererConfig.maxPixelRatio ?? 2;

    this.renderer = new THREE.WebGLRenderer({
      antialias: rendererConfig.antialias ?? true,
      alpha: rendererConfig.alpha ?? false
    });

    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';

    this.resizeObserver = null;
    this.frameId = null;
    this.mounted = false;
    this.disposed = false;

    this.renderFrame = this.renderFrame.bind(this);
  }

  mount() {
    if (this.disposed) {
      throw new Error('SceneHost has been disposed');
    }

    if (this.mounted) return this;

    this.stage.appendChild(this.renderer.domElement);

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });

    this.resizeObserver.observe(this.stage);

    this.mounted = true;
    this.resize();

    return this;
  }

  resize() {
    if (this.disposed) return this;

    const { width, height } =
      this.stage.getBoundingClientRect();

    if (width <= 0 || height <= 0) return this;

    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, this.maxPixelRatio)
    );

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);

    return this;
  }

  start() {
    if (this.disposed) {
      throw new Error('SceneHost has been disposed');
    }

    if (!this.mounted) {
      throw new Error('SceneHost must be mounted before starting');
    }

    if (this.frameId !== null) return this;

    this.frameId = requestAnimationFrame(this.renderFrame);

    return this;
  }

  renderFrame() {
    this.frameId = null;

    if (this.disposed) return;

    this.renderer.render(this.scene, this.camera);

    this.frameId = requestAnimationFrame(this.renderFrame);
  }

  stop() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    return this;
  }

  dispose() {
    if (this.disposed) return;

    this.stop();

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.renderer.domElement.remove();

    this.renderer.dispose();

    this.scene.clear();

    this.mounted = false;
    this.disposed = true;
  }
}
