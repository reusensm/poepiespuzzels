function lineIndices(N, orientation, i) {
  return Array.from({ length: N }, (_, j) => (orientation === "row" ? i * N + j : j * N + i));
}

function checkRuns(entries, conflicts, indices) {
  for (let i = 0; i + 2 < indices.length; i++) {
    const a = entries[indices[i]];
    const b = entries[indices[i + 1]];
    const c = entries[indices[i + 2]];
    if (a !== 0 && a !== 1) continue;
    if (a === b && b === c) {
      conflicts.add(indices[i]);
      conflicts.add(indices[i + 1]);
      conflicts.add(indices[i + 2]);
    }
  }
}

function checkBalance(entries, conflicts, indices, N) {
  const half = N / 2;
  const zeros = indices.filter((i) => entries[i] === 0);
  const ones = indices.filter((i) => entries[i] === 1);
  if (zeros.length > half) zeros.forEach((i) => conflicts.add(i));
  if (ones.length > half) ones.forEach((i) => conflicts.add(i));
}

function checkDuplicateLines(entries, conflicts, N, orientation) {
  const lines = [];
  for (let i = 0; i < N; i++) {
    const indices = lineIndices(N, orientation, i);
    const values = indices.map((idx) => entries[idx]);
    if (values.some((v) => v !== 0 && v !== 1)) continue;
    lines.push({ indices, values });
  }
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[i].values.every((v, k) => v === lines[j].values[k])) {
        lines[i].indices.forEach((idx) => conflicts.add(idx));
        lines[j].indices.forEach((idx) => conflicts.add(idx));
      }
    }
  }
}

/**
 * Returns the set of cell indices that break a Binairo rule: three-in-a-row,
 * a row/column with too many of one value, or a completed row/column that
 * duplicates another. Pure rule-based check — never compares against a
 * stored solution.
 */
export function getConflicts(entries, N) {
  const conflicts = new Set();

  for (let row = 0; row < N; row++) {
    const indices = lineIndices(N, "row", row);
    checkRuns(entries, conflicts, indices);
    checkBalance(entries, conflicts, indices, N);
  }
  for (let col = 0; col < N; col++) {
    const indices = lineIndices(N, "col", col);
    checkRuns(entries, conflicts, indices);
    checkBalance(entries, conflicts, indices, N);
  }
  checkDuplicateLines(entries, conflicts, N, "row");
  checkDuplicateLines(entries, conflicts, N, "col");

  return conflicts;
}

/** A puzzle is solved when every cell is filled (0/1) and no conflicts remain. */
export function isSolved(entries, N) {
  return entries.every((v) => v === 0 || v === 1) && getConflicts(entries, N).size === 0;
}
