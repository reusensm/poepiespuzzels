const BLANK = -1;

function peerIndices(index, N) {
  const row = Math.floor(index / N);
  const col = index % N;
  const peers = new Set();
  for (let i = 0; i < N; i++) {
    peers.add(row * N + i);
    peers.add(i * N + col);
  }
  peers.delete(index);
  return peers;
}

function clearHighlights(cells) {
  cells.forEach((cell) => cell.classList.remove("selected", "peer"));
}

function highlightSelection(cells, index, N) {
  clearHighlights(cells);
  cells[index].classList.add("selected");
  for (const peerIndex of peerIndices(index, N)) {
    cells[peerIndex].classList.add("peer");
  }
}

function handleArrowNav(event, index, N, container) {
  const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: -N, ArrowDown: N };
  const delta = moves[event.key];
  if (delta === undefined) return;
  if (event.key === "ArrowRight" && index % N === N - 1) return;
  if (event.key === "ArrowLeft" && index % N === 0) return;
  const next = index + delta;
  if (next < 0 || next >= N * N) return;
  event.preventDefault();
  container.querySelector(`[data-index="${next}"]`)?.focus();
}

function cycleValue(current) {
  if (current !== 0 && current !== 1) return 0;
  return current === 0 ? 1 : BLANK;
}

function symbolFor(value) {
  if (value === 0) return "0";
  if (value === 1) return "1";
  return "";
}

/** Builds the N x N button cells for the grid and wires selection/navigation/input events. */
export function createGrid(container, N, { onCellChange } = {}) {
  container.innerHTML = "";
  container.style.setProperty("--binairo-size", String(N));
  const cells = [];

  for (let i = 0; i < N * N; i++) {
    const row = Math.floor(i / N);
    const col = i % N;

    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "binairo-cell";
    cell.dataset.index = String(i);
    cell.dataset.value = String(BLANK);
    cell.setAttribute("aria-label", `Row ${row + 1}, column ${col + 1}`);

    cell.addEventListener("click", () => {
      if (cell.classList.contains("given")) return;
      onCellChange?.(i, cycleValue(Number(cell.dataset.value)));
    });

    cell.addEventListener("keydown", (event) => {
      if (!cell.classList.contains("given")) {
        if (event.key === "0" || event.key === "1") {
          event.preventDefault();
          onCellChange?.(i, Number(event.key));
          return;
        }
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          onCellChange?.(i, BLANK);
          return;
        }
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          onCellChange?.(i, cycleValue(Number(cell.dataset.value)));
          return;
        }
      }
      handleArrowNav(event, i, N, container);
    });

    container.appendChild(cell);
    cells.push(cell);
  }

  container.addEventListener("focusin", (event) => {
    const index = Number(event.target?.dataset?.index);
    if (Number.isInteger(index)) highlightSelection(cells, index, N);
  });
  container.addEventListener("focusout", () => clearHighlights(cells));

  return cells;
}

/** Syncs the DOM cells to the current game state: values, given/hint/conflict styling. */
export function renderGrid(cells, { givens, entries, hintCells, conflicts }) {
  cells.forEach((cell, i) => {
    const isGiven = givens[i] === 0 || givens[i] === 1;
    const value = entries[i];
    cell.dataset.value = String(value);
    cell.textContent = symbolFor(value);
    cell.tabIndex = isGiven ? -1 : 0;
    cell.classList.toggle("given", isGiven);
    cell.classList.toggle("hint", hintCells.includes(i));
    cell.classList.toggle("conflict", conflicts.has(i));
  });
}

/** Re-applies selection/peer highlighting for whichever cell is currently focused. */
export function refreshSelectionHighlight(cells, N) {
  const index = cells.indexOf(document.activeElement);
  if (index === -1) {
    clearHighlights(cells);
  } else {
    highlightSelection(cells, index, N);
  }
}
