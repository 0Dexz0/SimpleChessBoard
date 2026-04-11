/* 
 * @license MPL 2.0
 * Copyright (c) 2026 0Dexz0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. You can read the full license at:
 * http://mozilla.org/MPL/2.0/.
 * Project: https://github.com/0Dex0/SimpleChessBoard
 */

/**
 * @typedef {Object} ChessMove
 * @property {string} color - 'w' | 'b'
 * @property {string} from - Casilla origen (ej: "e2")
 * @property {string} to - Casilla destino (ej: "e4")
 * @property {string} piece - Tipo de pieza ('p','n','b','r','q','k')
 * @property {string} san - Notación algebraica (ej: "Nf3", "exd5", "O-O")
 * @property {string} [lan] - Long algebraic notation (ej: "e2e4")
 * @property {string} [before] - FEN antes del movimiento
 * @property {string} [after] - FEN después del movimiento
 * @property {string} [captured] - Pieza capturada
 * @property {string} [promotion] - Pieza de promoción ('q','r','b','n')
 * @property {'n'|'b'|'e'|'c'|'k'|'q'} flags 
 * 
 * // Métodos que agrega chess.js
 * @property {() => boolean} isCapture
 * @property {() => boolean} isPromotion
 * @property {() => boolean} isEnPassant
 * @property {() => boolean} isKingsideCastle
 * @property {() => boolean} isQueensideCastle
 */

/**
 * @typedef {{
 *   'selection:change': {
 *     pieceElement: SVGUseElement,
 *     square: string
 *   },
 *   'selection:clear': void,
 *   'drag:start': {
 *     originalPiece: SVGUseElement,
 *     clonePiece: SVGUseElement
 *   },
 *   'drag:end': {
 *     pieceElement: SVGUseElement,
 *     from: string,
 *     to: string
 *   },
 *   'drag:cancel': {
 *     pieceElement: SVGUseElement,
 *     from: string,
 *     to: string
 *   },
 *   'illegal-drop': {
 *     pieceElement: SVGUseElement,
 *     from: string,
 *     to: string
 *   },
 *   'move:end': {
 *       pieceElement: SVGUseElement,
 *       move: ChessMove,
 *       animated: boolean
 *   },
 *   'manual-promote:end': {from: Pos, to: Pos, animated: boolean, promotion: string},
 *   'flip-board:end': {
 *       force?: "w" | "b",
 *       newOrientation: "w" | "b"
 *   },
 *   'undo:end': { move: ChessMove },
 *   'redo:end': { move: ChessMove },
 *   'reset-position:before': { cancel: () => boolean },
 *   'reset-position:end': void,
 *   'undo-all:start': void,
 *   'redo-all:start': void,
 *   'undo-all:end': void,
 *   'redo-all:end': void,
 * }} SimpleChessBoardEventMap
 */

/**
 * @typedef {{
 *   [K in keyof SimpleChessBoardEventMap]?:
 *     ((data: SimpleChessBoardEventMap[K]) => void) |
 *     ((data: SimpleChessBoardEventMap[K]) => void)[]
 * }} SimpleChessBoardListeners
 */

/**
 * @typedef {Object} SimpleChessBoardOptions
 * @property {HTMLElement} container
 * @property {string} [position]
 * @property {"w"|"b"} [playerColor]
 * @property {"w"|"b"} [orientation]
 * @property {string} [piecesPath]
 * @property {import('../config/default-interactivity.js').Interactivity} [interactivity]
 * @property {import('../config/default-style.js').Style} [style]
 * @property {SimpleChessBoardListeners} [$listeners]
 */

/**
 * @typedef {{x: number, y: number}} Coords
 * @typedef {'normal' | 'shift' | 'ctrl' | 'alt' | 'persistent'} MarkType
 * @typedef {string | Coords | SVGUseElement} Pos
 * @typedef {{
 *   color?: string,
 *   opacity?: number,
 *   typeStyle?: MarkType
 * }} MarkOptions
 * @typedef {(type: MarkType, from: Pos, to: Pos, options?: MarkOptions) => void} RenderMarkArrow
 * @typedef {(type: MarkType, pos: Pos, options?: MarkOptions) => void} RenderMarkSquare
 */

/**
 * @typedef {(type?: MarkType) => void} ClearMarks
 * @typedef {(type?: MarkType, pos?: Pos) => void} ClearMarkSquares
 * @typedef {(type?: MarkType, from?: Pos, to?: Pos) => void} ClearMarkArrows
 */

/**
 * @typedef {(from: Pos, to: Pos, animate?: true, promotion?: 'q' | 'r' | 'b' | 'n') => void} ExecuteMove
 */

export { }