// Midnight Vault — the vault crack and the loot.
// Hold the interact key in front of the vault to run the crack: moving
// pauses it, being spotted wipes it. Loot piles are picked up by walking
// over them; each one pays cash and nudges the alarm upward.

import { TUNING, clamp, distance } from './config.js';

export function createVaultState(world) {
  return {
    hackProgress: 0,
    open: false,
    loot: world.lootSpots.map((spot) => ({ ...spot, taken: false })),
    lootCount: 0,
    lootValue: 0,
  };
}

export function thiefNearVault(thief, world) {
  return distance(thief.x, thief.y, world.vault.hackX, world.vault.hackY) <= TUNING.hackDistance;
}

// Advance the crack. Returns 'cracked' the moment the vault swings open,
// 'reset' when being spotted wipes the progress, otherwise null.
export function updateVaultCrack(vault, dt, thief, world, holdingInteract, thiefMoving, thiefSeen) {
  if (vault.open) return null;
  if (!thiefNearVault(thief, world) || !holdingInteract || thiefMoving) return null;
  if (thiefSeen) {
    if (vault.hackProgress > 0) {
      vault.hackProgress = 0;
      return 'reset';
    }
    return null;
  }
  vault.hackProgress = clamp(vault.hackProgress + dt / TUNING.hackSeconds, 0, 1);
  if (vault.hackProgress >= 1) {
    vault.open = true;
    vault.lootCount += 1;
    vault.lootValue += TUNING.vaultLootValue;
    return 'cracked';
  }
  return null;
}

// Walk over a pile to pocket it. Returns the pile taken, or null.
export function pickupLoot(vault, thief) {
  for (const pile of vault.loot) {
    if (pile.taken) continue;
    if (distance(thief.x, thief.y, pile.x, pile.y) <= TUNING.lootPickupDistance) {
      pile.taken = true;
      vault.lootCount += 1;
      vault.lootValue += pile.value;
      return pile;
    }
  }
  return null;
}

export function lootRemaining(vault) {
  return vault.loot.filter((pile) => !pile.taken).length;
}

export function canEscape(vault) {
  return vault.open && vault.lootCount >= TUNING.minLootToEscape;
}
