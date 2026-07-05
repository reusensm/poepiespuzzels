const SIZE = 9;
const BOX = 3;

function shuffledDigits() {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits;
}

function isSafe(grid, row, col, value) {
  const boxRow = row - (row % BOX);
  const boxCol = col - (col % BOX);
  for (let i = 0; i < SIZE; i++) {
    if (grid[row * SIZE + i] === value) return false;
    if (grid[i * SIZE + col] === value) return false;
  }
  for (let r = 0; r < BOX; r++) {
    for (let c = 0; c < BOX; c++) {
      if (grid[(boxRow + r) * SIZE + (boxCol + c)] === value) return false;
    }
  }
  return true;
}

function fillGrid(grid) {
  const emptyIndex = grid.indexOf(0);
  if (emptyIndex === -1) return true;
  const row = Math.floor(emptyIndex / SIZE);
  const col = emptyIndex % SIZE;
  for (const value of shuffledDigits()) {
    if (isSafe(grid, row, col, value)) {
      grid[emptyIndex] = value;
      if (fillGrid(grid)) return true;
      grid[emptyIndex] = 0;
    }
  }
  return false;
}

/** Returns a freshly generated, fully solved 9x9 grid (flat array of 81 ints, 1-9). */
export function generateSolution() {
  const grid = new Array(SIZE * SIZE).fill(0);
  fillGrid(grid);
  return grid;
}

/** Fills in the blanks (0s) of a partially-filled grid via backtracking. Returns the solved grid, or null if unsolvable. */
export function solve(grid) {
  const copy = grid.slice();
  return fillGrid(copy) ? copy : null;
}

function countSolutionsRecursive(grid, limit, counter) {
  const emptyIndex = grid.indexOf(0);
  if (emptyIndex === -1) {
    counter.count += 1;
    return counter.count >= limit;
  }
  const row = Math.floor(emptyIndex / SIZE);
  const col = emptyIndex % SIZE;
  for (let value = 1; value <= 9; value++) {
    if (isSafe(grid, row, col, value)) {
      grid[emptyIndex] = value;
      const hitLimit = countSolutionsRecursive(grid, limit, counter);
      grid[emptyIndex] = 0;
      if (hitLimit) return true;
    }
  }
  return false;
}

/** Counts solutions for a partially-filled grid, stopping early once `limit` is reached. */
export function countSolutions(grid, limit = 2) {
  const copy = grid.slice();
  const counter = { count: 0 };
  countSolutionsRecursive(copy, limit, counter);
  return counter.count;
}
