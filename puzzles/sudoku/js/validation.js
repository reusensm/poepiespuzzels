const SIZE = 9;
const BOX = 3;

function groupIndices() {
  const groups = [];
  for (let row = 0; row < SIZE; row++) {
    groups.push(Array.from({ length: SIZE }, (_, col) => row * SIZE + col));
  }
  for (let col = 0; col < SIZE; col++) {
    groups.push(Array.from({ length: SIZE }, (_, row) => row * SIZE + col));
  }
  for (let boxRow = 0; boxRow < BOX; boxRow++) {
    for (let boxCol = 0; boxCol < BOX; boxCol++) {
      const cells = [];
      for (let r = 0; r < BOX; r++) {
        for (let c = 0; c < BOX; c++) {
          cells.push((boxRow * BOX + r) * SIZE + (boxCol * BOX + c));
        }
      }
      groups.push(cells);
    }
  }
  return groups;
}

const GROUPS = groupIndices();

/**
 * Returns the set of cell indices that hold a value duplicated elsewhere in
 * their row, column, or box. Pure rule-based check — never compares against
 * a stored solution.
 */
export function getConflicts(entries) {
  const conflicts = new Set();
  for (const group of GROUPS) {
    const seenAt = new Map();
    for (const index of group) {
      const value = entries[index];
      if (!value) continue;
      if (seenAt.has(value)) {
        conflicts.add(index);
        conflicts.add(seenAt.get(value));
      } else {
        seenAt.set(value, index);
      }
    }
  }
  return conflicts;
}

/** A puzzle is solved when every cell is filled and no conflicts remain. */
export function isSolved(entries) {
  return entries.every((value) => value !== 0) && getConflicts(entries).size === 0;
}
