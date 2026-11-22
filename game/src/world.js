// Midnight Vault — the bank floor plan and all geometry helpers.
// One big floor, three zones: the lobby (south), the vault corridor
// (middle) and the vault room (north). Walls, hiding shadows, loot spots,
// the vault, the exit mat and the camera panels all live here.

import { WORLD } from './config.js';

export function buildWorld() {
  const walls = [
    // Outer shell.
    { x: 0, y: 0, w: WORLD.width, h: 24 },
    { x: 0, y: 696, w: WORLD.width, h: 24 },
    { x: 0, y: 0, w: 24, h: WORLD.height },
    { x: 1256, y: 0, w: 24, h: WORLD.height },
    // Lobby / corridor divider (y 460), two door gaps.
    { x: 24, y: 460, w: 276, h: 20 },
    { x: 380, y: 460, w: 520, h: 20 },
    { x: 980, y: 460, w: 276, h: 20 },
    // Corridor / vault-room divider (y 240), one guarded vault door.
    { x: 24, y: 240, w: 576, h: 20 },
    { x: 680, y: 240, w: 576, h: 20 },
    // Lobby desks (cover, not full walls).
    { x: 200, y: 540, w: 140, h: 44 },
    { x: 940, y: 540, w: 140, h: 44 },
    // Corridor pillars.
    { x: 420, y: 320, w: 44, h: 44 },
    { x: 816, y: 320, w: 44, h: 44 },
    // The vault block itself, north centre.
    { x: 560, y: 90, w: 160, h: 90 },
    // Vault-room side counters.
    { x: 300, y: 90, w: 120, h: 50 },
    { x: 860, y: 90, w: 120, h: 50 },
  ];

  const zones = [
    { name: 'VAULT ROOM', x: 24, y: 24, w: 1232, h: 216 },
    { name: 'VAULT CORRIDOR', x: 24, y: 260, w: 1232, h: 200 },
    { name: 'LOBBY', x: 24, y: 480, w: 1232, h: 216 },
  ];

  // Dark shadow nooks: standing inside one slows every detection.
  const hideSpots = [
    { x: 56, y: 520, w: 96, h: 80 },
    { x: 1128, y: 520, w: 96, h: 80 },
    { x: 70, y: 280, w: 90, h: 70 },
    { x: 1120, y: 280, w: 90, h: 70 },
  ];

  const lootSpots = [
    { x: 150, y: 640, kind: 'cash', value: 400 },
    { x: 1130, y: 640, kind: 'cash', value: 400 },
    { x: 330, y: 360, kind: 'gold', value: 800 },
    { x: 950, y: 360, kind: 'gold', value: 800 },
    { x: 420, y: 150, kind: 'cash', value: 500 },
    { x: 860, y: 150, kind: 'gold', value: 900 },
  ];

  const vault = { x: 560, y: 90, w: 160, h: 90, hackX: 640, hackY: 196 };
  const exitMat = { x: 600, y: 656, w: 80, h: 36 };

  // Control panels: panel A kills camera 1, panel B kills camera 2.
  const panels = [
    { id: 'A', x: 96, y: 648, cameraId: 0 },
    { id: 'B', x: 1184, y: 300, cameraId: 1 },
  ];

  const spawn = { x: 640, y: 664 };

  const guardRoutes = [
    { waypoints: [{ x: 220, y: 600 }, { x: 1060, y: 600 }, { x: 1060, y: 652 }, { x: 220, y: 652 }] },
    { waypoints: [{ x: 320, y: 360 }, { x: 960, y: 360 }] },
    { waypoints: [{ x: 360, y: 205 }, { x: 920, y: 205 }] },
  ];

  const cameraSpots = [
    { x: 64, y: 64, baseAngle: Math.PI * 0.32, sweep: 0.85, panelId: 'A' },
    { x: 1216, y: 350, baseAngle: Math.PI, sweep: 0.7, panelId: 'B' },
  ];

  return { walls, zones, hideSpots, lootSpots, vault, exitMat, panels, spawn, guardRoutes, cameraSpots };
}

export function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function circleHitsRect(cx, cy, radius, r) {
  const nearestX = Math.max(r.x, Math.min(cx, r.x + r.w));
  const nearestY = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < radius * radius;
}

export function circleHitsAnyWall(cx, cy, radius, walls) {
  for (const wall of walls) {
    if (circleHitsRect(cx, cy, radius, wall)) return true;
  }
  return false;
}

// Move a circle one axis at a time so it slides along walls instead of
// sticking to corners. Returns the new position.
export function moveCircle(x, y, dx, dy, radius, walls) {
  let nx = x;
  let ny = y;
  if (!circleHitsAnyWall(x + dx, y, radius, walls)) nx = x + dx;
  if (!circleHitsAnyWall(nx, y + dy, radius, walls)) ny = y + dy;
  return { x: nx, y: ny };
}

// Liang-Barsky clip: does segment (x1,y1)-(x2,y2) cross rectangle r?
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const edges = [
    [-dx, x1 - r.x],
    [dx, r.x + r.w - x1],
    [-dy, y1 - r.y],
    [dy, r.y + r.h - y1],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
    }
  }
  return true;
}

export function lineOfSightBlocked(x1, y1, x2, y2, walls) {
  for (const wall of walls) {
    if (segmentHitsRect(x1, y1, x2, y2, wall)) return true;
  }
  return false;
}

export function pointInHideSpot(x, y, hideSpots) {
  for (const spot of hideSpots) {
    if (pointInRect(x, y, spot)) return true;
  }
  return false;
}
