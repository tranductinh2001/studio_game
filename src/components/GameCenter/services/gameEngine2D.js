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

// Pick N unique race winners (respecting secret teacher target for #1)
export function pickRaceWinners(items = [], targetId = null, mode = 'fair_random', winnerCount = 1) {
  if (!items || items.length === 0) return [];
  const count = Math.min(Math.max(1, Number(winnerCount) || 1), items.length);
  const firstWinner = pickRaceWinner(items, targetId, mode) || items[0];
  const winners = [firstWinner];
  const pool = items.filter((it) => it.id !== firstWinner.id);

  while (winners.length < count && pool.length > 0) {
    const randIdx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(randIdx, 1)[0]);
  }
  return winners;
}

// Compute dynamic progress for racing characters (boats, ducks, rockets)
// Strictly monotonic forward motion: guaranteed positive velocity (zero jitter/stutter)
export function computeRacerProgress(p, racerIndex, totalRacers, isWinner, seed = 1, winnerRank = -1) {
  const isTopWinner = isWinner || winnerRank >= 0;
  const effectiveRank = winnerRank >= 0 ? winnerRank : (isWinner ? 0 : -1);
  if (p <= 0) return 0;
  if (p >= 1) {
    if (effectiveRank === 0) return 100;
    if (effectiveRank > 0) return Math.max(96, 99.2 - effectiveRank * 0.6);
    return 88 + (racerIndex % 5) * 1.4;
  }

  // 1. Base progress
  const base = p;

  // 2. Smooth organic wave (sinusoidal speed variation with positive velocity guarantee)
  const freq = 1.6 + (racerIndex % 4) * 0.35;
  const phase = seed + racerIndex * 1.25;
  const A = 0.035;
  const w = freq * 2 * Math.PI;
  // Smooth envelope that zeroes out at start and finish
  const envelope = Math.sin(p * Math.PI);
  const organicWave = (Math.sin(w * p + phase) * A) * envelope;

  let prog = (base + organicWave) * 100;

  // 3. Winner sprint in final 40% (smooth cubic ease-in surge)
  if (isTopWinner && p > 0.60) {
    const sprintT = (p - 0.60) / 0.40;
    const rankFactor = Math.max(0.55, 1 - effectiveRank * 0.08);
    const sprintBoost = Math.pow(sprintT, 2.2) * 9.5 * rankFactor;
    prog += sprintBoost;
  } else if (!isTopWinner && p > 0.70) {
    const lagT = (p - 0.70) / 0.30;
    const lagDamp = Math.pow(lagT, 2.0) * 4.2;
    prog -= lagDamp;
  }

  // 4. Clamping
  if (prog < 0) prog = 0;
  if (!isTopWinner && prog > 95 && p < 0.98) prog = 95;
  if (prog > 100) prog = 100;

  return prog;
}

/**
 * Silently overrides the winning racer mid-race and gently accelerates
 * remaining race progress so the chosen team finishes early without any sound cues.
 */
export function applyStealthEarlyFinish(rt, target) {
  if (!rt || !target) return;
  rt.targetWinner = target;
  rt.determinedWinner = target;
  if (!rt.isFinished && rt.startTime > 0 && rt.duration > 0) {
    const now = performance.now();
    const currentElapsed = (now - rt.startTime) + (rt.elapsedBeforePause || 0);
    const targetElapsed = rt.duration * 0.78;
    if (currentElapsed < targetElapsed) {
      rt.elapsedBeforePause = (rt.elapsedBeforePause || 0) + (targetElapsed - currentElapsed);
    }
  }
}

