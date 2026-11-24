# Pro Bowling 3D

A full 3D bowling lane running in the browser — real rigid-body physics for the ball and all ten pins, a swipe gesture that becomes an actual 3D throw with spin, and a retro synthwave lane to bowl on. No game engine, no build step: just THREE.js, a physics engine bolted on top, and vanilla JavaScript.

<p align=center>
  <img width="1280" height="613" alt="bowling-game" src="https://github.com/user-attachments/assets/ab19202f-617b-4b3c-8169-60572141d1df" />
</p>

The part that made this more than "spin a sphere down a lane": turning a 2D finger swipe into a physically correct 3D throw, and getting Bullet-physics-grade collisions to run smoothly in a browser tab.

## Key Features
- **Real-Time 3D Rendering:** High-fidelity 3D graphics, including custom textures, dynamic lighting, and environmental fog.
- **Accurate Rigid-Body Physics:** Complex collision detection between the ball, pins, lanes, and bumpers, taking mass and friction into account.
- **Interactive Controls:** Mouse and touch-based swipe controls. The physics engine interprets swipe speed and direction, calculating trajectory and spin (hook) in a three-dimensional space.
- **Dynamic Score Tracking:** A responsive, classic bowling scoreboard that automatically calculates strikes, spares, and open frames up to 10 rounds.
- **Modern User Interface:** A minimalist, flat UI overlay ensuring seamless configuration and gameplay without breaking immersion.

## Technologies and Libraries

The project relies entirely on client-side JavaScript, leveraging a stack of specialized 3D and physics libraries.

### THREE.js
At the core of the visual experience is **THREE.js**, a powerful WebGL wrapper. It is used to generate the scene, cameras, lighting, and geometric meshes. 
- **Lighting & Materials:** The environment utilizes `HemisphereLight` and `SpotLight` objects to create a vibrant retro synthwave aesthetic. Physical materials (`MeshPhysicalMaterial`, `MeshStandardMaterial`) are used to give the bowling ball its glossy clearcoat and the pins their realistic texture and light reflection.
- **Raycasting:** User swipe interactions are interpreted by unprojecting 2D screen coordinates into a 3D raycast onto the lane plane. Swipe distance/duration becomes throw speed; how much the swipe deviates from a straight line becomes hook/spin — both feed into the rigid-body velocity applied to the ball.

### Physijs and Ammo.js
Real-world physics cannot be hardcoded through simple animation loops. This project integrates **Physijs**, a wrapper that bridges THREE.js with **Ammo.js** (a direct JavaScript port of the Bullet physics engine).
- **Web Workers:** Physijs shifts the heavy physics calculations into a separate background Web Worker thread. This ensures the main UI and rendering loop remains at a smooth 60 FPS while collisions are continuously evaluated.
- **Friction & Damping:** Specific restitution and friction coefficients are applied to the bowling lane and pins to mimic the slide and hook of a real bowling ball.

### ThreeBSP (Constructive Solid Geometry)
To achieve the characteristic finger holes in the bowling ball, the project uses **ThreeBSP**, a Constructive Solid Geometry (CSG) library. 
- Instead of using a complex external 3D model, the bowling ball is generated purely in code by mathematically subtracting three cylindrical meshes (the finger holes) from a larger spherical mesh.

### Application Architecture
The game loop and application state are built using a strict Object-Oriented design:
- `PinManager`: Encapsulates the tracking, placement, and sweeping of pins on a per-lane basis.
- `Scoreboard`: Manages the complex logic of bowling rules, tracking frames, calculating total scores, and updating the DOM dynamically.

## Directory Structure
- `game/` - The core application directory.
  - `html/` - Contains the entry point (`init.html`) and UI markup.
  - `js/` - Modularized JavaScript source code (`init.js`, `ball.js`, `pin.js`, `Score.js`, `animation.js`, `cameraLight.js`).
- `libs/` - Third-party dependencies (THREE.js, Physijs, Ammo.js, ThreeBSP).

## Getting Started

Because the physics engine relies on Web Workers to load scripts (`physijs_worker.js` and `ammo.js`), the game cannot be run directly via the `file://` protocol due to browser cross-origin security restrictions.

### Prerequisites
You must serve the files via a local HTTP server.

### Running the Game
1. Open a terminal in the root directory of this project.
2. Start a local HTTP server. For example, using Python:
   ```bash
   python -m http.server 8000
   ```
   Or using Node.js:
   ```bash
   npx http-server
   ```
3. Open your web browser and navigate to `http://localhost:8000/game/html/init.html`.
4. Select the number of players and rounds from the start menu, and click **Play Now**.

## Authors
- AHMIM Mohamed ([@Mohamed](https://github.com/MohamedAhmim))
- RAMDANI Ferhat ([@Ferhat](https://github.com/ferhat-ramdani))
