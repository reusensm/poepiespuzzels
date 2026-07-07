import { generatePuzzle } from "./difficulty.js";
import { getConflicts, isSolved } from "./validation.js";
import { createGrid, renderGrid, refreshSelectionHighlight } from "./ui.js";
import { loadGame, saveGame, clearGame } from "./persistence.js";
import { createTimer, formatElapsed } from "../../../js/common/timer.js";

const gridContainer = document.getElementById("binairo-grid");
const difficultySelect = document.getElementById("difficulty-select");
const newPuzzleBtn = document.getElementById("new-puzzle-btn");
const undoBtn = document.getElementById("undo-btn");
const checkBtn = document.getElementById("check-btn");
const hintBtn = document.getElementById("hint-btn");
const solveBtn = document.getElementById("solve-btn");
const timerDisplay = document.getElementById("timer-display");
const hintCountDisplay = document.getElementById("hint-count");
const winModal = document.getElementById("win-modal");
const winModalCloseBtn = document.getElementById("win-modal-close");
const winTimeDisplay = document.getElementById("win-time");

let state = null;
let cells = [];
// Conflicts are only revealed on demand (via the Check button), not live as the
// player types, and hide again on the next move so they don't turn into an auto-checker.
let showConflicts = false;

const timer = createTimer({
  onTick: (seconds) => {
    state.elapsedSeconds = seconds;
    timerDisplay.textContent = formatElapsed(seconds);
    if (seconds % 5 === 0) persist();
  },
});

function buildGrid(size) {
  cells = createGrid(gridContainer, size, { onCellChange: handleCellChange });
}

function newGame(difficulty) {
  const { givens, solution, size } = generatePuzzle(difficulty);
  state = {
    difficulty,
    size,
    givens,
    solution,
    entries: givens.slice(),
    hintCells: [],
    history: [],
    elapsedSeconds: 0,
    status: "in-progress",
  };
  difficultySelect.value = difficulty;
  showConflicts = false;
  buildGrid(size);
  hideWinModal();
  render();
  timer.start(0);
  persist();
}

function handleCellChange(index, value) {
  if (!state || state.status !== "in-progress") return;
  if (state.givens[index] === 0 || state.givens[index] === 1) return;
  state.history.push(state.entries.slice());
  state.entries[index] = value;
  showConflicts = false;
  render();
  persist();
  checkWin();
}

function undoMove() {
  if (!state || state.status !== "in-progress") return;
  if (state.history.length === 0) return;
  state.entries = state.history.pop();
  showConflicts = false;
  render();
  persist();
}

function checkPuzzle() {
  if (!state || state.status !== "in-progress") return;
  showConflicts = true;
  render();
}

function render() {
  const conflicts = showConflicts ? getConflicts(state.entries, state.size) : new Set();
  renderGrid(cells, {
    givens: state.givens,
    entries: state.entries,
    hintCells: state.hintCells,
    conflicts,
  });
  refreshSelectionHighlight(cells, state.size);
  timerDisplay.textContent = formatElapsed(state.elapsedSeconds);
  hintCountDisplay.textContent = String(state.hintCells.length);
  const solved = state.status === "solved";
  undoBtn.disabled = solved || state.history.length === 0;
  checkBtn.disabled = solved;
  hintBtn.disabled = solved;
  solveBtn.disabled = solved;
}

function checkWin() {
  if (isSolved(state.entries, state.size)) {
    state.status = "solved";
    timer.stop();
    persist();
    render();
    showWinModal();
  }
}

function showWinModal() {
  winTimeDisplay.textContent = formatElapsed(state.elapsedSeconds);
  winModal.hidden = false;
}

function hideWinModal() {
  winModal.hidden = true;
}

function useHint() {
  if (!state || state.status !== "in-progress") return;
  const remaining = [];
  for (let i = 0; i < state.entries.length; i++) {
    if (state.entries[i] !== state.solution[i]) remaining.push(i);
  }
  if (remaining.length === 0) return;
  const index = remaining[Math.floor(Math.random() * remaining.length)];
  state.history.push(state.entries.slice());
  state.entries[index] = state.solution[index];
  if (!state.hintCells.includes(index)) state.hintCells.push(index);
  showConflicts = false;
  render();
  persist();
  checkWin();
}

function solvePuzzle() {
  if (!state) return;
  state.entries = state.solution.slice();
  state.status = "solved";
  timer.stop();
  render();
  persist();
  showWinModal();
}

function persist() {
  if (state) saveGame(state);
}

function restoreOrStart() {
  const saved = loadGame();
  if (saved) {
    state = saved;
    state.history = Array.isArray(state.history) ? state.history : [];
    difficultySelect.value = state.difficulty;
    buildGrid(state.size);
    render();
    if (state.status === "in-progress") {
      timer.start(state.elapsedSeconds);
    } else {
      timerDisplay.textContent = formatElapsed(state.elapsedSeconds);
      showWinModal();
    }
  } else {
    newGame(difficultySelect.value);
  }
}

newPuzzleBtn.addEventListener("click", () => {
  timer.stop();
  clearGame();
  newGame(difficultySelect.value);
});
undoBtn.addEventListener("click", undoMove);
checkBtn.addEventListener("click", checkPuzzle);
hintBtn.addEventListener("click", useHint);
solveBtn.addEventListener("click", solvePuzzle);
winModalCloseBtn.addEventListener("click", hideWinModal);

restoreOrStart();
