import { SceneHost } from './SceneHost.mjs';
import { selectStartMarker } from '../session/StartConfig.mjs';


export class LaneSceneHost extends SceneHost {
  constructor(lane) {
    if (!lane?.stage || !lane.scene || !lane.camera ||
        !lane.renderer || typeof lane.stopFrameLoop !== 'function') {
      throw new TypeError('LaneSceneHost requires initialized lane resources');
    }

    super({
      stage: lane.stage,
      resources: {
        scene: lane.scene,
        camera: lane.camera,
        renderer: lane.renderer
      }
    });

    this.ball = lane.ball;
    this.startConfig = lane.startConfig;
    this.stopFrameLoop = lane.stopFrameLoop;
    this.running = true;

    // Legacy initGame already mounted the canvas and started the loop.
    this.mounted = true;
  }

  selectMarker(markerName) {
    if (this.disposed || !this.running) {
      return false;
    }

    if (!this.startConfig?.selection?.credentialed) {
      return false;
    }

    // Legacy throw/settlement lifecycle owns this state.
    if (typeof isBallRolling !== 'undefined' &&
        isBallRolling[1]) {
      return false;
    }

    if (!this.ball) {
      return false;
    }

    const next = selectStartMarker(this.startConfig, markerName);
    const position = next.stance.position;

    this.ball.setLinearVelocity(new THREE.Vector3(0, 0, 0));
    this.ball.setAngularVelocity(new THREE.Vector3(0, 0, 0));

    this.ball.position.set(position.x, position.y, position.z);
    this.ball.rotation.set(0, 0, 0);

    this.ball.__dirtyPosition = true;
    this.ball.__dirtyRotation = true;

    this.startConfig = next;

    return true;
  }

  start() {
    if (this.disposed) {
      throw new Error('LaneSceneHost has been disposed');
    }

    // The adopted lane actuator is already running.
    // Never start SceneHost's render-only loop.
    return this;
  }

  stop() {
    this.stopFrameLoop();
    this.running = false;
    return super.stop();
  }

  dispose() {
    if (this.disposed) return;

    this.stop();
    super.dispose();
  }
}
