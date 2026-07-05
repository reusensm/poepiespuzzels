import { generateSolution, countSolutions } from "./core.js";

const BLANK = -1;

/**
 * Difficulty maps to grid size rather than a fixed size with varying clue
 * density: larger grids have exponentially more row/column interactions to
 * track, which is what actually makes Binairo harder, and it keeps the
 * per-difficulty tuning to a single number instead of two.
 */
export const SIZE_BY_DIFFICULTY = { easy: 6, medium: 8, hard: 10, expert: 12 };
export const DIFFICULTIES = Object.keys(SIZE_BY_DIFFICULTY);

// 14x14 was tried and rejected: a single digging pass took 2+ minutes and
// sometimes didn't finish at all, because the backtracking solver has no
// constraint-propagation/lookahead and its search tree blows up once the
// grid gets both large and sparse. 12x12 stays comfortably fast (<1.5s
// worst-case observed) while still being a meaningful step up from "hard".
const CLUE_FRACTION = { easy: 0.6, medium: 0.5, hard: 0.42, expert: 0.38 };

function shuffledIndices(count) {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

function digOnce(solution, N, targetClues) {
  const givens = solution.slice();
  let clueCount = N * N;

  for (const index of shuffledIndices(N * N)) {
    if (clueCount <= targetClues) break;
    const backup = givens[index];
    givens[index] = BLANK;
    if (countSolutions(givens, N, 2) === 1) {
      clueCount -= 1;
    } else {
      givens[index] = backup;
    }
  }

  return { givens, clueCount };
}

/**
 * Generates a puzzle by carving clues out of a full solution while keeping
 * the solution unique. As with the sudoku digger, a single greedy pass can
 * get stuck above the target clue count, so this retries with a fresh
 * random cell order and keeps the lowest count reached.
 */
export function generatePuzzle(difficulty = "medium", maxAttempts = 30) {
  const N = SIZE_BY_DIFFICULTY[difficulty] ?? SIZE_BY_DIFFICULTY.medium;
  const targetClues = Math.round(N * N * (CLUE_FRACTION[difficulty] ?? CLUE_FRACTION.medium));
  const solution = generateSolution(N);

  let best = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { givens, clueCount } = digOnce(solution, N, targetClues);
    if (!best || clueCount < best.clueCount) best = { givens, clueCount };
    if (clueCount <= targetClues) break;
  }

  return { givens: best.givens, solution, difficulty, size: N };
}
