/* 
 * @license MPL 2.0
 * Copyright (c) 2026 0Dexz0
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. You can read the full license at:
 * http://mozilla.org/MPL/2.0/.
 * Project: https://github.com/0Dex0/SimpleChessBoard
 */

import '../styles/SimpleChessBoard.css'

import { Chess } from 'chess.js'
import { initInteractivity, initStyle } from '../config/config-merger'
import { PIECE_IMAGE_MAP } from '../config/piece-image-map'
import * as Types from '../types/SimpleChessBoard.types'

import defaultPiecesPath from '../assets/Default-SVG/pieces.svg'


export class SimpleChessBoard {

    //#region Private Properties & Getters/Setters
    #deadPiecesOrder = []
    #markFromSquare = null
    #promotionRequest = null

    #lastPointerMoveEvent

    #selectedPiece = {
        element: null,
        selectionCount: 0,

        drag: {
            isActive: false,
            isReady: false,
            clonePiece: null,
            startPoint: null,
            originalCenter: null,
            lastCoords: null
        }
    }

    #historyState = {
        moves: [],
        currentIndex: -1
    }

    #piecesPath
    set piecesPath(value) { this.setPiecesPath(value) }
    get piecesPath() { return this.#piecesPath }

    #orientation = 'w'
    set orientation(value) { this.flipBoard(value) }
    get orientation() { return this.#orientation }

    #position
    set position(value) { this.setPosition(value) }
    get position() { return this.#position }

    #interactivity
    set interactivity(value) { this.#interactivity = initInteractivity(value) }
    get interactivity() { return this.#interactivity }

    #style
    set style(value) { this.#style = initReactiveStyles(this.svg, initStyle(value)) }
    get style() { return this.#style }
    //#endregion

    //#region Listeners Controll
    #listeners = {}
    /** 
    * @template {keyof Types.SimpleChessBoardEventMap} K
    * @param {K} eventName
    * @param {(data: Types.SimpleChessBoardEventMap[K]) => void} callback
    */
    on(eventName, callback) {
        if (!this.#listeners[eventName]) {
            this.#listeners[eventName] = []
        }
        this.#listeners[eventName].push(callback)
    }

    /**
    * @template {keyof Types.SimpleChessBoardEventMap} K
    * @param {K} eventName
    * @param {(data: Types.SimpleChessBoardEventMap[K]) => void} callback
    */
    off(eventName, callback) {
        if (!eventName) {
            this.#listeners = {}
            return
        }

        if (!this.#listeners[eventName]) return

        if (callback) {
            this.#listeners[eventName] = this.#listeners[eventName].filter(fn => fn !== callback)
        } else {
            this.#listeners[eventName] = []
        }
    }

    /**
    * @template {keyof Types.SimpleChessBoardEventMap} K
    * @param {K} eventName
    * @param {(data: Types.SimpleChessBoardEventMap[K]) => void} callback
    */
    #emit(eventName, data) {
        if (this.#listeners[eventName]) {
            this.#listeners[eventName].forEach(callback => callback(data))
        }
    }
    //#endregion

    /**
    * @param {Types.SimpleChessBoardOptions} options
    */
    constructor({
        container,
        position = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq",
        playerColor = "w",
        orientation = "w",

        piecesPath = defaultPiecesPath,

        interactivity = {},
        style = {},

        $listeners = {}
    }) {
        this.#createBoardSVG(container, piecesPath)
        this.#cacheDOM()

        this.#initConfig(position, playerColor, orientation, piecesPath, interactivity, style)

        this.#bindListeners($listeners)

        this.#initEvents()
    }
    //#endregion

    //#region Init Constructor
    #createBoardSVG(container, piecesPath) {
        container.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" class='simplechessboard' oncontextmenu="return false" tabindex="0">
            
                <defs class="chess-pieces-defs">
                  ${['K', 'Q', 'N', 'R', 'B', 'P', 'k', 'q', 'n', 'r', 'b', 'p'].map(p => `
                    <symbol id="${p}" data-color="${p === p.toUpperCase() ? 'w' : 'b'}">
                      <use href="${piecesPath}#${PIECE_IMAGE_MAP[p]}" width="1" height="1"></use>
                    </symbol>
                  `).join('')}
                </defs>
                
                <path fill="var(--board-color1)" class="board-color1" d="M0 0h8v8H0"/>
                <path fill="var(--board-color2)" shape-rendering="crispEdges" d="M0 0h8v1H0m0 1h8v1H0m0 1h8v1H0m0 1h8v1H0m1-7v8h1V0m1 0v8h1V0m1 0v8h1V0m1 0v8h1V0"/>

                ${["hs-selected-piece", "hs-last-move", "hs-check-king"]
                .map(g => `<g class="${g}"></g>`).join("")}

                <g class="marks-squares">
                    <g class="normal"></g>
                    <g class="shift"></g>
                    <g class="ctrl"></g>
                    <g class="alt"></g>
                    <g class="persistent"></g>
                </g>

                <g class="pieces"></g>

                <g class="legal-moves">
                    <g class="lm-capture">
                        <g class="white"></g>
                        <g class="black"></g>
                    </g>
                    <g class="lm-empty">
                        <g class="white"></g>
                        <g class="black"></g>
                    </g>
                </g>

                <g class="algebraic-notation">
                    <g class="numeral-notation">
                        <g fill=var(--algebraic-color2)>
                            <text x="0.04" y="7.02" style="--y:-7px">1</text>
                            <text x="0.04" y="5.02" style="--y:-3px">3</text>
                            <text x="0.04" y="3.02" style="--y:1px">5</text>
                            <text x="0.04" y="1.02" style="--y:5px">7</text>
                        </g>
                    
                        <g fill=var(--algebraic-color1)>
                            <text x="0.04" y="6.02" style="--y:-5px">2</text>
                            <text x="0.04" y="4.02" style="--y:-1px">4</text>
                            <text x="0.04" y="2.02" style="--y:3px">6</text>
                            <text x="0.04" y="0.02" style="--y:7px">8</text>
                        </g>
                    </g>
                    
                    <g class="letter-notation">
                        <g fill=var(--algebraic-color2)>
                            <text x="0.98" y="8.03" style="--x:7px">a</text>
                            <text x="2.98" y="8.03" style="--x:3px">c</text>
                            <text x="4.98" y="8.03" style="--x:-1px">e</text>
                            <text x="6.99" y="7.98" style="--x:-5px">g</text>
                        </g>
                    
                        <g fill=var(--algebraic-color1)>
                            <text x="1.98" y="8.03" style="--x:5px">b</text>
                            <text x="3.98" y="8.03" style="--x:1px">d</text>
                            <text x="5.97" y="8.03" style="--x:-3px">f</text>
                            <text x="7.98" y="8.03" style="--x:-7px">h</text>
                        </g>
                    </g>
                </g>

                <g class="marks-arrows">
                    <g class="normal"></g>
                    <g class="shift"></g>
                    <g class="ctrl"></g>
                    <g class="alt"></g>
                    <g class="persistent"></g>
                </g>

                <g class="promotion-options">
                    <g class="white">
                      <rect/>
                      ${['Q', 'N', 'R', 'B'].map((p, i) => `
                        <use href="#${PIECE_IMAGE_MAP[p]}"
                             x="0" y="${i}"
                             data-promotion="${p.toLowerCase()}"
                             style="--y:${3 - i}"></use>
                      `).join('')}
                    </g>
                    
                    <g class="black">
                      <rect/>
                      ${['b', 'r', 'n', 'q'].map((p, i) => `
                        <use href="#${PIECE_IMAGE_MAP[p]}"
                             x="0" y="${i}"
                             data-promotion="${p}"
                             style="--y:${3 - i}"></use>
                      `).join('')}
                    </g>
                </g>

                <g class="drag-trails">
                    <g class="circle"></g>
                </g>
            </svg>
        `
        this.container = container
        this.svg = container.firstElementChild
    }

    #cacheDOM() {
        const svg = this.svg
        this.g = {
            pieces: svg.querySelector('.pieces'),
            lm: svg.querySelector('.lm'),
            lmCapture: svg.querySelector('.lm-capture'),
            lmEmpty: svg.querySelector('.lm-empty'),
            hsSelectedPiece: svg.querySelector('.hs-selected-piece'),
            hsLastMove: svg.querySelector('.hs-last-move'),
            promotionOptions: svg.querySelector('.promotion-options'),
            marksSquares: svg.querySelector('.marks-squares'),
            marksArrows: svg.querySelector('.marks-arrows'),
            hsCheckKing: svg.querySelector('.hs-check-king'),
            dragTrails: svg.querySelector('.drag-trails'),
        }
        this.g.dragTrailCircle = this.g.dragTrails.querySelector('.circle')
    }

    #initConfig(position, playerColor, orientation, piecesPath, interactivity, style) {
        this.chessLogic = new Chess()

        this.playerColor = playerColor
        this.piecesPath = piecesPath

        /** @type {import('../config/default-interactivity.js').Interactivity} */
        this.interactivity = interactivity

        /** @type {import('../config/default-style.js').Style} */
        this.style = style

        this.setPosition(position, { throwOnError: true })
        this.orientation = orientation
    }

    #bindListeners($listeners = {}) {
        for (const [eventName, handler] of Object.entries($listeners)) {
            if (Array.isArray(handler)) {
                handler.forEach(fn => this.on(eventName, fn))
            } else if (typeof handler === 'function') {
                this.on(eventName, handler)
            }
        }
    }

    //#region Init Events
    #initEvents() {
        const svg = this.svg
        this.#initPageFocusOutEvent(document)

        this.#initKeyDownEvent(svg)

        this.#initPointerDownEvent(svg)
        this.#initPointerMoveEvent(document)
        this.#initPointerUpEvent(document)
    }

    #initPageFocusOutEvent(target) {
        target.addEventListener('focusout', () => {
            if (this.#selectedPiece.drag.isActive) {
                this.#pointerUpDragController(this.#lastPointerMoveEvent)
            }
        })
    }

    #initKeyDownEvent(target) {
        const runKeyAction = (e, config, key, action) => {
            const canRunAction = config && e.key === key
            canRunAction && action.call(this)
            return canRunAction
        }

        target.addEventListener('keydown', (e) => {
            if (!this.interactivity.enabled) return

            const keyboard = this.interactivity.keyboard
            if (!keyboard.enabled) return

            const navigation = keyboard.navigation
            if (navigation.enabled) {
                if (runKeyAction(e, navigation.undoMove, "ArrowLeft", this.undoMove)) return
                if (runKeyAction(e, navigation.redoMove, "ArrowRight", this.redoMove)) return
                if (runKeyAction(e, navigation.undoAllMoves, "ArrowDown", this.undoAllMoves)) return
                if (runKeyAction(e, navigation.redoAllMoves, "ArrowUp", this.redoAllMoves)) return
            }

            const shortcuts = keyboard.shortcuts
            if (shortcuts.enabled) {
                if (runKeyAction(e, shortcuts.escapeClearSelection, "Escape", this.clearSelection)) return
                if (runKeyAction(e, shortcuts.flipBoard, "f", this.flipBoard)) return
                if (runKeyAction(e, shortcuts.toggleMarks, "m", this.toggleMarks)) return
            }
        })
    }

    #initPointerDownEvent(target) {
        const isRightClick = (e) => e.button === 2
        const isInteractivityEnabled = () => this.interactivity.enabled
        const hasPromotionRequest = () => this.#promotionRequest

        target.addEventListener('pointerdown', (e) => {
            e.preventDefault()
            target.focus()

            if (!isInteractivityEnabled()) return

            const promotionPiece = e.target.closest('[data-promotion]')
            if (promotionPiece) {
                this.#promoteTo(promotionPiece)
                return
            }

            if (hasPromotionRequest()) {
                this.cancelPromotion()
                return
            }

            const { square: clickedSquare } = this.#pointerEventToBoardPos(e)
            if (isRightClick(e)) {
                this.#markFromSquare = clickedSquare
                this.clearSelection()
                return
            }

            this.clearMarks()

            if (this.isLegalMove(clickedSquare)) {
                this.executeMove(this.#selectedPiece.element, clickedSquare)
                return
            }

            if (this.isEmpty(clickedSquare)) {
                this.#pointerDownEmptyController()
                return
            }

            this.#pointerDownPieceController(e, clickedSquare)
        })
    }

    #initPointerMoveEvent(target) {
        const canDrag = () => this.#selectedPiece.element && this.#selectedPiece.drag.isActive

        target.addEventListener('pointermove', (e) => {
            this.#lastPointerMoveEvent = e

            if (canDrag()) {
                this.#pointerMovePieceController(e)
            }
        })
    }

    #initPointerUpEvent(target) {
        const hasMarkFromSquare = () => this.#markFromSquare
        const isDraggingPiece = () => this.#selectedPiece.drag.isActive

        target.addEventListener('pointerup', (e) => {
            if (hasMarkFromSquare()) {
                this.#pointerUpMarkController(e)
            }
            else if (isDraggingPiece()) {
                this.#pointerUpDragController(e)
            }
        })
    }
    //#endregion

    //#endregion

    //#region Pointer Event Controllers

    //#region Pointer Down

    #pointerDownEmptyController() {
        const deselection = this.interactivity.deselection
        const deselectionOnClick = deselection.onClick
        if (deselection.enabled && deselectionOnClick.enabled && deselectionOnClick.empty) {
            this.clearSelection()
        }
    }

    #pointerDownPieceController(e, clickedSquare) {
        const pieceElement = this.getPieceElementFrom(clickedSquare)
        const selectedPieceBeforeChange = this.#selectedPiece.element

        const canSelectedPiece = this.#selectPieceWithPointerDownEvent(e, pieceElement)
        if (!canSelectedPiece) return

        const isNewSelection = selectedPieceBeforeChange !== this.#selectedPiece.element
        if (isNewSelection) {
            this.#emit('selection:change', {
                pieceElement: this.#selectedPiece.element,
                square: this.#selectedPiece.element?.dataset.square
            })

            this.#clearLegalMoves()

            if (this.isMyPiece(clickedSquare)) {
                this.#renderPieceLegalMoves(clickedSquare)
            }
        }
    }

    #selectPieceWithPointerDownEvent(e, piece) {
        const selection = this.interactivity.selection
        if (!selection.enabled) return false

        const isMyPiece = this.isMyPiece(piece)

        //#region Internal functions
        const selectPieceWithPointerEvent = () => {
            if (this.#selectedPiece.element === piece) {
                this.#selectedPiece.selectionCount++
            } else {
                this.#selectedPiece.selectionCount = 1
            }

            this.#selectedPiece.element = piece
            this.#selectedPiece.drag.isActive = true
            this.#selectedPiece.drag.startPoint = {
                x: e.clientX,
                y: e.clientY
            }
        }
        const highlightSquare = () => this.#renderHsSelectedPiece(piece.dataset.square)
        //#endregion

        if (
            (selection.ownPieces && isMyPiece) ||
            (selection.enemyPieces && !isMyPiece)
        ) {
            selectPieceWithPointerEvent()
            highlightSquare()
            return true
        }

        return false
    }
    //#endregion

    //#region Pointer Move
    #pointerMovePieceController(e) {
        if (!this.interactivity.drag.enabled) return

        const drag = this.#selectedPiece.drag
        if (!drag.isReady) {
            const deltaX = e.clientX - drag.startPoint.x
            const deltaY = e.clientY - drag.startPoint.y

            if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) return

            drag.isReady = true

            const piece = this.#selectedPiece.element
            piece.classList.add(
                this.isMyPiece(piece) ? 'own' : 'enemy'
            )

            const clonePiece = piece.cloneNode(true)
            clonePiece.removeAttribute('x')
            clonePiece.removeAttribute('y')

            clonePiece.classList.add('dragging-piece')
            piece.classList.add('dragged-piece')

            drag.clonePiece = clonePiece
            this.svg.append(clonePiece)

            this.#emit('drag:start', {
                originalPiece: piece,
                clonePiece: clonePiece
            })
        }

        const { x, y, floatX, floatY } = this.#pointerEventToBoardPos(e)

        drag.clonePiece.style.translate = `${floatX - 0.5}px ${floatY - 0.5}px`


        const dragTrail = this.interactivity.drag.trail
        if (!dragTrail.enabled || !dragTrail.circle) return

        const coords = { x, y }
        if (SimpleChessBoard.isCoordsOutOfBounds(coords)) {
            this.clearDragTrails()
            return
        }
        if (SimpleChessBoard.areCoordsEqual(coords, drag.lastCoords)) return

        dragTrail.circle && this.#renderDragTrailCircle(coords)

        drag.lastCoords = coords
    }
    //#endregion

    //#region Pointer Up
    #pointerUpDragController(e) {
        const { square: toSquare } = this.#pointerEventToBoardPos(e)
        const selectedPiece = this.#selectedPiece.element
        const fromSquare = selectedPiece?.dataset.square

        const deselection = this.interactivity.deselection
        const onClick = deselection.onClick
        if (deselection.enabled && onClick.enabled && onClick.selectedPiece && selectedPiece.dataset.square === toSquare && this.#selectedPiece.selectionCount === 2) {
            this.#emit('drag:cancel', {
                pieceElement: selectedPiece,
                from: fromSquare,
                to: toSquare,
            })
            this.clearSelection()
            return
        }

        if (!this.interactivity.drag.enabled) return

        if (!this.isLegalMove(toSquare)) {
            this.#illegalDropController(selectedPiece, toSquare)
            this.#emit('drag:cancel', {
                pieceElement: selectedPiece,
                from: fromSquare,
                to: toSquare,
            })
            return
        }

        this.executeMove(selectedPiece, toSquare, false)

        this.#emit('drag:end', {
            pieceElement: selectedPiece,
            from: fromSquare,
            to: toSquare
        })
    }

    #illegalDropController(selectedPiece, toSquare) {
        this.clearDragTrails()

        this.#emit('illegal-drop', {
            pieceElement: selectedPiece,
            from: selectedPiece?.dataset.square,
            to: toSquare
        })

        if (this.isMyPiece(selectedPiece) && !SimpleChessBoard.areSquaresEqual(selectedPiece.dataset.square, toSquare) && this.chessLogic.inCheck()) {
            const kingCoords = this.findKingCoords(this.chessLogic.turn())
            this.#renderHsCheckKing(kingCoords)
        }

        const deselection = this.interactivity.deselection
        const deselectionOnDrop = deselection.onDrop

        if (!deselection.enabled || !deselectionOnDrop.enabled) {
            this.#clearSelectedPieceDrag()
            return
        }

        if (this.getPieceElementFrom(toSquare) === selectedPiece) {
            deselectionOnDrop.selectedPiece
                ? this.clearSelection()
                : this.#clearSelectedPieceDrag()

            return
        }

        if (deselectionOnDrop.illegalMove) {
            this.clearSelection()
            return
        }

        this.#clearSelectedPieceDrag()
        return
    }

    #pointerUpMarkController(e) {
        const fromCoords = this.normalizeToCoords(this.#markFromSquare)
        this.#markFromSquare = null

        const marks = this.interactivity.marks
        if (!marks.enabled || (!marks.squares && !marks.arrows)) return

        const toCoords = this.#pointerEventToBoardPos(e)

        if (SimpleChessBoard.isCoordsOutOfBounds(toCoords)) return

        let type = 'normal'
        if (e.altKey) type = 'alt'
        else if (e.ctrlKey) type = 'ctrl'
        else if (e.shiftKey) type = 'shift'

        if (SimpleChessBoard.areCoordsEqual(fromCoords, toCoords)) {
            marks.squares && this.renderMarkSquare(type, fromCoords)
        } else {
            marks.arrows && this.renderMarkArrow(type, fromCoords, toCoords)
        }

    }
    //#endregion

    //#endregion

    //#region Renders

    #renderHsSelectedPiece(pos) {
        const { x, y } = this.normalizeToCoords(pos)
        this.g.hsSelectedPiece.innerHTML = `
            <rect x="${x}" y="${y}"></rect>
        `
    }

    #renderHsLastMove(from, to) {
        const a = this.normalizeToCoords(from)
        const b = this.normalizeToCoords(to)
        this.g.hsLastMove.innerHTML = `
            <rect x="${a.x}" y="${a.y}"></rect>
            <rect x="${b.x}" y="${b.y}"></rect>
        `
    }

    #renderHsCheckKing(pos) {
        const { x, y } = this.normalizeToCoords(pos)
        this.g.hsCheckKing.insertAdjacentHTML('beforeend', `
            <rect x="${x}" y="${y}"></rect>
        `)

        const rect = this.g.hsCheckKing.lastElementChild
        rect.addEventListener('animationend', () => {
            rect.remove()
        }, { once: true })
    }

    /** @type {Types.RenderMarkSquare} */
    renderMarkSquare(type, pos, options = { typeStyle: '', color: '', opacity: '' }) {
        const { x, y } = this.normalizeToCoords(pos)
        const coordsKey = `${x},${y}`

        const { color, opacity, typeStyle } = options
        const targetGroup = this.g.marksSquares.querySelector(`.${type}`)
        if (!targetGroup) return

        const existingMark = targetGroup.querySelector(`[data-coords="${coordsKey}"]`)

        if (existingMark) {
            existingMark.remove()
            return
        }

        const style = (color || opacity !== undefined || typeStyle)
            ? `
                class="${typeStyle}"
                style="
                ${color ? `fill:${color};` : ''}
                ${opacity !== undefined ? `opacity:${opacity};` : ''}
            "`
            : ''

        targetGroup.insertAdjacentHTML(
            'beforeend',
            `<rect x="${x}" y="${y}" data-coords="${coordsKey}" ${style}/>`
        )
    }

    /** @type {Types.RenderMarkArrow} */
    renderMarkArrow(type, from, to, options = { typeStyle: '', color: '', opacity: '' }) {
        const { x: x1, y: y1 } = this.normalizeToCoords(from)
        const { x: x2, y: y2 } = this.normalizeToCoords(to)
        const coordsKey = `${x1},${y1},${x2},${y2}`

        const targetGroup = this.g.marksArrows.querySelector(`.${type}`)
        if (!targetGroup) return

        const existingMark = targetGroup.querySelector(`[data-coords="${coordsKey}"]`)

        if (existingMark) {
            existingMark.remove()
            return
        }

        const sx = x1 + 0.5
        const sy = y1 + 0.5
        const ex = x2 + 0.5
        const ey = y2 + 0.5

        const dx = ex - sx
        const dy = ey - sy
        const dist = Math.hypot(dx, dy)
        if (dist === 0) return

        const ux = dx / dist
        const uy = dy / dist

        const startOffset = 0.35
        const baseOffset = 0.35
        const halfShaft = 0.1
        const halfTip = 0.25

        const startX = sx + ux * startOffset
        const startY = sy + uy * startOffset
        const baseX = ex - ux * baseOffset
        const baseY = ey - uy * baseOffset

        const px = -uy
        const py = ux

        const pathD =
            `M${startX + px * halfShaft} ${startY + py * halfShaft} ` +
            `L${baseX + px * halfShaft} ${baseY + py * halfShaft} ` +
            `L${baseX + px * halfTip} ${baseY + py * halfTip} ` +
            `L${ex} ${ey} ` +
            `L${baseX - px * halfTip} ${baseY - py * halfTip} ` +
            `L${baseX - px * halfShaft} ${baseY - py * halfShaft} ` +
            `L${startX - px * halfShaft} ${startY - py * halfShaft} Z`

        const { color, opacity, typeStyle } = options
        const style = (color || opacity !== undefined || typeStyle)
            ? `
                class="${typeStyle}"
                style="
                ${color ? `fill:${color};` : ''}
                ${opacity !== undefined ? `opacity:${opacity};` : ''}
            "`
            : ''

        targetGroup.insertAdjacentHTML(
            'beforeend',
            `<path d="${pathD}" data-coords="${coordsKey}" ${style}/>`
        )
    }

    #renderPieceLegalMoves(pos) {
        const moves = this.chessLogic.moves({ square: pos, verbose: true })

        const { empty, capture } = this.style.legalMove

        let lmCaptureHTML = ''
        let lmEmptyHTML = ''

        const uniqueMoves = new Set()

        const createCircle = (x, y, radius, square) => {
            return `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${radius}" data-square="${square}"/>`
        }

        for (const { to } of moves) {
            if (uniqueMoves.has(to)) continue
            uniqueMoves.add(to)

            const { x, y } = this.normalizeToCoords(to)

            this.chessLogic.get(to)
                ? lmCaptureHTML += createCircle(x, y, capture.radius, to)
                : lmEmptyHTML += createCircle(x, y, empty.radius, to)
        }

        this.g.lmCapture.insertAdjacentHTML('beforeend', lmCaptureHTML)
        this.g.lmEmpty.insertAdjacentHTML('beforeend', lmEmptyHTML)
    }

    #renderDragTrailCircle(pos) {
        const { x, y } = this.normalizeToCoords(pos)
        this.g.dragTrailCircle.innerHTML = `
            <circle cx="${x + 0.5}" cy="${y + 0.5}" r="${this.style.dragTrail.circle.radius}"/>
        `
    }
    //#endregion

    //#region Clear Methods

    //#region [Public]
    clearAll() {
        this.#clearSelectedPiece()
        this.#clearLegalMoves()
        this.clearMarks()
        this.cancelPromotion()
        this.#clearHsSelectedPiece()
        this.clearHsLastMove()
        this.clearHistory()
    }

    clearSelection() {
        this.#clearSelectedPiece()
        this.#clearHsSelectedPiece()
        this.#clearLegalMoves()
        this.clearDragTrails()

        this.#emit('selection:clear')
    }

    /** @type {Types.ClearMarks} */
    clearMarks(type) {
        this.clearMarksSquares(type)
        this.clearMarksArrows(type)
    }

    /** @type {Types.ClearMarkSquares} */
    clearMarksSquares(type, pos) {
        this.#clearMarksGroup("square", this.g.marksSquares, type, pos)
    }

    /** @type {Types.ClearMarkArrows} */
    clearMarksArrows(type, from, to) {
        this.#clearMarksGroup("arrow", this.g.marksArrows, type, from, to)
    }

    clearDragTrails() {
        this.g.dragTrailCircle.innerHTML = ''
        this.#selectedPiece.drag.lastCoords = null
    }

    clearHsLastMove() {
        this.g.hsLastMove.innerHTML = ''
    }

    clearHistory() {
        this.#historyState.moves = []
        this.#historyState.currentIndex = -1
    }
    //#endregion

    //#region [Private]
    #clearLegalMoves() {
        this.g.lmCapture.innerHTML = ''
        this.g.lmEmpty.innerHTML = ''
    }

    #clearSelectedPiece() {
        this.#clearSelectedPieceDrag()
        this.#selectedPiece.element = null
        this.#selectedPiece.selectionCount = 0
    }

    #clearSelectedPieceDrag() {
        const piece = this.#selectedPiece.element

        if (piece) {
            piece.classList.remove('dragged-piece')
        }

        const drag = this.#selectedPiece.drag
        drag?.clonePiece?.remove()
        drag.isActive = false
        drag.isReady = false
        drag.startPoint = null
        drag.originalCenter = null
    }

    #clearHsSelectedPiece() {
        if (this.#promotionRequest) return
        this.g.hsSelectedPiece.innerHTML = ''
    }

    #clearMarksGroup(markOption, container, type, from, to) {

        const getKey = () => {
            if (!from) return null

            if (markOption === "square") {
                const { x, y } = this.normalizeToCoords(from)
                return `${x},${y}`
            }

            if (markOption === "arrow") {
                from = this.normalizeToCoords(from)
                to = this.normalizeToCoords(to)

                return `${from.x},${from.y},${to.x},${to.y}`
            }
        }

        const key = getKey()

        if (type) {
            const group = container.querySelector(`.${type}`)
            if (!group) return

            if (!key) {
                group.innerHTML = ''
            } else {
                const el = group.querySelector(`[data-coords="${key}"]`)
                el && el.remove()
            }
            return
        }

        for (const group of container.children) {
            if (group.classList.contains('persistent')) continue

            if (!key) {
                group.innerHTML = ''
            } else {
                const el = group.querySelector(`[data-coords="${key}"]`)
                el && el.remove()
            }
        }
    }
    //#endregion

    //#endregion

    //#region Piece Element Methods

    //#region Getters
    /** 
    * @param {Types.Pos} pos 
    * @returns {SVGUseElement}
    */
    getPieceElementFrom(pos) {
        const square = this.normalizeToSquare(pos)
        return this.g.pieces.querySelector(`[data-square="${square}"]:not([data-dead="true"])`)
    }

    /** @returns {SVGUseElement | undefined} */
    getLastDeadPieceElement() {
        return this.#deadPiecesOrder.at(-1)
    }
    //#endregion

    /** @param {Types.Pos} pos */
    selectPiece(pos, { clearMarks = false } = {}) {
        const piece = this.getPieceElementFrom(pos)
        if (!piece) return false

        clearMarks && this.clearMarks()

        this.clearSelection()

        this.#selectedPiece.element = piece
        this.#selectedPiece.selectionCount = 1

        this.#renderHsSelectedPiece(piece.dataset.square)

        if (this.isMyPiece(piece)) {
            this.#renderPieceLegalMoves(piece.dataset.square)
        }

        return true
    }

    //#region Kill / Revive
    #reviveLastPieceElement(animate = true) {
        const piece = this.getLastDeadPieceElement()
        if (!piece) return
        piece.dataset.dead = false
        piece.style.cursor = ''
        piece.style.opacity = '1'
        this.#deadPiecesOrder.pop()

        if (!animate) {
            this.#skipPieceElementAnimation(piece)
        }
    }

    #killPieceElementFromSquare(square, animate = true) {
        const piece = this.getPieceElementFrom(square)
        if (!piece) return
        piece.dataset.dead = true
        piece.style.cursor = 'auto'
        piece.style.opacity = '0'
        this.#deadPiecesOrder.push(piece)

        if (!animate) {
            this.#skipPieceElementAnimation(piece)
        }
    }
    //#endregion

    //#endregion

    //#region Board Refresh
    #updateHsLastMove() {
        const { moves, currentIndex } = this.#historyState
        if (currentIndex <= -1) {
            this.g.hsLastMove.innerHTML = ''
            return
        }

        const move = moves[currentIndex]
        this.#renderHsLastMove(
            this.normalizeToCoords(move.from),
            this.normalizeToCoords(move.to)
        )
    }

    #updateBoardPieces() {
        const FEN = this.chessLogic.fen()
        const boardFEN = FEN.split(' ')[0]

        const pieces = this.g.pieces
        pieces.innerHTML = ''
        let x = 0, y = 0
        for (let char of boardFEN) {
            if (char === '/') { y++; x = 0; continue }
            if (Number(char)) { x += Number(char); continue }

            const square = String.fromCharCode(97 + x) + (8 - y)
            const color = char === char.toUpperCase() ? 'w' : 'b'
            pieces.insertAdjacentHTML('beforeend',
                `<use href="#${char}" 
                    x="${x}" y="${y}" 
                    data-square="${square}"
                    data-color="${color}"
                >`
            )
            x++
        }
    }
    //#endregion

    //#region Board State Modifiers
    setPiecesPath(newPath) {
        this.#piecesPath = newPath

        const defs = this.svg.querySelector('.chess-pieces-defs')
        for (const symbol of defs.children) {
            const useEl = symbol.querySelector('use')
            const frag = useEl.getAttribute('href').split('#')[1]
            useEl.setAttribute('href', `${newPath}#${frag}`)
        }
    }

    setPosition(FEN, { throwOnError = false } = {}) {
        try {
            this.chessLogic.load(FEN)
            this.#position = FEN
            this.clearAll()
            this.#updateBoardPieces()
            return true
        } catch (e) {
            if (throwOnError) throw e
            return false
        }
    }

    setPlayerColor(color) {
        this.playerColor = color
    }

    resetPosition() {
        let canceled = false

        this.#emit('reset-position:before', { cancel: () => canceled = true })

        if (canceled) return

        this.setPosition(this.#position)
        this.#emit('reset-position:end')
    }
    //#endregion

    //#region Piece Movement & Animation
    #skipPieceElementAnimation(piece) {
        piece.style.transitionDuration = '0s'
        piece.getBoundingClientRect()
        piece.style.transitionDuration = ''
    }

    /** @type {Types.ExecuteMove} */
    executeMove(from, to, animate = true, promotion = null) {
        const fromSquare = this.normalizeToSquare(from)
        const toSquare = this.normalizeToSquare(to)

        if (!fromSquare || !toSquare) throw new Error("invalid Movement To Execute")

        this.clearSelection()
        this.clearMarks()

        if (this.#isPromotionMove(fromSquare, toSquare)) {
            if (promotion) {
                this.#promotionRequest = null
                this.#commitMove(fromSquare, toSquare, animate, promotion)
                this.#updateHsLastMove()
                return
            }

            this.#promotionRequest = { from, to, animate }
            this.#showPromotionOptions(toSquare)
            return
        }

        this.#commitMove(fromSquare, toSquare, animate)
        this.#updateHsLastMove()
    }

    #commitMove(fromSquare, toSquare, animate = true, promotion) {
        this.#hidePromotionOptions()

        const pieceElement = this.getPieceElementFrom(fromSquare)
        const move = this.chessLogic.move({ from: fromSquare, to: toSquare, promotion })

        //#region Internal Functions
        const updateHistoryState = () => {
            const historyState = this.#historyState
            const moves = historyState.moves
            let currentIndex = historyState.currentIndex

            if (currentIndex >= moves.length - 1) {
                moves.push(move)
            }

            else if (moves[currentIndex + 1]?.after !== move.after) {
                moves.splice(currentIndex + 1)
                moves.push(move)
            }

            historyState.currentIndex++
        }

        const maybeCapture = () => {
            if (move.isCapture()) {
                this.#killPieceElementFromSquare(move.to, animate)
            } else if (move.isEnPassant()) {
                this.#killPieceElementFromSquare(move.to[0] + (parseInt(move.to[1]) + (move.color === 'w' ? -1 : 1)), animate)
            }
        }

        const maybePromotion = () => {
            const promotionValue = move.promotion
            if (!promotionValue) return

            const promotionColor = move.color === 'w' ? promotionValue.toUpperCase() : promotionValue
            pieceElement.setAttribute('href', `#${PIECE_IMAGE_MAP[promotionColor]}`)
        }
        //#endregion

        updateHistoryState()
        maybePromotion()
        maybeCapture()
        this.#maybeCastling(move, animate)

        this.#movePieceElementTo(pieceElement, move.to, animate)

        this.#emit('move:end', {
            pieceElement,
            move,
            animated: animate
        })
    }

    #movePieceElementTo(pieceElement, to, animate = true) {
        /*
            Why do we get the oriented coords here and not when we are render squares and circles?
            !¡ Because that is as the gods will ¡!

            A riddle... if you can.
            * Some read the scenario. Others live it.
            * The map is not the territory.
            
            Still lost? This one is easy.
            * When the board flips, ask yourself: who moves and who is moved?
        */
        const toCoords = this.getOrientedCoords(this.normalizeToCoords(to))
        const square = this.normalizeToSquare(to)

        this.#setPieceElementCoords(pieceElement, toCoords)
        pieceElement.dataset.square = square

        if (!animate) {
            this.#skipPieceElementAnimation(pieceElement)
        }
    }

    #setPieceElementCoords(piece, { x, y }) {
        piece.setAttribute('x', x)
        piece.setAttribute('y', y)
    }

    #maybeCastling(move, animate = true, reverse = false) {
        if (!move.isKingsideCastle() && !move.isQueensideCastle()) return

        const kingSquare = reverse ? move.to : move.from
        const rank = kingSquare[1]
        const kingFile = kingSquare.charCodeAt(0)

        let rookFromFile, rookToFile

        if (move.isKingsideCastle()) {
            rookFromFile = reverse ? kingFile - 1 : kingFile + 3
            rookToFile = reverse ? kingFile + 1 : kingFile + 1
        } else {
            rookFromFile = reverse ? kingFile + 1 : kingFile - 4
            rookToFile = reverse ? kingFile - 2 : kingFile - 1
        }

        const fromRookCastle = String.fromCharCode(rookFromFile) + rank
        const toRookCastle = String.fromCharCode(rookToFile) + rank

        const rook = this.getPieceElementFrom(fromRookCastle)
        if (!rook) return

        this.#movePieceElementTo(rook, toRookCastle, animate)
    }
    //#endregion

    //#region Promotion
    #promoteTo(promotionPiece) {
        const { from, to, animate } = this.#promotionRequest
        const promotion = promotionPiece.dataset.promotion

        this.#hidePromotionOptions()
        this.#promotionRequest = null

        this.executeMove(from, to, animate, promotion)
        this.#emit('manual-promote:end', { from, to, animated: animate, promotion })
    }

    #showPromotionOptions(toSquare) {
        const { x, y } = this.normalizeToCoords(toSquare)

        const white = this.g.promotionOptions.firstElementChild
        const black = this.g.promotionOptions.lastElementChild

        const isWhite = toSquare[1] === '8'
        white.style.display = isWhite ? 'block' : 'none'
        black.style.display = isWhite ? 'none' : 'block'

        isWhite
            ? white.setAttribute('transform', `translate(${x} ${y})`)
            : black.setAttribute('transform', `translate(${x} ${y - 3})`)
    }

    cancelPromotion() {
        this.#hidePromotionOptions()
        this.#promotionRequest = null
        this.clearSelection()
        this.clearMarks()
    }

    #hidePromotionOptions() {
        this.g.promotionOptions.querySelector('.white').style.display = 'none'
        this.g.promotionOptions.querySelector('.black').style.display = 'none'
    }

    #isPromotionMove(fromSquare, toSquare) {
        const boardPiece = this.chessLogic.get(fromSquare)
        if (boardPiece?.type !== 'p') return false

        return (
            (boardPiece.color === 'w' && toSquare[1] === '8') ||
            (boardPiece.color === 'b' && toSquare[1] === '1')
        )
    }
    //#endregion

    //#region Board UI Controls
    /** @param {'w' | 'b'} [force] */
    flipBoard(force) {
        const flipPieces = () => {
            for (const piece of this.g.pieces.children) {
                let x = parseInt(piece.getAttribute('x'))
                let y = parseInt(piece.getAttribute('y'))

                const newX = 7 - x
                const newY = 7 - y

                piece.setAttribute('x', newX)
                piece.setAttribute('y', newY)
            }
        }

        if (force) {
            if (this.orientation === force) return
            this.#orientation = force
            this.svg.classList.toggle('flip-board')
            flipPieces()
            this.#emit('flip-board:end', { force, newOrientation: this.#orientation })
            return
        }

        this.#orientation = this.orientation === 'b' ? 'w' : 'b'
        this.svg.classList.toggle('flip-board')

        flipPieces()
        this.#emit('flip-board:end', { force, newOrientation: this.#orientation })
    }

    toggleMarks() {
        this.g.marksSquares.style.display = this.g.marksSquares.style.display === 'none' ? '' : 'none'
        this.g.marksArrows.style.display = this.g.marksArrows.style.display === 'none' ? '' : 'none'
    }
    //#endregion

    //#region Find
    findKingCoords(color) {
        const fen = this.chessLogic.fen().split(' ')[0]

        let x = 0
        let y = 0

        for (const char of fen) {
            if (char === '/') {
                y++
                x = 0
                continue
            }

            if (!isNaN(char)) {
                x += Number(char)
                continue
            }

            const isKing =
                (color === 'w' && char === 'K') ||
                (color === 'b' && char === 'k')

            if (isKing) {
                return { x, y }
            }

            x++
        }

        return null
    }
    //#endregion

    //#region Static Utils
    static isCoordsOutOfBounds({ x, y }) {
        return x < 0 || x > 7 || y < 0 || y > 7
    }

    static areSquaresEqual(square1, square2) {
        return square1 === square2
    }

    static areCoordsEqual(a, b) {
        return a?.x === b?.x && a?.y === b?.y
    }
    //#endregion

    //#region Instance Utils
    /** 
    * @param {Types.Coords} coords 
    * @returns {Types.Coords}
    */
    getOrientedCoords({ x, y }) {
        const flip = this.orientation === 'b'
        return {
            x: flip ? 7 - x : x,
            y: flip ? 7 - y : y
        }
    }

    #pointerEventToBoardPos(event) {
        const rect = this.svg.getBoundingClientRect()

        const floatX = (event.clientX - rect.left) / rect.width * 8
        const floatY = (event.clientY - rect.top) / rect.height * 8
        const { x, y } = this.getOrientedCoords({
            x: Math.floor(floatX),
            y: Math.floor(floatY)
        })

        return { x, y, floatX, floatY, square: this.normalizeToSquare({ x, y }) }
    }

    /** @param {Types.Pos} pos */
    isLegalMove(pos) {
        const square = this.normalizeToSquare(pos)
        return Boolean(
            this.g.lmCapture.querySelector(`[data-square="${square}"]`) ||
            this.g.lmEmpty.querySelector(`[data-square="${square}"]`)
        )
    }

    /** @param {Types.Pos} pos */
    isEmpty(pos) {
        return !this.chessLogic.get(this.normalizeToSquare(pos))
    }

    isMyTurn() {
        return this.playerColor === this.chessLogic.turn()
    }

    /** @param {Types.Pos} pos */
    isMyPiece(pos) {
        return this.playerColor === this.chessLogic.get(this.normalizeToSquare(pos))?.color
    }

    /** @param {Types.Pos} input */
    normalizeToCoords(input) {
        if (typeof input === 'string') return this.#squareToCoords(input)
        if (input instanceof SVGUseElement) return this.#squareToCoords(input.dataset.square)
        if (input && typeof input === 'object' && 'x' in input && 'y' in input) return input
        return null
    }

    /** @param {Types.Pos} input */
    normalizeToSquare(input) {
        if (typeof input === 'string') return input
        if (input instanceof SVGUseElement) return input.dataset.square
        if (input && typeof input === 'object' && 'x' in input && 'y' in input) return this.#coordsToSquare(input)
        return null
    }

    #coordsToSquare({ x, y }) {
        return String.fromCharCode(97 + x) + (8 - y)
    }

    #squareToCoords(square) {
        return {
            x: square.charCodeAt(0) - "a".charCodeAt(0),
            y: 8 - square[1]
        }
    }
    //#endregion

    //#region Navigation
    undoAllMoves() {
        while (this.#historyState.currentIndex >= 0) {
            this.undoMove()
        }
        this.#emit('undo-all:end')
    }

    redoAllMoves() {
        while (this.#historyState.currentIndex < this.#historyState.moves.length - 1) {
            this.redoMove()
        }
        this.#emit('redo-all:end')
    }

    redoMove() {
        const { moves, currentIndex } = this.#historyState
        if (currentIndex >= moves.length - 1) return

        const nextMove = moves[currentIndex + 1]
        this.clearMarks()
        this.clearSelection()

        const promotionValue = nextMove.promotion
        this.#commitMove(nextMove.from, nextMove.to, true, promotionValue)
        this.#updateHsLastMove()
        this.#emit('redo:end', { move: nextMove })
    }

    undoMove() {
        const { moves } = this.#historyState
        if (this.#historyState.currentIndex < 0) return

        this.clearMarks()
        this.clearSelection()

        const lastMove = moves[this.#historyState.currentIndex--]
        const movingPiece = this.getPieceElementFrom(lastMove.to)

        this.chessLogic.undo()

        if (lastMove.promotion) {
            const pawnColor = lastMove.color === 'w' ? 'P' : 'p'
            movingPiece.setAttribute('href', `#${PIECE_IMAGE_MAP[pawnColor]}`)
        }

        this.#movePieceElementTo(movingPiece, lastMove.from)

        if (lastMove.isCapture() || lastMove.isEnPassant()) {
            this.#reviveLastPieceElement()
        }

        this.#maybeCastling(lastMove, true, true)
        this.#updateHsLastMove()

        this.#promotionRequest && this.cancelPromotion()
        this.#emit('undo:end', { move: lastMove })
    }
    //#endregion
}



function initReactiveStyles(element, styleObj) {
    const isObj = v => v && typeof v === "object"

    const toVar = path => `--${path.join("-")}`

    function setVars(obj, path = []) {
        for (const [key, value] of Object.entries(obj)) {
            const next = [...path, key]
            if (isObj(value)) {
                setVars(value, next)
            } else {
                element.style.setProperty(toVar(next), value)
            }
        }
    }

    const createReactive = (obj, path = []) => {
        return new Proxy(obj, {
            get(target, key) {
                const value = target[key]
                return isObj(value) ? createReactive(value, [...path, key]) : value
            },
            set(target, key, value) {
                target[key] = value
                setVars({ [key]: value }, path)
                return true
            }
        })
    }

    setVars(styleObj)
    return createReactive(styleObj)
}