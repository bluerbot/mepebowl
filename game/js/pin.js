function createVector(x, y, z) {
    return new THREE.Vector3(x, y, z);
}

function createRealisticPinProfile() {
    let curve = new THREE.SplineCurve([
        new THREE.Vector2(0.150, 0.00), new THREE.Vector2(0.237, 0.30),
        new THREE.Vector2(0.317, 0.60), new THREE.Vector2(0.267, 0.86),
        new THREE.Vector2(0.167, 1.13), new THREE.Vector2(0.120, 1.33),
        new THREE.Vector2(0.130, 1.53), new THREE.Vector2(0.170, 1.80),
        new THREE.Vector2(0.100, 1.93), new THREE.Vector2(0.000, 2.00)
    ]);
    let points = curve.getPoints(50);
    points.unshift(new THREE.Vector2(0.000, 0.00));
    return points;
}

function createPinTexture() {
    let canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fdfdfd';
    ctx.fillRect(0, 0, 128, 512);
    ctx.fillStyle = '#e62222';
    ctx.fillRect(0, 512 * 0.35, 128, 512 * 0.03);
    ctx.fillRect(0, 512 * 0.28, 128, 512 * 0.03);
    let tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
}

const pinTex = createPinTexture();
const pinGeometry = new THREE.LatheGeometry(createRealisticPinProfile(), 64);
pinGeometry.rotateX(Math.PI / 2);
pinGeometry.computeBoundingBox();
pinGeometry.translate(0, 0, -1);
pinGeometry.computeBoundingBox();

const pinMaterial = new THREE.MeshStandardMaterial({
    map: pinTex, color: 0xffffff, roughness: 0.15, metalness: 0.05
});
const physPinMaterial = Physijs.createMaterial(pinMaterial, 0.4, 0.2);

function drawPin(x, y) {
    let pin = new Physijs.ConvexMesh(pinGeometry, physPinMaterial, 2.0);
    pin.position.set(x, y, 1.1); 
    pin.setDamping(0.1, 0.6);
    pin.castShadow = true;
    pin.receiveShadow = true;
    addMeshToScene(pin);
    return pin;
}

class PinManager {
    constructor(teamId) {
        this.teamId = teamId;
        this.allSpawnedPins = [];
        this.standingPins = [];
        this.initialLayout = [];
    }

    placePins(x0, y0, xGap, yGap) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < i + 1; j++) {
                let x = x0 - xGap * i;
                let y = y0 - (yGap / 2) * i + yGap * j;
                let pinMesh = drawPin(x, y);
                this.allSpawnedPins.push(pinMesh);
                this.initialLayout.push({ pin: pinMesh, position: { posx: x, posy: y } });
            }
        }
    }

    setupStandingPins() {
        this.standingPins = [...this.initialLayout];
    }

    resetLane() {
        this.allSpawnedPins.length = 0;
        let standingArr = [];

        this.initialLayout.forEach(layout => {
            let pinMesh = layout.pin;
            let pos = layout.position;
            
            if (pinMesh.parent !== scene) scene.add(pinMesh);
            
            pinMesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
            pinMesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
            pinMesh.position.set(pos.posx, pos.posy, 1.1);
            pinMesh.rotation.set(0, 0, 0);
            pinMesh.__dirtyPosition = true;
            pinMesh.__dirtyRotation = true;
            
            this.allSpawnedPins.push(pinMesh);
            standingArr.push(layout);
        });

        this.standingPins = standingArr;
    }

    sweepFallenPins() {
        let standingMeshes = this.standingPins.map(obj => obj.pin);
        
        this.allSpawnedPins.forEach(mesh => {
            if (!standingMeshes.includes(mesh)) {
                mesh.setLinearVelocity(new THREE.Vector3(0, 0, 0));
                mesh.setAngularVelocity(new THREE.Vector3(0, 0, 0));
                
                animators.push(() => {
                    mesh.position.x -= 0.3;
                    mesh.__dirtyPosition = true;
                    if (mesh.position.x < -12) {
                        scene.remove(mesh);
                        return true;
                    }
                    return false;
                });
            }
        });
        
        this.allSpawnedPins = standingMeshes.slice();
    }
}

let pm1 = new PinManager(1);
let pm2 = new PinManager(2);

// Expose legacy API mapped to PinManager to avoid breaking init.js immediately
function placePins(x0, y0, xGap, yGap, team) {
    if (team === 1) pm1.placePins(x0, y0, xGap, yGap);
    else pm2.placePins(x0, y0, xGap, yGap);
}

function resetLane(team) {
    if (team === 1) pm1.resetLane();
    else pm2.resetLane();
}

function sweepFallenPins(team) {
    if (team === 1) pm1.sweepFallenPins();
    else pm2.sweepFallenPins();
}

function setupStandingPins() {
    pm1.setupStandingPins();
    pm2.setupStandingPins();
}
