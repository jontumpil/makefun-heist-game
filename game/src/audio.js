// Midnight Vault — every sound is synthesized with WebAudio, no files.
// Footsteps, crack beeps, loot chimes, the alarm wail and the win jingle
// are all plain oscillators shaped by tiny gain envelopes.

export function createAudio() {
  const audio = {
    ctx: null,
    unlocked: false,
    muted: false,
    stepCounter: 0,
    alarmOsc: null,
    alarmGain: null,
  };

  function ensureContext() {
    if (audio.ctx) return audio.ctx;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      audio.ctx = new Ctor();
      audio.unlocked = true;
      return audio.ctx;
    } catch {
      return null;
    }
  }

  function tone(freq, duration, type, volume, slideTo) {
    if (audio.muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), ctx.currentTime + duration);
      gain.gain.setValueAtTime(volume || 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration + 0.02);
    } catch {
      // Sound is garnish: a blocked AudioContext must never break the game.
    }
  }

  audio.unlock = function unlock() {
    ensureContext();
  };

  audio.footstep = function footstep() {
    audio.stepCounter++;
    tone(audio.stepCounter % 2 === 0 ? 150 : 120, 0.07, 'triangle', 0.05);
  };

  audio.hackBeep = function hackBeep(progress) {
    tone(520 + progress * 420, 0.09, 'square', 0.06);
  };

  audio.lootChime = function lootChime() {
    tone(880, 0.12, 'sine', 0.12);
    setTimeout(() => tone(1318, 0.16, 'sine', 0.1), 70);
  };

  audio.panelBeep = function panelBeep() {
    tone(660, 0.08, 'square', 0.07);
  };

  audio.cameraOff = function cameraOff() {
    tone(420, 0.2, 'sawtooth', 0.08, 140);
  };

  audio.vaultCracked = function vaultCracked() {
    tone(330, 0.15, 'square', 0.1);
    setTimeout(() => tone(494, 0.15, 'square', 0.1), 120);
    setTimeout(() => tone(659, 0.3, 'square', 0.1), 240);
  };

  audio.spotted = function spotted() {
    tone(220, 0.25, 'sawtooth', 0.12, 440);
  };

  audio.caughtSting = function caughtSting() {
    tone(196, 0.5, 'sawtooth', 0.14, 55);
    tone(98, 0.7, 'square', 0.1, 49);
  };

  audio.winJingle = function winJingle() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, i) => setTimeout(() => tone(freq, 0.22, 'triangle', 0.12), i * 140));
  };

  audio.alarmPulse = function alarmPulse() {
    tone(740, 0.16, 'square', 0.07, 980);
  };

  return audio;
}
