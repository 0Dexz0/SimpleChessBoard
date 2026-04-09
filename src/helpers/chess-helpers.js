/* 
 * @license MPL 2.0
 * Copyright (c) 2026 0Dexz0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. You can read the full license at:
 * http://mozilla.org/MPL/2.0/.
 * Project: https://github.com/0Dex0/SimpleChessBoard
 */

export function makeRandomMove(board) {
    const moves = board.chessLogic.moves({ verbose: true })
    const move = moves[Math.floor(Math.random() * moves.length)]

    if (move) {
        board.executeMove(move.from, move.to, true, move.promotion)
        return true
    } else {
        return false
    }
}

export function switchPlayerColor(board) {
    board.playerColor = board.playerColor === 'b' ? 'w' : 'b'
}

export function enhanceKnightLMove(board, extraTimeX = 0, extraTimeY = -0.1) {
    const knightMoveHandler = ({ pieceElement, move, animated }) => {
        if (move.piece === 'n' && animated) {

            const transitionValue = `
                x calc(var(--piece-animation-x-time) + ${extraTimeX}s) var(--piece-animation-x-type),
                y calc(var(--piece-animation-y-time) + ${extraTimeY}s) var(--piece-animation-y-type),
                opacity var(--piece-animation-opacity-time) var(--piece-animation-opacity-type)
            `;

            pieceElement.style.transition = transitionValue;

            pieceElement.addEventListener('transitionend', () => { pieceElement.style.transition = '' }, { once: true });
        }
    };

    board.on('move:end', knightMoveHandler);
    return () => board.off('move:end', knightMoveHandler);
}