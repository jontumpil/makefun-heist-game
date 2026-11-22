// Midnight Vault — tuning numbers and palette in one place.
// Every other module reads these values instead of hiding magic numbers,
// so the feel of the heist (speeds, cones, alarm) can be tuned here alone.

export const WORLD = { width: 1280, height: 720 };

export const TUNING = {
  thiefSpeed: 175,
  thiefRadius: 13,
  guardPatrolSpeed: 72,
  guardChaseSpeed: 138,
  guardRadius: 14,
  guardConeRange: 195,
  guardConeHalfAngle: 0.52,
  cameraConeRange: 235,
  cameraConeHalfAngle: 0.44,
  cameraSweepSpeed: 0.55,
  suspicionFillPerSecond: 58,
  suspicionDrainPerSecond: 32,
  alarmRiseGuardPerSecond: 26,
  alarmRiseCameraPerSecond: 34,
  alarmDecayPerSecond: 9,
  alarmHuntDecayPerSecond: 4,
  alarmHuntThreshold: 100,
  alarmHuntReleaseBelow: 60,
  hackSeconds: 4,
  disableSeconds: 2.5,
  cameraOffSeconds: 20,
  panelCooldownSeconds: 5,
  lootAlarmBump: 6,
  vaultLootValue: 2500,
  vaultOpenAlarmBump: 10,
  catchDistance: 27,
  lootPickupDistance: 28,
  interactDistance: 52,
  hackDistance: 78,
  hideSpotFactor: 0.35,
  chaseGiveUpSeconds: 2.5,
  minLootToEscape: 3,
};

export const COLORS = {
  floorLobby: '#232838',
  floorCorridor: '#1d2233',
  floorVaultRoom: '#262b3d',
  floorLine: '#313850',
  wall: '#4a5170',
  wallTop: '#5d6486',
  hideSpot: '#10182e',
  hideSpotEdge: '#2c4a7a',
  vaultBody: '#8f96ad',
  vaultDoor: '#c8a24a',
  vaultOpen: '#3f6b4f',
  lootCash: '#58c96b',
  lootGold: '#f2c14e',
  exitMat: '#1f7a44',
  exitEdge: '#58c96b',
  panel: '#39c2d7',
  cameraBody: '#d8dee9',
  cameraOff: '#5a6274',
  coneGuard: 'rgba(255, 176, 32, 0.30)',
  coneGuardEdge: 'rgba(255, 176, 32, 0.75)',
  coneCamera: 'rgba(255, 64, 64, 0.28)',
  coneCameraEdge: 'rgba(255, 64, 64, 0.70)',
  thief: '#e8ecf4',
  thiefCoat: '#2b3a67',
  guardBody: '#c9403c',
  guardUniform: '#7e1f1c',
  hudBar: 'rgba(8, 10, 18, 0.88)',
  hudText: '#eef1f8',
  hudAlarm: '#ff4d4d',
  hudAlarmBack: '#3a1518',
  hudGold: '#f2c14e',
  titleShade: 'rgba(5, 7, 14, 0.72)',
};

export function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Deterministic pseudo-random generator, so ?shot= frames are identical
// on every machine for the same seed.
export function mulberry32(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
