import { SceneHost } from './SceneHost.mjs';

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
