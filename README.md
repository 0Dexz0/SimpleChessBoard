# SimpleChessBoard

> **Note from the author:** I don't have much time to maintain this project right now. There may be bugs, rough edges, or things that could be improved — I appreciate PRs to fix issues or add improvements.

SimpleChessBoard is an SVG-based chessboard UI library for the web. It is designed to be easy to integrate and highly configurable. The library delegates chess rules and validation to `chess.js`, while focusing on rendering, interaction, and visualization.

---

## Table of contents

1. [How it works internally (high-level)](#1-how-it-works-internally-high-level)
2. [API (what it provides and how to use it)](#2-api-what-it-provides-and-how-to-use-it)
3. [Default values: interactivity, visual and style](#3-default-values-interactivity-visual-and-style)

---

## 1) How it works internally (high-level)

SimpleChessBoard separates responsibilities so the code stays predictable and easy to reason about:

* **Chess logic:** entirely delegated to `chess.js` (move validation, turn handling, check/mate/draw detection, etc.). SimpleChessBoard does not reimplement the rules of chess.
* **Rendering:** generates an SVG structure that represents the board, pieces and multiple annotation layers (last move, selection, marks, arrows, promotion options, etc.).
* **Interaction:** centralizes user events (click, drag, keyboard, right-click/drag) and translates them into actions against the chess logic (for example: execute a move), updating the SVG accordingly.
* **Layers / overlays:** the board uses separate layers for pieces, legal moves and annotations, allowing visual changes without touching piece state directly.
* **History and navigation:** keeps a move history so the UI supports undo/redo and jump-to-start / jump-to-end navigation.

---

## 2) API (what it provides and how to use it)

### Installation (recommended)

```bash
npm install chess.js
```

> SimpleChessBoard assumes `chess.js` is available in your project.

### Minimal usage example

```html
<div id="board" style="width:400px;height:400px"></div>
<script type="module">
import { SimpleChessBoard } from './SimpleChessBoard.js';

const board = new SimpleChessBoard({
  container: document.getElementById('board'),
});
</script>
```

### Constructor options (summary)

* `container` **(required)**: DOM element where the SVG is mounted.
* `position` *(optional)*: initial FEN string or `'default'`.
* `playerColor` *(optional)*: `'both' | 'w' | 'b'` (determines which color is considered the player's pieces).
* `orientation` *(optional)*: `'w' | 'b'` (initial board orientation).
* `piecesPath`, `soundsPath` *(optional)*: base paths for assets.
* `interactivity`, `visual`, `style` *(optional)*: objects to override defaults (see section 3).
* `handlers` *(optional)*: object with event callbacks (see below).

### Public fields of interest

* `chessLogic` — instance of `chess.js` used internally (read-only usage is fine).
* `orientation` — getter/setter for board orientation.
* `pieceImagesMap` — default mapping from piece codes to asset filenames.

### Public methods (main ones)

* `setPosition(position)` — load a FEN position and reset history/state.
* `flipBoard()` — toggle board orientation.
* `renderRightDragArrow(from, to, type, style)` — draw or toggle an arrow annotation.
* `renderRightClickMark(square, type, style)` — add or toggle a mark on a square.
* `addCustomMark(square, style)` / `removeCustomMark(square)` / `clearCustomMarks()` — manage custom marks.
* `addCustomArrow(from, to, style)` / `removeCustomArrow(from, to)` / `clearCustomArrows()` — manage custom arrows.

> There are additional helper methods for navigation (undo/redo, goToStart/goToEnd) and animation, but the list above covers the most common extension points.

### Handlers / Callbacks

You can pass a `handlers` object when constructing SimpleChessBoard. The library will invoke those callbacks at the appropriate moments.

Common handler names used by the library include:

* `onSquarePointerDown({ square, event })`
* `onMoveStart(from, to, promotion)`
* `onMoveEnd(boardInstance, move)`
* `onCheckmate(move)`
* `onStalemate(move)`
* `onThreefoldRepetition(move)`
* `onInsufficientMaterial(move)`
* `onDraw(move)`
* `onCheck(move)`

#### How to add new handlers inside the code

If you want to add a new handler point inside `SimpleChessBoard.js`, open the file and insert a call like this where you want the event to fire:

```js
this.handlers.exampleHandler?.(/* arguments you want to pass */)
```

Using optional chaining (`?.`) means that **if the user did not provide that handler the call is a no-op** — this keeps performance impact negligible even if the code contains many handler points that are unused.

If you think of a useful handler that would benefit most users, please open a PR suggesting the handler name, the moment it fires, and the arguments it should receive. I will review PRs that propose well-justified events.

---

## 3) Default values: interactivity, visual and style

These are the defaults used when no `interactivity`, `visual` or `style` object is provided in the constructor. You can override any subset; the library merges your object with these defaults.

### DEFAULT_INTERACTIVITY

```json
{
  "enabled": true,
  "drag": true,
  "dragOwnPieces": true,
  "dragEnemyPieces": false,
  "deselectOnEmptyDrop": true,
  "deselectOnSelectedSquareDrop": false,
  "deselectOnEmptyClick": true,
  "selectEnemyPieces": true,
  "keepSelectedOnClick": false,
  "marks": true,
  "arrows": true,
  "keyboardNavigation": true
}
```

### DEFAULT_VISUAL

```json
{
  "showLegalMoves": false,
  "highlightSelectedPieceSquareOwn": true,
  "highlightSelectedPieceSquareEnemy": true,
  "highlightLastMove": true,
  "dragSquareCircle": false
}
```

### DEFAULT_STYLE

```json
{
  "board": { "color1": "#739552", "color2": "#EBECD0" },
  "drag": { "cursor": "grabbing", "opacity_original": 0, "opacity_clone": 1 },
  "piece": { "hover": { "cursor": "grab" } },
  "legalMoves": { "empty": { "radius": 0.17, "color": "#00000024" }, "capture": { "radius": 0.45, "color": "#00000024" } },
  "selectedPieceSquare": { "own": { "color": "rgb(255, 255, 51)", "opacity": 0.5 }, "enemy": { "color": "rgb(255, 255, 51)", "opacity": 0.5 } },
  "lastMove": { "from": { "color": "rgb(255, 255, 51)", "opacity": 0.5 }, "to": { "color": "rgb(255, 255, 51)", "opacity": 0.5 } }
}
```

### Chess Board with DEFAULT_VISUAL and DEFAULT_STYLE

![image alt](https://github.com/0Dexz0/SimpleChessBoard/blob/e888b08fc987a1ef4dd640c56660dae66a6ebc85/Default-Style-Example.png)
---

In the future I may add getter/setter accessors for properties on the `style` object so you don't need to recreate the board to apply style changes. Since the board uses CSS variables for styling, changing a `--variable` to a new value would automatically update the visuals in real time. This is not a high-priority feature (it is uncommon to change a board's style in real time while a game is in progress), but it's something I might implement later.
