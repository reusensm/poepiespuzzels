const SIZE = 9;

function peerIndices(index) {
  const row = Math.floor(index / SIZE);
  const col = index % SIZE;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  const peers = new Set();
  for (let i = 0; i < SIZE; i++) {
    peers.add(row * SIZE + i);
    peers.add(i * SIZE + col);
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      peers.add((boxRow + r) * SIZE + (boxCol + c));
    }
  }
  peers.delete(index);
  return peers;
}

function clearHighlights(cells) {
  cells.forEach((cell) => cell.classList.remove("selected", "peer", "same-value"));
}

function highlightSelection(cells, index) {
  clearHighlights(cells);
  cells[index].classList.add("selected");
  for (const peerIndex of peerIndices(index)) {
    cells[peerIndex].classList.add("peer");
  }

  const value = cells[index].value;
  if (!value) return;
  cells.forEach((cell, i) => {
    if (i !== index && cell.value === value) cell.classList.add("same-value");
  });
}

function handleArrowNav(event, index, container) {
  const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: -SIZE, ArrowDown: SIZE };
  const delta = moves[event.key];
  if (delta === undefined) return;
  if (event.key === "ArrowRight" && index % SIZE === SIZE - 1) return;
  if (event.key === "ArrowLeft" && index % SIZE === 0) return;
  const next = index + delta;
  if (next < 0 || next > 80) return;
  event.preventDefault();
  container.querySelector(`[data-index="${next}"]`)?.focus();
}

/** Builds the 81 input cells for the grid and wires selection/navigation/input events. */
export function createGrid(container, { onCellChange } = {}) {
  container.innerHTML = "";
  const cells = [];

  for (let i = 0; i < SIZE * SIZE; i++) {
    const row = Math.floor(i / SIZE);
    const col = i % SIZE;

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.autocomplete = "off";
    input.maxLength = 1;
    input.className = "sudoku-cell";
    input.dataset.index = String(i);
    input.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);

    if (col % 3 === 0) input.classList.add("box-edge-left");
    if (col === SIZE - 1) input.classList.add("box-edge-right");
    if (row % 3 === 0) input.classList.add("box-edge-top");
    if (row === SIZE - 1) input.classList.add("box-edge-bottom");

    input.addEventListener("input", () => {
      const digit = input.value.replace(/[^1-9]/g, "").slice(-1);
      input.value = digit;
      onCellChange?.(i, digit ? Number(digit) : 0);
    });
    input.addEventListener("keydown", (event) => handleArrowNav(event, i, container));

    container.appendChild(input);
    cells.push(input);
  }

  container.addEventListener("focusin", (event) => {
    const index = Number(event.target?.dataset?.index);
    if (Number.isInteger(index)) highlightSelection(cells, index);
  });
  container.addEventListener("focusout", () => clearHighlights(cells));

  return cells;
}

/**
 * Re-applies selection/peer/same-value highlighting for whichever cell is
 * currently focused. Call after re-rendering values (e.g. hint/solve) so a
 * focused cell's highlighting stays in sync with values that changed out
 * from under it.
 */
export function refreshSelectionHighlight(cells) {
  const index = cells.indexOf(document.activeElement);
  if (index === -1) {
    clearHighlights(cells);
  } else {
    highlightSelection(cells, index);
  }
}

/** Syncs the DOM cells to the current game state: values, given/hint/conflict styling. */
export function renderGrid(cells, { givens, entries, hintCells, conflicts }) {
  cells.forEach((cell, i) => {
    const isGiven = givens[i] !== 0;
    const value = entries[i];
    if (document.activeElement !== cell) {
      cell.value = value ? String(value) : "";
    }
    cell.readOnly = isGiven;
    cell.tabIndex = isGiven ? -1 : 0;
    cell.classList.toggle("given", isGiven);
    cell.classList.toggle("hint", hintCells.includes(i));
    cell.classList.toggle("conflict", conflicts.has(i));
  });
}
