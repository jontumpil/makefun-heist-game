// Midnight Vault — patrolling guards with wall-blocked vision cones.
// A guard walks a waypoint loop, grows suspicious when the thief crosses
// his cone, and gives chase once he is sure. Lose sight of the thief and
// he cools off and walks back to his route.

import { TUNING, angleDifference, clamp, distance } from './config.js';
import { lineOfSightBlocked, moveCircle, pointInHideSpot } from './world.js';

export function createGuard(route, index) {
  const start = route.waypoints[0];
  return {
    id: index,
    x: start.x,
    y: start.y,
    facing: 0,
    waypointIndex: 1,
    patrolForward: true,
    suspicion: 0,
    state: 'patrol',
    loseSightTimer: 0,
    pauseTimer: 0,
    route,
  };
}

// True when the thief stands inside this guard's cone with a clear line.
export function guardCanSee(guard, thief, world) {
  const d = distance(guard.x, guard.y, thief.x, thief.y);
  if (d > TUNING.guardConeRange) return false;
  const angleToThief = Math.atan2(thief.y - guard.y, thief.x - guard.x);
  if (Math.abs(angleDifference(angleToThief, guard.facing)) > TUNING.guardConeHalfAngle) return false;
  if (lineOfSightBlocked(guard.x, guard.y, thief.x, thief.y, world.walls)) return false;
  return true;
}

export function guardVision(guard) {
  return {
    x: guard.x,
    y: guard.y,
    angle: guard.facing,
    range: TUNING.guardConeRange,
    halfAngle: TUNING.guardConeHalfAngle,
  };
}

function nextWaypoint(guard) {
  const points = guard.route.waypoints;
  if (points.length <= 2) {
    guard.waypointIndex = guard.waypointIndex === 0 ? 1 : 0;
    return points[guard.waypointIndex];
  }
  if (guard.patrolForward) {
    guard.waypointIndex++;
    if (guard.waypointIndex >= points.length) {
      guard.waypointIndex = points.length - 2;
      guard.patrolForward = false;
    }
  } else {
    guard.waypointIndex--;
    if (guard.waypointIndex < 0) {
      guard.waypointIndex = 1;
      guard.patrolForward = true;
    }
  }
  return points[guard.waypointIndex];
}

function walkToward(guard, tx, ty, speed, dt, world) {
  const d = distance(guard.x, guard.y, tx, ty);
  if (d < 2) return true;
  const step = Math.min(d, speed * dt);
  const dx = ((tx - guard.x) / d) * step;
  const dy = ((ty - guard.y) / d) * step;
  guard.facing = Math.atan2(ty - guard.y, tx - guard.x);
  const moved = moveCircle(guard.x, guard.y, dx, dy, TUNING.guardRadius, world.walls);
  guard.x = moved.x;
  guard.y = moved.y;
  return d <= step + 2;
}

// Returns 'caught' when this guard touches the thief, otherwise null.
export function updateGuard(guard, dt, thief, world) {
  const hiding = pointInHideSpot(thief.x, thief.y, world.hideSpots);
  const sees = guardCanSee(guard, thief, world);
  const fillRate = TUNING.suspicionFillPerSecond * (hiding ? TUNING.hideSpotFactor : 1);

  if (sees) {
    guard.suspicion = clamp(guard.suspicion + fillRate * dt, 0, 100);
    guard.loseSightTimer = 0;
  } else {
    guard.suspicion = clamp(guard.suspicion - TUNING.suspicionDrainPerSecond * dt, 0, 100);
    if (guard.state === 'chase') guard.loseSightTimer += dt;
  }

  if (guard.state === 'patrol' && guard.suspicion >= 100) {
    guard.state = 'chase';
    guard.loseSightTimer = 0;
  }

  if (guard.state === 'chase') {
    walkToward(guard, thief.x, thief.y, TUNING.guardChaseSpeed, dt, world);
    if (distance(guard.x, guard.y, thief.x, thief.y) <= TUNING.catchDistance) return 'caught';
    if (guard.loseSightTimer >= TUNING.chaseGiveUpSeconds) {
      guard.state = 'patrol';
      guard.suspicion = 40;
      guard.loseSightTimer = 0;
    }
    return null;
  }

  // Patrol: stroll to the next waypoint, pausing briefly at each one.
  if (guard.pauseTimer > 0) {
    guard.pauseTimer -= dt;
    return null;
  }
  const target = guard.route.waypoints[guard.waypointIndex];
  const arrived = walkToward(guard, target.x, target.y, TUNING.guardPatrolSpeed, dt, world);
  if (arrived) {
    nextWaypoint(guard);
    guard.pauseTimer = 0.6;
  }
  return null;
}

// Hunt mode: every guard drops the patrol and runs the thief down.
export function sendGuardToHunt(guard) {
  if (guard.state !== 'chase') {
    guard.state = 'chase';
    guard.suspicion = 100;
    guard.loseSightTimer = 0;
  }
}
