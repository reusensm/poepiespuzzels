import { generateSolution, countSolutions } from "./core.js";

const MIN_CLUES = 17;

export const DIFFICULTY_CLUES = {
  easy: 40,
  medium: 32,
  hard: 26,
};

export const DIFFICULTIES = Object.keys(DIFFICULTY_CLUES);

function shuffledIndices() {
  const indices = Array.from({ length: 81 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function digOnce(solution, targetClues) {
  const givens = solution.slice();
  let clueCount = 81;

  const seen = new Set();
  for (const index of shuffledIndices()) {
    if (clueCount <= targetClues) break;
    if (seen.has(index)) continue;

    const partner = 80 - index;
    seen.add(index);
    seen.add(partner);

    const pair = index === partner ? [index] : [index, partner];
    if (clueCount - pair.length < MIN_CLUES) continue;

    const backup = pair.map((i) => givens[i]);
    pair.forEach((i) => { givens[i] = 0; });

    if (countSolutions(givens, 2) === 1) {
      clueCount -= pair.length;
    } else {
      pair.forEach((i, k) => { givens[i] = backup[k]; });
    }
  }

  return { givens, clueCount };
}

/**
 * Generates a puzzle by carving clues out of a full solution while keeping the
 * solution unique, removing point-symmetric cell pairs together for the
 * classic rotationally-symmetric look.
 *
 * A single greedy digging pass can get stuck above the target clue count
 * (removing further cells would create a second solution) well before
 * reaching lower targets like "hard". Symmetric-pair removal also can't land
 * on an even clue count unless the lone center cell happens to be removed,
 * which isn't guaranteed on any given pass. So this retries the dig with a
 * fresh random cell order, keeping the lowest clue count seen, until it
 * reaches the target or exhausts its attempts.
 */
export function generatePuzzle(difficulty = "medium", maxAttempts = 30) {
  const targetClues = DIFFICULTY_CLUES[difficulty] ?? DIFFICULTY_CLUES.medium;
  const solution = generateSolution();

  let best = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { givens, clueCount } = digOnce(solution, targetClues);
    if (!best || clueCount < best.clueCount) best = { givens, clueCount };
    if (clueCount <= targetClues) break;
  }

  return { givens: best.givens, solution, difficulty };
}
