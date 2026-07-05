# Puzzle Hub

A static, no-build-step puzzle site for GitHub Pages. Sudoku today, more puzzle types over time.

## Stack

Plain HTML/CSS/JS, ES modules, no framework, no bundler. Deploys straight from the `main` branch root via GitHub Pages (Settings → Pages → Deploy from a branch → `main` / `/root`).

## Structure

```
css/                     Shared design tokens, base styles, header/nav/footer/card/button/modal components
js/common/               Shared, puzzle-agnostic helpers (localStorage wrapper, stopwatch)
js/home.js               Renders the hub's puzzle cards from puzzles/registry.js
puzzles/registry.js       Single source of truth for which puzzles show up on the hub
puzzles/sudoku/           Sudoku's own page, styles, and JS — self-contained
tests/                   Zero-dependency browser test pages (open directly, or serve locally)
```

## Adding a new puzzle type

1. Create `puzzles/<name>/index.html`, `puzzles/<name>/<name>.css`, and `puzzles/<name>/js/*`.
2. Import only from `js/common/` for shared helpers — never reach into another puzzle's folder.
3. Append one entry to `puzzles/registry.js` (`id`, `name`, `path`, `blurb`, `icon`, `available`).

Nothing under `css/`, `js/common/`, `index.html`, or existing puzzle folders needs to change.

## Running locally

Any static file server works, e.g.:

```
python -m http.server 8000
```

Then open `http://localhost:8000/`. Opening `index.html` directly via `file://` mostly works, except pages using `<script type="module">` (Chrome blocks module imports from `file://`) — use a local server for those, including the test pages under `tests/`.

## Sudoku implementation notes

- **Generation**: randomized backtracking fills a full solution; cells are then removed in point-symmetric pairs while a uniqueness check (`countSolutions` with early exit) confirms the puzzle still has exactly one solution. See `puzzles/sudoku/js/core.js` and `difficulty.js`.
- **Difficulty**: mapped to a target clue count (Easy 40 / Medium 32 / Hard 26). Maintaining uniqueness can force the digger to stop a little short of the target on some attempts, so it retries with a fresh random order (up to 30 attempts) and keeps the lowest count reached.
- **Hints/Solve**: read from the solution stored alongside the puzzle — no live re-solving during play.
- **Validation**: pure row/column/box duplicate detection, never compares against the stored solution, so a correct-so-far grid can't be brute-forced cell by cell.
- **Persistence**: `localStorage` under `puzzlehub:sudoku:current`, written on every change and restored on load.
