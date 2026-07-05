const BLANK = -1;

function shuffledValues() {
  return Math.random() < 0.5 ? [0, 1] : [1, 0];
}

/**
 * Checks whether placing `value` at `index` keeps the grid consistent with
 * Binairo's rules, given that every cell before `index` (in row-major order)
 * is already filled. Rules: no three consecutive equal values in a row or
 * column, each row/column has exactly N/2 zeros and N/2 ones, and no two
 * rows (or columns) are identical.
 */
function isValidPlacement(grid, N, index, value) {
  const row = Math.floor(index / N);
  const col = index % N;
  const half = N / 2;

  if (col >= 2 && grid[row * N + col - 1] === value && grid[row * N + col - 2] === value) {
    return false;
  }
  if (row >= 2 && grid[(row - 1) * N + col] === value && grid[(row - 2) * N + col] === value) {
    return false;
  }

  let rowCount = 1;
  for (let c = 0; c < col; c++) {
    if (grid[row * N + c] === value) rowCount++;
  }
  if (rowCount > half) return false;

  let colCount = 1;
  for (let r = 0; r < row; r++) {
    if (grid[r * N + col] === value) colCount++;
  }
  if (colCount > half) return false;

  if (col === N - 1) {
    for (let r = 0; r < row; r++) {
      let same = true;
      for (let c = 0; c < N; c++) {
        const cellValue = c === col ? value : grid[row * N + c];
        if (grid[r * N + c] !== cellValue) {
          same = false;
          break;
        }
      }
      if (same) return false;
    }
  }

  if (row === N - 1) {
    for (let c = 0; c < col; c++) {
      let same = true;
      for (let r = 0; r < N; r++) {
        const currentColValue = r === row ? value : grid[r * N + col];
        if (grid[r * N + c] !== currentColValue) {
          same = false;
          break;
        }
      }
      if (same) return false;
    }
  }

  return true;
}

function fillBoard(grid, N) {
  const index = grid.indexOf(BLANK);
  if (index === -1) return true;
  for (const value of shuffledValues()) {
    if (isValidPlacement(grid, N, index, value)) {
      grid[index] = value;
      if (fillBoard(grid, N)) return true;
      grid[index] = BLANK;
    }
  }
  return false;
}

/** Returns a freshly generated, fully solved N x N grid (flat array, 0/1). N must be even. */
export function generateSolution(N) {
  const grid = new Array(N * N).fill(BLANK);
  fillBoard(grid, N);
  return grid;
}

/** Fills in the blanks (-1) of a partially-filled grid via backtracking. Returns the solved grid, or null if unsolvable. */
export function solve(givens, N) {
  const copy = givens.slice();
  return fillBoard(copy, N) ? copy : null;
}

function countSolutionsRecursive(grid, N, limit, counter) {
  const index = grid.indexOf(BLANK);
  if (index === -1) {
    counter.count += 1;
    return counter.count >= limit;
  }
  for (const value of [0, 1]) {
    if (isValidPlacement(grid, N, index, value)) {
      grid[index] = value;
      const hitLimit = countSolutionsRecursive(grid, N, limit, counter);
      grid[index] = BLANK;
      if (hitLimit) return true;
    }
  }
  return false;
}

/** Counts solutions for a partially-filled grid, stopping early once `limit` is reached. */
export function countSolutions(givens, N, limit = 2) {
  const copy = givens.slice();
  const counter = { count: 0 };
  countSolutionsRecursive(copy, N, limit, counter);
  return counter.count;
}
