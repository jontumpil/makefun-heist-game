// Midnight Vault — all canvas drawing: the bank floor, vision cones,
// guards, cameras, the thief, the loot, the vault, and the HUD.
// The HUD is drawn on top of the world so the alarm meter, loot total
// and camera status stay readable even in a shrunken screenshot.

import { COLORS, TUNING, WORLD, clamp } from './config.js';
import { cameraVision } from './cameras.js';
import { guardVision } from './guards.js';

function drawCone(ctx, vision, fill, edge) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(vision.x, vision.y);
  ctx.arc(vision.x, vision.y, vision.range, vision.angle - vision.halfAngle, vision.angle + vision.halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawShadowSpots(ctx, world) {
  for (const spot of world.hideSpots) {
    ctx.fillStyle = COLORS.hideSpot;
    ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
    ctx.strokeStyle = COLORS.hideSpotEdge;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(spot.x + 1, spot.y + 1, spot.w - 2, spot.h - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = '#7fa8e0';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SHADOW', spot.x + spot.w / 2, spot.y + spot.h / 2 + 5);
  }
}

function drawFloor(ctx, world) {
  for (const zone of world.zones) {
    const color = zone.name === 'VAULT ROOM' ? COLORS.floorVaultRoom
      : zone.name === 'VAULT CORRIDOR' ? COLORS.floorCorridor
      : COLORS.floorLobby;
    ctx.fillStyle = color;
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
  }
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 1;
  for (let gx = 24; gx < WORLD.width; gx += 64) {
    ctx.beginPath();
    ctx.moveTo(gx, 24);
    ctx.lineTo(gx, 696);
    ctx.stroke();
  }
  for (let gy = 24; gy < WORLD.height; gy += 64) {
    ctx.beginPath();
    ctx.moveTo(24, gy);
    ctx.lineTo(1256, gy);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(238, 241, 248, 0.55)';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('VAULT ROOM', 48, 70);
  ctx.fillText('VAULT CORRIDOR', 48, 300);
  ctx.fillText('LOBBY', 48, 520);
}

function drawWalls(ctx, world) {
  for (const wall of world.walls) {
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = COLORS.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, 4);
  }
}

function drawVault(ctx, world, vault) {
  const v = world.vault;
  ctx.fillStyle = vault.open ? COLORS.vaultOpen : COLORS.vaultBody;
  ctx.fillRect(v.x, v.y, v.w, v.h);
  ctx.strokeStyle = '#2c3145';
  ctx.lineWidth = 3;
  ctx.strokeRect(v.x, v.y, v.w, v.h);
  ctx.fillStyle = COLORS.vaultDoor;
  ctx.beginPath();
  ctx.arc(v.x + v.w / 2, v.y + v.h / 2, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6b5316';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#2c3145';
  ctx.beginPath();
  ctx.arc(v.x + v.w / 2, v.y + v.h / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = vault.open ? '#e8ecf4' : '#f2c14e';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(vault.open ? 'VAULT OPEN' : 'VAULT', v.x + v.w / 2, v.y - 10);
  if (!vault.open && vault.hackProgress > 0) {
    const barW = 120;
    const bx = v.x + v.w / 2 - barW / 2;
    const by = v.y + v.h + 8;
    ctx.fillStyle = '#10131f';
    ctx.fillRect(bx - 2, by - 2, barW + 4, 14);
    ctx.fillStyle = '#39c2d7';
    ctx.fillRect(bx, by, barW * vault.hackProgress, 10);
    ctx.fillStyle = '#eef1f8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CRACKING…', v.x + v.w / 2, by + 26);
  }
}

function drawLoot(ctx, vault) {
  for (const pile of vault.loot) {
    if (pile.taken) continue;
    const bob = 0;
    ctx.fillStyle = pile.kind === 'gold' ? COLORS.lootGold : COLORS.lootCash;
    ctx.beginPath();
    ctx.arc(pile.x, pile.y + bob, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10131f';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#10131f';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', pile.x, pile.y + bob + 5);
  }
}

function drawExit(ctx, world, canEscape) {
  const e = world.exitMat;
  ctx.fillStyle = canEscape ? COLORS.exitMat : '#23402e';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = canEscape ? COLORS.exitEdge : '#3a5a44';
  ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = '#eef1f8';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', e.x + e.w / 2, e.y + e.h / 2 + 5);
}

function drawPanels(ctx, world, panelProgress) {
  for (const panel of world.panels) {
    ctx.fillStyle = COLORS.panel;
    ctx.fillRect(panel.x - 10, panel.y - 14, 20, 28);
    ctx.strokeStyle = '#10131f';
    ctx.lineWidth = 2;
    ctx.strokeRect(panel.x - 10, panel.y - 14, 20, 28);
    ctx.fillStyle = '#10131f';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(panel.id, panel.x, panel.y + 4);
    ctx.fillStyle = '#eef1f8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`PANEL ${panel.id} — HOLD E TO CUT CAM`, panel.x, panel.y - 22);
    const progress = panelProgress[panel.id] || 0;
    if (progress > 0) {
      ctx.fillStyle = '#10131f';
      ctx.fillRect(panel.x - 30, panel.y + 20, 60, 8);
      ctx.fillStyle = COLORS.panel;
      ctx.fillRect(panel.x - 30, panel.y + 20, 60 * progress, 8);
    }
  }
}

function drawCameras(ctx, cameras) {
  for (const camera of cameras) {
    if (!camera.disabled) drawCone(ctx, cameraVision(camera), COLORS.coneCamera, COLORS.coneCameraEdge);
  }
  for (const camera of cameras) {
    ctx.fillStyle = camera.disabled ? COLORS.cameraOff : COLORS.cameraBody;
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#10131f';
    ctx.lineWidth = 2;
    ctx.stroke();
    const lx = camera.x + Math.cos(camera.angle) * 16;
    const ly = camera.y + Math.sin(camera.angle) * 16;
    ctx.strokeStyle = camera.disabled ? COLORS.cameraOff : '#ff4040';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(camera.x, camera.y);
    ctx.lineTo(lx, ly);
    ctx.stroke();
    ctx.fillStyle = camera.disabled ? '#8a93a5' : '#ff4040';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(camera.disabled ? 'CAM OFF' : 'CCTV', camera.x, camera.y - 16);
  }
}

function drawGuards(ctx, guards) {
  for (const guard of guards) {
    drawCone(ctx, guardVision(guard), COLORS.coneGuard, COLORS.coneGuardEdge);
  }
  for (const guard of guards) {
    ctx.fillStyle = COLORS.guardUniform;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, TUNING.guardRadius + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.guardBody;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, TUNING.guardRadius, 0, Math.PI * 2);
    ctx.fill();
    const fx = guard.x + Math.cos(guard.facing) * 12;
    const fy = guard.y + Math.sin(guard.facing) * 12;
    ctx.fillStyle = '#ffe9b0';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
    if (guard.suspicion > 5) {
      const barW = 44;
      ctx.fillStyle = '#10131f';
      ctx.fillRect(guard.x - barW / 2, guard.y - 30, barW, 7);
      ctx.fillStyle = guard.suspicion >= 100 ? '#ff4d4d' : '#ffb020';
      ctx.fillRect(guard.x - barW / 2, guard.y - 30, barW * clamp(guard.suspicion, 0, 100) / 100, 7);
    }
    if (guard.state === 'chase') {
      ctx.fillStyle = '#ff4d4d';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', guard.x, guard.y - 36);
    }
  }
}

function drawThief(ctx, thief) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(thief.x, thief.y + 10, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.thiefCoat;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, TUNING.thiefRadius + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, TUNING.thiefRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#10131f';
  ctx.beginPath();
  ctx.arc(thief.x + Math.cos(thief.facing) * 6, thief.y + Math.sin(thief.facing) * 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2c14e';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', thief.x, thief.y - 20);
}

function drawHud(ctx, state) {
  ctx.fillStyle = COLORS.hudBar;
  ctx.fillRect(0, 0, WORLD.width, 56);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MIDNIGHT VAULT', 16, 36);

  // Alarm meter.
  const alarmX = 260;
  const alarmW = 300;
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('ALARM', alarmX, 24);
  ctx.fillStyle = COLORS.hudAlarmBack;
  ctx.fillRect(alarmX, 30, alarmW, 16);
  ctx.fillStyle = state.alarm >= 100 ? '#ff2020' : COLORS.hudAlarm;
  ctx.fillRect(alarmX, 30, alarmW * clamp(state.alarm, 0, 100) / 100, 16);
  ctx.strokeStyle = '#eef1f8';
  ctx.lineWidth = 2;
  ctx.strokeRect(alarmX, 30, alarmW, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`${Math.round(state.alarm)}%`, alarmX + alarmW + 10, 44);

  // Loot.
  ctx.fillStyle = COLORS.hudGold;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`LOOT $${state.vault.lootValue}  (${state.vault.lootCount}/7)`, 640, 36);

  // Camera status.
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  const camText = state.cameras.map((c) => (c.disabled ? `CAM ${c.id + 1} OFF` : `CAM ${c.id + 1} ON`)).join('   ');
  ctx.fillText(camText, 1264, 24);
  ctx.fillText(`TIME ${formatTime(state.elapsed)}`, 1264, 46);
  ctx.textAlign = 'left';

  // Objective line under the bar.
  ctx.fillStyle = 'rgba(238, 241, 248, 0.9)';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(state.objective, 16, 76);
}

function formatTime(seconds) {
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function drawCenterPanel(ctx, lines, accent) {
  ctx.fillStyle = COLORS.titleShade;
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  const panelW = 720;
  const panelH = 120 + lines.length * 34;
  const px = (WORLD.width - panelW) / 2;
  const py = (WORLD.height - panelH) / 2;
  ctx.fillStyle = 'rgba(10, 12, 20, 0.94)';
  ctx.fillRect(px, py, panelW, panelH);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.strokeRect(px, py, panelW, panelH);
  ctx.textAlign = 'center';
  lines.forEach((line, i) => {
    ctx.fillStyle = line.color || COLORS.hudText;
    ctx.font = line.font || 'bold 22px sans-serif';
    ctx.fillText(line.text, WORLD.width / 2, py + 52 + i * 34);
  });
  ctx.textAlign = 'left';
}

export function drawGame(ctx, state) {
  const { world, vault, guards, cameras, thief } = state;
  drawFloor(ctx, world);
  drawShadowSpots(ctx, world);
  drawLoot(ctx, vault);
  drawExit(ctx, world, state.canEscape);
  drawPanels(ctx, world, state.panelProgress);
  drawVault(ctx, world, vault);
  drawWalls(ctx, world);
  drawCameras(ctx, cameras);
  drawGuards(ctx, guards);
  drawThief(ctx, thief);
  drawHud(ctx, state);

  if (state.screen === 'title') {
    drawCenterPanel(ctx, [
      { text: 'MIDNIGHT VAULT', font: 'bold 44px sans-serif', color: '#f2c14e' },
      { text: 'One night. One bank. One vault.', font: 'bold 22px sans-serif' },
      { text: 'WASD / arrows to sneak — click to walk — hold E to crack the vault or cut a camera', font: '18px sans-serif' },
      { text: 'Grab at least 3 loot, crack the vault, then escape through the green EXIT.', font: '18px sans-serif' },
      { text: 'Stay out of the yellow guard cones and the red camera cones.', font: '18px sans-serif' },
      { text: 'Press ENTER or click to start the heist', font: 'bold 20px sans-serif', color: '#39c2d7' },
    ], '#f2c14e');
  } else if (state.screen === 'caught') {
    drawCenterPanel(ctx, [
      { text: 'CAUGHT!', font: 'bold 44px sans-serif', color: '#ff4d4d' },
      { text: 'A guard grabbed you before you reached the street.', font: 'bold 22px sans-serif' },
      { text: `Loot kept: $${state.vault.lootValue} — the vault keeps the rest.`, font: '18px sans-serif' },
      { text: 'Press R to plan the next attempt', font: 'bold 20px sans-serif', color: '#39c2d7' },
    ], '#ff4d4d');
  } else if (state.screen === 'win') {
    drawCenterPanel(ctx, [
      { text: 'CLEAN GETAWAY!', font: 'bold 44px sans-serif', color: '#58c96b' },
      { text: `You slipped out with $${state.vault.lootValue} in ${formatTime(state.elapsed)}.`, font: 'bold 22px sans-serif' },
      { text: `Loot ${state.vault.lootCount}/7 — the crew eats tonight.`, font: '18px sans-serif' },
      { text: 'Press R to run it back for a bigger score', font: 'bold 20px sans-serif', color: '#39c2d7' },
    ], '#58c96b');
  }
}
