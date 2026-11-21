// =========================================================================
// 2D CARTOON GAME ENGINE & RUNTIME CONTROLLER
// Provides deterministic physics curves, catch-up algorithms,
// secret teacher rigging logic, easing functions, and audio triggers.
// =========================================================================

export const GAME_STATES = {
  IDLE: 'IDLE',
  READY: 'READY',
  COUNTDOWN: 'COUNTDOWN',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
  RESET: 'RESET'
};

// Easing Functions for Organic 2D Animation
export function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

export function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function easeOutQuint(x) {
  return 1 - Math.pow(1 - x, 5);
}

export function easeOutBack(x) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// Compute Race Winner based on Secret Teacher Control
export function pickRaceWinner(items = [], targetId = null, mode = 'fair_random') {
  if (!items || items.length === 0) return null;

  if (mode === 'teacher_rigged' && targetId) {
    const found = items.find(it => it.id === targetId || it.code === targetId || String(it.number) === String(targetId));
    if (found) return found;
  }

  if (mode === 'weighted_random' && targetId) {
    // 80% chance for target, 20% for others
    if (Math.random() < 0.8) {
      const found = items.find(it => it.id === targetId || it.code === targetId || String(it.number) === String(targetId));
      if (found) return found;
    }
  }

  // Fair random
  const idx = Math.floor(Math.random() * items.length);
  return items[idx];
}

// Compute dynamic progress for racing characters (boats, ducks, rockets)
// Normalized progress p in [0, 1]
export function computeRacerProgress(p, racerIndex, totalRacers, isWinner, seed = 1) {
  if (p <= 0) return 0;
  if (p >= 1) return isWinner ? 100 : (92 + (racerIndex % 3) * 2.5);

  // Base progress from time
  let prog = p * 100;

  // Add organic oscillation surges in mid-race (0.15 -> 0.8)
  const freq1 = 2.5 + (racerIndex * 0.7);
  const freq2 = 4.2 + (racerIndex * 0.4);
  const surge = Math.sin(p * Math.PI * freq1 + seed) * 4.5 + Math.cos(p * Math.PI * freq2) * 2.5;

  // In middle of race (20% to 75%), apply exciting surges
  const midPhase = Math.sin(p * Math.PI);
  prog += surge * midPhase;

  // Winner boost in the final 35% of the race
  if (isWinner && p > 0.65) {
    const sprintFactor = (p - 0.65) / 0.35; // 0 to 1
    prog += sprintFactor * 8.5;
  } else if (!isWinner && p > 0.75) {
    // Non-winners slightly slow down near finish line
    const lagFactor = (p - 0.75) / 0.25;
    prog -= lagFactor * 3.5;
  }

  // Ensure boundary [0, isWinner ? 100 : 98]
  if (prog < 0) prog = 0;
  const maxCap = isWinner ? 100 : 96;
  if (prog > maxCap && p < 0.98) prog = maxCap;

  return Math.min(prog, 100);
}
