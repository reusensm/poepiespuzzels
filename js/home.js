import { puzzles } from "../puzzles/registry.js";

function renderCard(puzzle) {
  const card = document.createElement(puzzle.available ? "a" : "div");
  card.className = "puzzle-card" + (puzzle.available ? "" : " puzzle-card-disabled");
  if (puzzle.available) card.href = puzzle.path;

  card.innerHTML = `
    <span class="puzzle-card-icon" aria-hidden="true">${puzzle.icon}</span>
    <h3>${puzzle.name}</h3>
    <p>${puzzle.blurb}${puzzle.available ? "" : " (coming soon)"}</p>
  `;
  return card;
}

function renderPuzzleGrid() {
  const grid = document.getElementById("puzzle-grid");
  if (!grid) return;
  for (const puzzle of puzzles) {
    grid.appendChild(renderCard(puzzle));
  }
}

renderPuzzleGrid();
