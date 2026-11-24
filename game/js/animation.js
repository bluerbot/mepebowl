let animators = [];
let isBallRolling = { 1: false, 2: false };
let isSwiping = false;
let swipeStartPos = new THREE.Vector2();
let swipeEndPos = new THREE.Vector2();
let swipeStartTime = 0;
let swipeMidPos = new THREE.Vector2();
let activeTeam = null;

let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function isPinsMoving(pm) {
    for (let i = 0; i < pm.allSpawnedPins.length; i++) {
        let v = pm.allSpawnedPins[i].getLinearVelocity();
        let a = pm.allSpawnedPins[i].getAngularVelocity();
        if (v.lengthSq() > 0.1 || a.lengthSq() > 0.1) return true;
    }
    return false;
}

function getRemainingStandingPins(pm) {
    let remainingStanding = [];
    for (let i = 0; i < pm.standingPins.length; i++) {
        let pinObj = pm.standingPins[i];
        let mesh = pinObj.pin;
        let upDir = new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.quaternion);
        let isFallen = upDir.z < 0.8 || mesh.position.z < 0;
        if (!isFallen) remainingStanding.push(pinObj);
    }
    return remainingStanding;
}


// Unified render loop
function animateLoop() {
    requestAnimationFrame(animateLoop);

    if (typeof camera !== 'undefined' && camera) {
        updateCameraTransition();
    }

    for (let i = animators.length - 1; i >= 0; i--) {
        let isDone = animators[i]();
        if (isDone) animators.splice(i, 1);
    }
}
requestAnimationFrame(animateLoop);

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function throwBall(team, vx, vy, hookSpin) {


  console.log("THROWBALL FUNCTION REACHED", team, vx, vy, hookSpin);


    let obj = team === 1 ? cyanBall : redBall;
    if (!obj) return;

    let x0 = obj.position.x;
    let y0 = obj.position.y;

    obj.setLinearVelocity(new THREE.Vector3(vx, vy, 0));
    obj.setAngularVelocity(new THREE.Vector3(0, -30, hookSpin));

    console.log("Ball launch:", {
        velocity: obj.getLinearVelocity(),
        position: obj.position.clone()
    });

    // Dynamic Physics Wait
    let animator = () => {
        if (obj.position.x > -2 && obj.position.z >= -1) {
            if (Math.abs(hookSpin) > 0.5) {
                obj.applyCentralForce(new THREE.Vector3(0, hookSpin * 1.2, 0));
            }
        }

        if (obj.position.x < -2 || obj.position.z < -1) {

            let evaluateTimer = 0;
            let settleAnimator = () => {
                evaluateTimer++;
                let pm = team === 1 ? pm1 : pm2;

                if ((isPinsMoving(pm) && evaluateTimer < 240) || evaluateTimer < 30) {
                    return false;
                }

                let remainingStanding = getRemainingStandingPins(pm);
                pm.standingPins = remainingStanding;

                obj.setLinearVelocity(new THREE.Vector3(0, 0, 0));
                obj.setAngularVelocity(new THREE.Vector3(0, 0, 0));
                obj.position.set(x0, y0, ballRadius);

                obj.rotation.set(0, 0, 0);

                obj.__dirtyPosition = true;
                obj.__dirtyRotation = true;

                let remainingPinsCount = remainingStanding.length;
                let result = typeof processThrow === 'function' ? processThrow(team, remainingPinsCount) : { action: 'none' };

                if (result.action === 'reset') {
                    setTimeout(() => resetLane(team), 800);
                } else if (result.action === 'sweep') {
                    setTimeout(() => sweepFallenPins(team), 300);
                }

                setTimeout(() => {
                    isBallRolling[team] = false;
                }, 1000);

                return true;
            };
            animators.push(settleAnimator);

            return true;
        }
        return false;
    };
    animators.push(animator);
}

function addMeshToScene(obj) {
    scene.add(obj);
}

/*
function getNormalizedCoords(clientX, clientY) {
    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    return mouse;
}
*/

function getNormalizedCoords(clientX, clientY) {
    let rect = document.getElementById("webgl").getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    return mouse;
}


// function handleSwipeStart(clientX, clientY) {
//     let coords = getNormalizedCoords(clientX, clientY);
//     raycaster.setFromCamera(coords, camera);
//
//     let ballMeshes = [];
//     if (cyanBall) ballMeshes.push(cyanBall.children[0]);
//     if (redBall) ballMeshes.push(redBall.children[0]);
//
//     let intersects = raycaster.intersectObjects(ballMeshes, false);
//
//     if (intersects.length > 0) {
//         let hitObj = intersects[0].object.parent;
//         if (hitObj === cyanBall) {
//             if (isBallRolling[1]) return;
//             activeTeam = 1;
//         } else if (hitObj === redBall) {
//             if (isBallRolling[2]) return;
//             activeTeam = 2;
//         }
//
//         isSwiping = true;
//         swipeStartPos.set(clientX, clientY);
//         swipeStartTime = performance.now();
//         swipeMidPos.set(clientX, clientY);
//     }
// }

