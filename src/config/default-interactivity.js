/* 
 * @license MPL 2.0
 * Copyright (c) 2026 0Dexz0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. You can read the full license at:
 * http://mozilla.org/MPL/2.0/.
 * Project: https://github.com/0Dex0/SimpleChessBoard
 */

/**
 * @typedef {typeof DEFAULT_INTERACTIVITY} Interactivity
 */

export const DEFAULT_INTERACTIVITY = {
    enabled: true,

    drag: {
        enabled: true,
        trail: {
            enabled: false,
            circle: true
        }
    },

    selection: {
        enabled: true,
        ownPieces: true,
        enemyPieces: true,
    },

    deselection: {
        enabled: true,

        onClick: {
            enabled: true,
            empty: true,
            selectedPiece: true
        },

        onDrop: {
            enabled: false,
            illegalMove: true,
            selectedPiece: false,
        },
    },

    marks: {
        enabled: true,
        squares: true,
        arrows: true
    },

    keyboard: {
        enabled: true,

        navigation: {
            enabled: true,
            undoMove: true,
            redoMove: true,
            undoAllMoves: true,
            redoAllMoves: true
        },

        shortcuts: {
            enabled: true,
            flipBoard: true,
            toggleMarks: true
        }
    }
}