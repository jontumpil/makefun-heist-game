# Midnight Vault — A One-Night Bank Heist

[![Competition](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![Rank](https://make.fun/badge/best-heist-game-20261122-0559/jontumpil/makefun-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![Reward](https://make.fun/badge/best-heist-game-20261122-0559/jontumpil/makefun-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

One night. One bank. One vault. **Midnight Vault** is an original top-down
2D stealth heist game that runs entirely from static files — no build step,
no network, no libraries. Sneak through the lobby, the vault corridor and
the vault room, read the patrols and the sweeping cones before you move,
crack the vault, grab the loot, and slip out through the green EXIT before
the alarm brings the whole floor down on you.

## How to play

- **Move:** WASD or arrow keys to sneak, or click anywhere to walk there.
- **Crack the vault:** stand at the gold vault door and **hold E**. Stay
  still and stay unseen — moving pauses the crack, being spotted wipes it.
- **Cut the cameras:** stand at a glowing control panel (A or B) and
  **hold E** to kill that camera's feed for 20 seconds.
- **Loot:** walk over cash and gold piles. Each one pays — and nudges the
  alarm meter upward.
- **Hide:** dark shadow nooks slow every guard's and camera's detection.
- **Escape:** once the vault is open and you hold at least 3 loot, reach
  the green EXIT mat at the bottom of the bank.
- **Lose:** if a guard touches you, the heist is over. If the alarm meter
  hits 100%, every guard hunts you until you break line of sight and the
  alarm cools down.
- **Restart:** press **R** after a win or a capture; **Enter** starts.

## The heist, room by room

- **Lobby (south):** where you slip in. Two desks for cover, two shadow
  nooks, and a guard walking a wide loop.
- **Vault corridor (middle):** pillars to duck behind, a patrolling guard,
  and a sweeping CCTV camera on the east wall.
- **Vault room (north):** the gold vault, side counters, a second CCTV
  camera, and a guard pacing in front of the vault door.

The HUD always shows the alarm meter, your loot total, both cameras'
ON/OFF status, and the time. All sound effects (footsteps, crack beeps,
loot chimes, the alarm wail) are synthesized with WebAudio — no audio files.

## Shots

Deterministic staging with `?shot=` and `seed=1`:

- `?shot=start&seed=1` — title screen over the bank floor, guards on patrol.
- `?shot=play&seed=1` — mid-heist: the thief cracking the vault while a
  guard's yellow cone closes in, a red camera cone sweeping, loot and the
  vault in frame, alarm meter at 55%.
- `?shot=end&seed=1` — clean getaway at the EXIT with the vault open and
  the full score.

## Play it locally

```sh
node serve.ts
# open http://localhost:8080 in desktop Chrome
```

## Layout

```
main.ts                  entry program: copies game/ + screenshots/ to /output
                         and writes /output/dossier.json
serve.ts                 tiny static server for local play (localhost:8080)
vendor/makefun-game.ts   the kit's dossier library, unchanged
shots.json               the three staged screenshots and their queries
game/index.html          canvas page, local scripts and styles only
game/src/config.js       tuning numbers, palette, helpers, seeded RNG
game/src/world.js        bank floor plan: walls, zones, hiding spots, loot
game/src/guards.js       patrol routes, wall-blocked vision cones, chase
game/src/cameras.js      sweeping CCTV cones, panel cut-offs, blackout timer
game/src/vault.js        vault crack, loot pickup, escape condition
game/src/render.js       all canvas drawing: floor, cones, HUD, screens
game/src/input.js        keyboard (WASD/arrows/E) and click-to-walk
game/src/audio.js        synthesized WebAudio effects, no audio files
game/src/main.js         boot, fixed-step loop, alarm, staging (?shot=)
```

## License

MIT — see [LICENSE](LICENSE).