function handleSwipeStart(clientX, clientY) {

console.log("SWIPE START");

    let coords = getNormalizedCoords(clientX, clientY);
    raycaster.setFromCamera(coords, camera);

    let ballBodies = [];
    if (cyanBall) ballBodies.push(cyanBall);
    if (redBall) ballBodies.push(redBall);

    let intersects = raycaster.intersectObjects(ballBodies, true);

    if (intersects.length > 0) {
        let hitObj = intersects[0].object;

        // Walk up the GLTF hierarchy to find its physics body.
        while (hitObj && hitObj !== cyanBall && hitObj !== redBall) {
            hitObj = hitObj.parent;
        }

        if (hitObj === cyanBall) {
            if (isBallRolling[1]) return;
            activeTeam = 1;
        } else if (hitObj === redBall) {
            if (isBallRolling[2]) return;
            activeTeam = 2;
        } else {
            return;
        }

        isSwiping = true;
        swipeStartPos.set(clientX, clientY);
        swipeStartTime = performance.now();
        swipeMidPos.set(clientX, clientY);
    }
}


function handleSwipeMove(clientX, clientY) {
    if (!isSwiping) return;

    let timeElapsed = performance.now() - swipeStartTime;
    if (timeElapsed > 50) {
        swipeMidPos.set(clientX, clientY);
    }
}

function handleSwipeEnd(clientX, clientY) {

console.log("SWIPE END", isSwiping, activeTeam);

    if (!isSwiping) return;
    isSwiping = false;

    swipeEndPos.set(clientX, clientY);
    let timeDelta = performance.now() - swipeStartTime;

    if (timeDelta < 50 || timeDelta > 3000) {
        activeTeam = null;
        return;
    }

    let dx = swipeEndPos.x - swipeStartPos.x;
    let dy = swipeEndPos.y - swipeStartPos.y;
    let dist2D = Math.sqrt(dx * dx + dy * dy);

    if (dist2D < 50) {
        activeTeam = null;
        return;
    }

    let speedMult = dist2D / timeDelta;
    let speedMagnitude = 20 * speedMult;

    if (speedMagnitude > 50) speedMagnitude = 50;
    if (speedMagnitude < 10) speedMagnitude = 10;

    // --- ACCURATE 3D DIRECTION UNPROJECTION ---
    let endCoords = getNormalizedCoords(swipeEndPos.x, swipeEndPos.y);
    let rayEnd = new THREE.Raycaster();
    rayEnd.setFromCamera(endCoords, camera);
    let groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -ballRadius);
    let worldEnd = new THREE.Vector3();

    let obj = activeTeam === 1 ? cyanBall : redBall;

    if (!rayEnd.ray.intersectPlane(groundPlane, worldEnd)) {
        let backWall = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
        if (!rayEnd.ray.intersectPlane(backWall, worldEnd)) {
            activeTeam = null;
            return;
        }
        worldEnd.z = ballRadius;
    }

    let dir3D = new THREE.Vector3().subVectors(worldEnd, obj.position);

    if (dir3D.x > 0) {
        activeTeam = null;
        return;
    }

    dir3D.normalize();
    let vx = dir3D.x * speedMagnitude;
    let vy = dir3D.y * speedMagnitude;

    let A = -dy;
    let B = dx;
    let C = (swipeStartPos.x * swipeEndPos.y) - (swipeEndPos.x * swipeStartPos.y);
    let deviation = (A * swipeMidPos.x + B * swipeMidPos.y + C) / Math.sqrt(A*A + B*B);

    let hookSpin = 0;
    if (Math.abs(deviation) > 15) {
        hookSpin = deviation * -0.4;
    }

    if (hookSpin > 30) hookSpin = 30;
    if (hookSpin < -30) hookSpin = -30;

    isBallRolling[activeTeam] = true;

    throwBall(activeTeam, vx, vy, hookSpin);
    activeTeam = null;
}

// Mouse Events
window.addEventListener('mousedown', (e) => handleSwipeStart(e.clientX, e.clientY));
window.addEventListener('mousemove', (e) => handleSwipeMove(e.clientX, e.clientY));
window.addEventListener('mouseup', (e) => handleSwipeEnd(e.clientX, e.clientY));

// Touch Events
window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) handleSwipeStart(e.touches[0].clientX, e.touches[0].clientY);
});
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY);
});
window.addEventListener('touchend', (e) => {
    if (e.changedTouches.length > 0) handleSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
});
