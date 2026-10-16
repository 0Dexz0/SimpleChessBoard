/* 
 * @license MPL 2.0
 * Copyright (c) 2026 0Dexz0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. You can read the full license at:
 * http://mozilla.org/MPL/2.0/.
 * Project: https://github.com/0Dex0/SimpleChessBoard
 */

/** @typedef {import('chess.js').Move} ChessMove */

//#region Core
/**
 * @typedef {{x: number, y: number}} Coords
 * @typedef {'normal' | 'shift' | 'ctrl' | 'alt' | 'persistent'} MarkType
 * @typedef {string | Coords | SVGUseElement} Pos
 * @typedef {'replace' | 'overlap'} MarkGroupMode
 * @typedef {{
 *   color?: string,
 *   opacity?: number | string,
 *   typeStyle?: string
 * }} MarkStyle
 * @typedef {MarkStyle} MarkOptions
 * @typedef {MarkStyle & { width?: number }} ArrowStyle
 * @typedef {{ layer?: number }} MarkGroupOptions
 * @typedef {MarkGroupMode | (MarkGroupOptions & { mode: MarkGroupMode })} MarkGroupConfig
 * @typedef {Record<string, MarkGroupConfig>} MarkGroupsConfig
 * @typedef {(type: MarkType, from: Pos, to: Pos, style?: ArrowStyle | null, group?: string | null) => SVGPathElement | null} RenderMarkArrow
 * @typedef {(type: MarkType, pos: Pos, style?: MarkStyle | null, group?: string | null) => SVGRectElement | null} RenderMarkSquare
 * @typedef {(mark: SVGElement) => boolean} RemoveMark
 * @typedef {(name: string, mode: MarkGroupMode, options?: MarkGroupOptions | null) => boolean} CreateGroupMarks
 * @typedef {(name: string) => boolean} DeleteGroupMarks
 * @typedef {(type?: MarkType) => void} ClearMarks
 * @typedef {(type?: MarkType, pos?: Pos) => void} ClearMarkSquares
 * @typedef {(type?: MarkType, from?: Pos, to?: Pos) => void} ClearMarkArrows
 * @typedef {(group: string, type?: MarkType, pos?: Pos) => void} ClearGroupMarkSquares
 * @typedef {(group: string, type?: MarkType, from?: Pos, to?: Pos) => void} ClearGroupMarkArrows
 * @typedef {(from: Pos, to: Pos, animate?: boolean, promotion?: 'q' | 'r' | 'b' | 'n') => void} ExecuteMove
 */
//#endregion


//#region Interactivity
/**
 * @typedef {{
 *      enabled?: boolean,
 *      drag?: {
 *          enabled?: boolean,
 *          trail?: {
 *              enabled?: boolean,
 *              circle?: boolean
 *          }
 *      },
 *      selection?: {
 *          enabled?: boolean,
 *          ownPieces?: boolean,
 *          enemyPieces?: boolean
 *      },
 *      deselection?: {
 *          enabled?: boolean,
 *          onClick?: {
 *              enabled?: boolean,
 *              empty?: boolean,
 *              selectedPiece?: boolean
 *          },
 *          onDrop?: {
 *              enabled?: boolean,
 *              illegalMove?: boolean,
 *              selectedPiece?: boolean
 *          }
 *      },
 *      marks?: {
 *          enabled?: boolean,
 *          squares?: boolean,
 *          arrows?: boolean
 *      },
 *      keyboard?: {
 *          enabled?: boolean,
 *          navigation?: {
 *              enabled?: boolean,
 *              undoMove?: boolean,
 *              redoMove?: boolean,
 *              undoAllMoves?: boolean,
 *              redoAllMoves?: boolean
 *          },
 *          shortcuts?: {
 *              enabled?: boolean,
 *              flipBoard?: boolean,
 *              toggleMarks?: boolean
 *          }
 *      }
 * }} Interactivity
 */
//#endregion


//#region Style
/**
 * @typedef {{
 *      board?: {
 *          color1?: string,
 *          color2?: string
 *      },
 *      dragPiece?: {
 *          cursor?: string,
 *          original?: {
 *              opacity?: number
 *          },
 *          clone?: {
 *              opacity?: number,
 *              scale?: number,
 *              deltaPosition?: {
 *                  x?: number,
 *                  y?: number
 *              }
 *          }
 *      },
 *      dragTrail?: {
 *          circle?: {
 *              radius?: number,
 *              color?: string,
 *              opacity?: number
 *          }
 *      },
 *      piece?: {
 *          cursor?: string,
 *          animation?: {
 *              x?: { time?: string, type?: string },
 *              y?: { time?: string, type?: string },
 *              opacity?: { time?: string, type?: string }
 *          }
 *      },
 *      legalMove?: {
 *          empty?: { radius?: number, color?: string, opacity?: number },
 *          capture?: { radius?: number, color?: string, opacity?: number }
 *      },
 *      highlightSquare?: {
 *          selectedPiece?: { color?: string, opacity?: number },
 *          lastMove?: {
 *              from?: { color?: string, opacity?: number },
 *              to?: { color?: string, opacity?: number }
 *          },
 *          checkKing?: { color?: string, opacity?: number }
 *      },
 *      marks?: {
 *          squares?: {
 *              normal?: { color?: string, opacity?: string | number },
 *              shift?: { color?: string, opacity?: string | number },
 *              ctrl?: { color?: string, opacity?: string | number },
 *              alt?: { color?: string, opacity?: string | number }
 *          },
 *          arrows?: {
 *              normal?: { color?: string, opacity?: string | number },
 *              shift?: { color?: string, opacity?: string | number },
 *              ctrl?: { color?: string, opacity?: string | number },
 *              alt?: { color?: string, opacity?: string | number }
 *          }
 *      }
 * }} Style
 */

export { }
//#endregion


//#region Listeners
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

export { }
//#endregion

/**
 * @typedef {Object} SimpleChessBoardOptions
 * @property {HTMLElement} container
 * @property {string} [position]
 * @property {"w"|"b"} [playerColor]
 * @property {"w"|"b"} [orientation]
 * @property {string} [piecesPath]
 * @property {Interactivity} [interactivity]
 * @property {Style} [style]
 * @property {MarkGroupsConfig} [markGroups]
 * @property {SimpleChessBoardListeners} [$listeners]
 */

export { }