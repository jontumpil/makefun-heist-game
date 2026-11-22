// Midnight Vault — sweeping CCTV cameras that the thief can switch off.
// Each camera sweeps its cone back and forth. Stand at its control panel
// and hold the interact key to cut the feed; the camera comes back online
// after a while, so the blackout is a window, not a free pass.

import { TUNING, angleDifference, clamp, distance } from './config.js';
import { lineOfSightBlocked } from './world.js';

export function createCamera(spot, index) {
  return {
    id: index,
    x: spot.x,
    y: spot.y,
    baseAngle: spot.baseAngle,
    sweep: spot.sweep,
    panelId: spot.panelId,
    phase: 0,
    angle: spot.baseAngle,
    offTimer: 0,
    disabled: false,
  };
}

export function updateCamera(camera, dt) {
  if (camera.disabled) {
    camera.offTimer -= dt;
    if (camera.offTimer <= 0) {
      camera.disabled = false;
      camera.offTimer = 0;
    }
    return;
  }
  camera.phase += dt * TUNING.cameraSweepSpeed;
  camera.angle = camera.baseAngle + Math.sin(camera.phase) * camera.sweep;
}

export function disableCamera(camera) {
  camera.disabled = true;
  camera.offTimer = TUNING.cameraOffSeconds;
}

export function cameraCanSee(camera, thief, world) {
  if (camera.disabled) return false;
  const d = distance(camera.x, camera.y, thief.x, thief.y);
  if (d > TUNING.cameraConeRange) return false;
  const angleToThief = Math.atan2(thief.y - camera.y, thief.x - camera.x);
  if (Math.abs(angleDifference(angleToThief, camera.angle)) > TUNING.cameraConeHalfAngle) return false;
  if (lineOfSightBlocked(camera.x, camera.y, thief.x, thief.y, world.walls)) return false;
  return true;
}

export function cameraVision(camera) {
  return {
    x: camera.x,
    y: camera.y,
    angle: camera.angle,
    range: TUNING.cameraConeRange,
    halfAngle: TUNING.cameraConeHalfAngle,
    disabled: camera.disabled,
  };
}

export function cameraStatusText(camera) {
  if (camera.disabled) return `CAM ${camera.id + 1} OFF ${Math.ceil(camera.offTimer)}s`;
  return `CAM ${camera.id + 1} ON`;
}

export function clampCameraAngle(camera) {
  return clamp(camera.angle, camera.baseAngle - camera.sweep, camera.baseAngle + camera.sweep);
}
