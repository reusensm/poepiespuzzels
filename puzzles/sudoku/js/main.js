import { generatePuzzle } from "./difficulty.js";
import { getConflicts, isSolved } from "./validation.js";
import { createGrid, renderGrid, refreshSelectionHighlight } from "./ui.js";
import { loadGame, saveGame, clearGame } from "./persistence.js";
import { createTimer, formatElapsed } from "../../../js/common/timer.js";

const gridContainer = document.getElementById("sudoku-grid");
const difficultySelect = document.getElementById("difficulty-select");
const newPuzzleBtn = document.getElementById("new-puzzle-btn");
const hintBtn = document.getElementById("hint-btn");
const solveBtn = document.getElementById("solve-btn");
const timerDisplay = document.getElementById("timer-display");
const hintCountDisplay = document.getElementById("hint-count");
const winModal = document.getElementById("win-modal");
const winModalCloseBtn = document.getElementById("win-modal-close");
const winTimeDisplay = document.getElementById("win-time");

let state = null;

const timer = createTimer({
  onTick: (seconds) => {
    state.elapsedSeconds = seconds;
    timerDisplay.textContent = formatElapsed(seconds);
    if (seconds % 5 === 0) persist();
  },
});

const cells = createGrid(gridContainer, { onCellChange: handleCellChange });

function newGame(difficulty) {
  const { givens, solution } = generatePuzzle(difficulty);
  state = {
    difficulty,
    givens,
    solution,
    entries: givens.slice(),
    hintCells: [],
    elapsedSeconds: 0,
    status: "in-progress",
  };
  difficultySelect.value = difficulty;
  hideWinModal();
  render();
  timer.start(0);
  persist();
}

function handleCellChange(index, value) {
  if (!state || state.status !== "in-progress") return;
  if (state.givens[index] !== 0) return;
  state.entries[index] = value;
  render();
  persist();
  checkWin();
}

function render() {
  const conflicts = getConflicts(state.entries);
  renderGrid(cells, {
    givens: state.givens,
    entries: state.entries,
    hintCells: state.hintCells,
    conflicts,
  });
  refreshSelectionHighlight(cells);
  timerDisplay.textContent = formatElapsed(state.elapsedSeconds);
  hintCountDisplay.textContent = String(state.hintCells.length);
  const solved = state.status === "solved";
  hintBtn.disabled = solved;
  solveBtn.disabled = solved;
}

function checkWin() {
  if (isSolved(state.entries)) {
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
  state.entries[index] = state.solution[index];
  if (!state.hintCells.includes(index)) state.hintCells.push(index);
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
    difficultySelect.value = state.difficulty;
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
hintBtn.addEventListener("click", useHint);
solveBtn.addEventListener("click", solvePuzzle);
winModalCloseBtn.addEventListener("click", hideWinModal);

restoreOrStart();
