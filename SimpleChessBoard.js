import { Chess } from './node_modules/chess.js/dist/esm/chess.js'

export const DEFAULT_STYLE = {
    board: {
        color1: "#739552",
        color2: "#EBECD0"
    },
    drag: {
        cursor: "grabbing",
        opacity_original: 0,
        opacity_clone: 1
    },
    piece: {
        hover: {
            cursor: "grab"
        },
    },
    legalMoves: {
        empty: { radius: 0.17, color: "#00000024" },
        capture: { radius: 0.45, color: "#00000024" }
    },
    selectedPieceSquare: {
        own: { color: "rgb(255, 255, 51)", opacity: 0.5 },
        enemy: { color: "rgb(255, 255, 51)", opacity: 0.5 }
    },
    lastMove: {
        from: { color: "rgb(255, 255, 51)", opacity: 0.5 },
        to: { color: "rgb(255, 255, 51)", opacity: 0.5 }
    }
}

export const DEFAULT_INTERACTIVITY = {
    enabled: true,

    drag: true,
    dragOwnPieces: true,
    dragEnemyPieces: false,

    deselectOnEmptyDrop: true,
    deselectOnSelectedSquareDrop: false,
    deselectOnEmptyClick: true,

    selectEnemyPieces: true,
    keepSelectedOnClick: false,

    marks: true,
    arrows: true,

    keyboardNavigation: true
}

export const DEFAULT_VISUAL = {
    showLegalMoves: false,

    highlightSelectedPieceSquareOwn: true,
    highlightSelectedPieceSquareEnemy: true,

    highlightLastMove: true,

    dragSquareCircle: false
}


export class SimpleChessBoard {
    pieceImagesMap = {
        'p': 'b-pawn.svg', 'r': 'b-rook.svg', 'n': 'b-knight.svg',
        'b': 'b-bishop.svg', 'q': 'b-queen.svg', 'k': 'b-king.svg',
        'P': 'w-pawn.svg', 'R': 'w-rook.svg', 'N': 'w-knight.svg',
        'B': 'w-bishop.svg', 'Q': 'w-queen.svg', 'K': 'w-king.svg'
    }

    // Overlays
    #svg = null
    #rectsOverlay = null
    #selectedPieceSquareOverlay = null
    #lastMoveOverlay = null
    #checkKingOverlay = null

    #rcOverlay = null
    #rcNormalOverlay = null
    #rcShiftOverlay = null
    #rcCtrlOverlay = null
    #rcAltOverlay = null
    #rcCustomOverlay = null

    #rdOverlay = null
    #rdNormalOverlay = null
    #rdShiftOverlay = null
    #rdCtrlOverlay = null
    #rdAltOverlay = null
    #rdCustomOverlay = null

    #legalMovesOverlay = null
    #lgCaptureOverlay = null
    #lgNormalOverlay = null

    #piecesOverlay = null
    #promotionOptionsOverlay = null


    #selectedSquare = null
    #draggingPiece = null
    #immuneFirstPointerUp = true
    #squarePromotion = false
    #dragSquareOverlay = null

    chessLogic = new Chess()

    #history = []
    #currentMoveIndex = -1
    #initialPosition = null

    #cancelPointerUp = false
    #rightClickFromSquare = null
    handlers = {}

    #clickPixels = {}
    #alreadyMoveClickPixels = false

    // SETTER y GETTERS
    #orientation = 'w'

    set orientation(value) {
        this.#orientation = value
        this.#svg.classList.toggle('flip-board', value === 'b')
    }

    get orientation() {
        return this.#orientation
    }


    constructor({ container, position = null, playerColor = 'both', orientation = 'w',
        piecesPath = 'assets/pieces/',
        soundsPath = 'assets/sounds/',

        interactivity: interactivity = {
            enabled: true,
            drag: true,
            dragOwnPieces: true,
            dragEnemyPieces: false,
            deselectOnEmptyDrop: true,
            deselectOnSelectedSquareDrop: false,
            deselectOnEmptyClick: true,
            selectEnemyPieces: true,
            keepSelectedOnClick: false,

            marks: true,
            arrows: true,

            keyboardNavigation: true
        },

        visual: visual = {
            showLegalMoves: false,
            highlightSelectedPieceSquareOwn: true,
            highlightSelectedPieceSquareEnemy: true,
            highlightLastMove: true,
            dragSquareCircle: true
        },

        style = DEFAULT_STYLE,

        handlers = {}
    } = {}
    ) {
        this.container = container

        container.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" class='simplechessboard' oncontextmenu="return false">
            <!-- fondo / tablero original -->
            <path fill="var(--board-color-1)" class="board-color-1" d="M0 0h8v8H0"/>
            <path fill="var(--board-color-2)" shape-rendering="crispEdges" d="M0 0h8v1H0m0 1h8v1H0m0 1h8v1H0m0 1h8v1H0m1-7v8h1V0m1 0v8h1V0m1 0v8h1V0m1 0v8h1V0"/>

            <g class="rects">
                <g class="selected-piece-square"></g>
                <g class="last-move"></g>
                <g class="check-king"></g>
                <g class="marks">
                    <g fill="rgb(235, 97, 80)" opacity="0.8"></g>
                    <g fill="rgb(172, 206, 89)" opacity="0.8"></g>
                    <g fill="rgb(255, 170, 0)" opacity="0.8"></g>
                    <g fill="rgb(82, 176, 220)" opacity="0.8"></g>
                    <g></g>
                </g>
            </g>
            <g class="legal-moves">
                <g class="lm-capture"></g>
                <g class="lm-normal"></g>
            </g>
            <g class="pieces"></g>

            <g class="algebraic-notation">
                <g class="numeral-notation">
                    <g fill=var(--algebraic-color-2)>
                        <text x="0.04" y="7.02" style="--y:-7px">1</text>
                        <text x="0.04" y="5.02" style="--y:-3px">3</text>
                        <text x="0.04" y="3.02" style="--y:1px">5</text>
                        <text x="0.04" y="1.02" style="--y:5px">7</text>
                    </g>

                    <g fill=var(--algebraic-color-1>
                        <text x="0.04" y="6.02" style="--y:-5px">2</text>
                        <text x="0.04" y="4.02" style="--y:-1px">4</text>
                        <text x="0.04" y="2.02" style="--y:3px">6</text>
                        <text x="0.04" y="0.02" style="--y:7px">8</text>
                    </g>
                </g>

                <g class="letter-notation">
                    <g fill=var(--algebraic-color-2>
                        <text x="0.98" y="8.03" style="--x:7px">a</text>
                        <text x="2.98" y="8.03" style="--x:3px">c</text>
                        <text x="4.98" y="8.03" style="--x:-1px">e</text>
                        <text x="6.99" y="7.98" style="--x:-5px">g</text>
                    </g>

                    <g fill=var(--algebraic-color-1>
                        <text x="1.98" y="8.03" style="--x:5px">b</text>
                        <text x="3.98" y="8.03" style="--x:1px">d</text>
                        <text x="5.97" y="8.03" style="--x:-3px">f</text>
                        <text x="7.98" y="8.03" style="--x:-7px">h</text>
                    </g>
                </g>
            </g>

            <g class="arrows">
                <g fill="rgba(255, 170, 0, 0.8)" opacity="0.8"></g>
                <g fill="rgba(159, 207, 63, 0.8)" opacity="0.8"></g>
                <g fill="rgba(248, 85, 63, 0.8)" opacity="0.8"></g>
                <g fill="rgba(72, 193, 249, 0.8)" opacity="0.8"></g>
                <g></g>
            </g>

            <g class="promotion-options"></g>

            <g class="drag-square" style="display:none"><circle r="1" fill="#00000033"/></g>
        </svg>`

        this.#svg = container.firstElementChild
        this.#svg.setAttribute('tabindex', '0')
        this.style = SimpleChessBoard.#initStyle(style)

        this.#svg.style.cssText = `
            /* BOARD */
            --board-color-1: ${this.style.board.color1};
            --board-color-2: ${this.style.board.color2};

            /* ABOUT PIECES */
            --drag-cursor: ${this.style.drag.cursor};
            --drag-opacity-original: ${this.style.drag.opacity_original};
            --piece-hover-cursor: ${this.style.piece.hover.cursor};

            /* LEGAL MOVES */
            --legal-move-capture-color: ${this.style.legalMoves.capture.color};
            --legal-move-empty-color: ${this.style.legalMoves.empty.color};

            /* SELECTED PIECE SQUARE */
            --selected-piece-square-own-color: ${this.style.selectedPieceSquare.own.color};
            --selected-piece-square-own-opacity: ${this.style.selectedPieceSquare.own.opacity};
            --selected-piece-square-enemy-color: ${this.style.selectedPieceSquare.enemy.color};
            --selected-piece-square-enemy-opacity: ${this.style.selectedPieceSquare.enemy.opacity};

            /* LAST MOVE */
            --last-move-from-color: ${this.style.lastMove.from.color};
            --last-move-from-opacity: ${this.style.lastMove.from.opacity};
            --last-move-to-color: ${this.style.lastMove.to.color};
            --last-move-to-opacity: ${this.style.lastMove.to.opacity};
        `

        this.piecesPath = piecesPath
        this.soundsPath = soundsPath
        this.playerColor = playerColor
        this.orientation = orientation
        this.interactivity = SimpleChessBoard.#initInteractivity(interactivity)
        this.visual = SimpleChessBoard.#initVisual(visual)
        this.handlers = handlers

        // Initializing overlays
        const svgChildrens = this.#svg.children

        // RECTS OVERLAY
        this.#rectsOverlay = svgChildrens[2]
        this.#selectedPieceSquareOverlay = this.#rectsOverlay.children[0]
        this.#lastMoveOverlay = this.#rectsOverlay.children[1]
        this.#checkKingOverlay = this.#rectsOverlay.children[2]
        this.#rcOverlay = this.#rectsOverlay.children[3]
        this.#rcNormalOverlay = this.#rcOverlay.children[0]
        this.#rcShiftOverlay = this.#rcOverlay.children[1]
        this.#rcCtrlOverlay = this.#rcOverlay.children[2]
        this.#rcAltOverlay = this.#rcOverlay.children[3]
        this.#rcCustomOverlay = this.#rcOverlay.children[4]

        // rdNormalOverlay === right drag normal overlay
        this.#rdOverlay = svgChildrens[6]
        this.#rdNormalOverlay = this.#rdOverlay.children[0]
        this.#rdShiftOverlay = this.#rdOverlay.children[1]
        this.#rdCtrlOverlay = this.#rdOverlay.children[2]
        this.#rdAltOverlay = this.#rdOverlay.children[3]
        this.#rdCustomOverlay = this.#rdOverlay.children[4]


        // "lm" = "legalMove"
        this.#legalMovesOverlay = svgChildrens[3]
        this.#lgCaptureOverlay = this.#legalMovesOverlay.children[0]
        this.#lgNormalOverlay = this.#legalMovesOverlay.children[1]
        this.#piecesOverlay = svgChildrens[4]
        this.#promotionOptionsOverlay = svgChildrens[7]
        this.#dragSquareOverlay = svgChildrens[8]


        const chessBoardPosition = !position || position === 'default' ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq" : position
        this.setPosition(chessBoardPosition)

        this.#svg.addEventListener('keydown', (e) => {
            if (!this.interactivity?.enabled || !this.interactivity?.keyboardNavigation) return

            if (e.key === 'ArrowLeft') {
                this.#undoMove()
            } else if (e.key === 'ArrowRight') {
                this.#redoMove()
            } else if (e.key === 'ArrowUp') {
                this.#goToStart()
            } else if (e.key === 'ArrowDown') {
                this.#goToEnd()
            }
        })


        this.#svg.addEventListener('pointerdown', (e) => {
            this.#svg.focus()
            const clickedSquare = this.#getEventSquare(e)

            this.handlers.onSquarePointerDown?.({ square: clickedSquare, event: e })
            if (!this.interactivity.enabled || this.#draggingPiece) return

            this.#clickPixels.x = e.clientX
            this.#clickPixels.y = e.clientY

            if (e.buttons === 2) {
                this.#rightClickFromSquare = clickedSquare
                return
            }

            this.#clearAllRightClickMarks()
            this.#clearAllArrows()

            // -------------------- Promotion mode --------------------
            if (this.#isPromotionActive()) {
                this.#clearPromotionOptions()

                const promotion = e.target.dataset.promotion
                if (promotion) {
                    this.#executeMove(this.#selectedSquare, this.#promotionOptionsOverlay.dataset.notation, promotion.toLowerCase())
                }

                this.#clearSelection()
                return
            }

            // -------------------- Legal movement --------------------
            if (this.#isLegalMove(clickedSquare)) {
                const from = this.#selectedSquare
                const to = clickedSquare

                if (this.#isPromotion(from, to)) {
                    this.#renderPromotionOptions(to)
                    this.#clearLegalMoves()
                    return
                }

                this.#executeMove(from, to)
                return
            }

            // -------------------- Drag ONLY if allowed --------------------
            const possiblePiece = this.chessLogic.get(clickedSquare)
            const isOwn = this.#isOwnPiece(possiblePiece)

            if (
                this.interactivity.drag &&
                (isOwn ? this.interactivity.dragOwnPieces : this.interactivity.dragEnemyPieces && this.interactivity.selectEnemyPieces)
            ) {
                this.#dragPiece(clickedSquare, e)
            }

            if (this.#selectedSquare === clickedSquare) return

            if (isOwn === null || (isOwn === false && !this.interactivity.selectEnemyPieces)) {
                this.interactivity.deselectOnEmptyClick && this.#clearSelection()
                return
            }


            this.#clearSelection()
            this.#selectSquare(clickedSquare, e)
        })


        document.addEventListener('pointermove', (e) => {
            if (!this.#draggingPiece || this.#rightClickFromSquare) return

            if ((e.buttons & 1) && (e.buttons & 2)) {

                const pointerUpEvent = new PointerEvent('pointerup', e)
                document.dispatchEvent(pointerUpEvent)

                this.#cancelPointerUp = true
                return
            }

            if (!this.interactivity.enabled || this.#squarePromotion) return
            if (
                this.#alreadyMoveClickPixels ||
                Math.abs(e.clientX - this.#clickPixels.x) >= 10 ||
                Math.abs(e.clientY - this.#clickPixels.y) >= 10
            ) {
                this.#alreadyMoveClickPixels = true
                this.#draggingPiece.style.transform = `translate(${e.clientX}px, ${e.clientY}px)translate(-50%, -50%)`
                if (this.visual.dragSquareCircle) {
                    this.#renderDragSquareCircle(this.#getEventSquare(e))
                }
            }
        })

        document.addEventListener('pointerup', (e) => {

            const droppedSquare = this.#getEventSquare(e)

            if (this.#rightClickFromSquare) {
                let type = 'normal'

                if (e.shiftKey) type = 'shift'
                else if (e.ctrlKey) type = 'ctrl'
                else if (e.altKey) type = 'alt'

                if (this.#rightClickFromSquare === droppedSquare) {
                    this.interactivity.marks && this.renderRightClickMark(droppedSquare, type)
                } else {
                    this.interactivity.arrows && this.renderRightDragArrow(this.#rightClickFromSquare, droppedSquare, type)
                }

                this.#rightClickFromSquare = null
                this.#clearSelection()
                return
            }


            if (this.#cancelPointerUp) {
                this.#cancelPointerUp = false
                return
            }


            const selectedPiece = this.chessLogic.get(this.#selectedSquare)
            const isOwn = this.#isOwnPiece(selectedPiece)

            if (
                !(
                    this.interactivity.drag &&
                    (isOwn ? this.interactivity.dragOwnPieces : this.interactivity.dragEnemyPieces)
                )
            ) {
                if (!this.interactivity.keepSelectedOnClick) {
                    !this.#immuneFirstPointerUp && droppedSquare === this.#selectedSquare && this.#clearSelection()
                }
                this.#immuneFirstPointerUp = false
                return
            }

            if (!this.#draggingPiece || this.#isPromotionActive()) return

            this.#clearDragging()

            if (this.#isLegalMove(droppedSquare)) {
                const from = this.#selectedSquare
                const to = droppedSquare

                if (this.#isPromotion(from, to)) {
                    this.#renderPromotionOptions(to)
                    this.#clearLegalMoves()
                    return
                }

                this.#executeMove(from, to, undefined, false)
                return
            }

            if (
                (this.interactivity.deselectOnEmptyDrop && this.#selectedSquare !== droppedSquare)
                ||
                (this.interactivity.deselectOnSelectedSquareDrop && this.#selectedSquare === droppedSquare)
            ) {
                this.#clearSelection()
            }

            if (!this.interactivity.keepSelectedOnClick) {
                !this.#immuneFirstPointerUp && droppedSquare === this.#selectedSquare && this.#clearSelection()
            }
            this.#immuneFirstPointerUp = false
        })
    }

    #getRcOverlay(type) {
        if (type === 'normal') return this.#rcNormalOverlay
        else if (type === 'shift') return this.#rcShiftOverlay
        else if (type === 'ctrl') return this.#rcCtrlOverlay
        else if (type === 'alt') return this.#rcAltOverlay
        else if (type === 'custom') return this.#rcCustomOverlay
    }

    #getRdOverlay(type) {
        if (type === 'normal') return this.#rdNormalOverlay
        else if (type === 'shift') return this.#rdShiftOverlay
        else if (type === 'ctrl') return this.#rdCtrlOverlay
        else if (type === 'alt') return this.#rdAltOverlay
        else if (type === 'custom') return this.#rdCustomOverlay
    }


    renderRightDragArrow(from, to, type, style) {
        const id = `${this.container.id}-rd-${from}${to}`
        const existing = document.getElementById(id)
        let overlay

        if (existing) {
            const existingType = existing.getAttribute('data-type')
            if (existingType === type) {
                existing.remove()
            } else {
                existing.dataset.type = type
                overlay = this.#getRdOverlay(type)
                overlay.appendChild(existing)
            }
            return
        }

        this.#renderArrowInternal(id, from, to, type, style)
    }

    renderRightClickMark(square, type, style) {
        const id = `${this.container.id}-rc-${square}`
        const existingRect = document.getElementById(id)
        let overlay

        if (existingRect) {
            if (existingRect.dataset.type === type) {
                existingRect.remove()
            } else {
                existingRect.dataset.type = type
                overlay = this.#getRcOverlay(type)
                overlay.appendChild(existingRect)
            }
            return
        }

        this.#renderMarkInternal(id, square, type, style)
    }

    #clearAllRightClickMarks() {
        this.#rcNormalOverlay.innerHTML = ''
        this.#rcShiftOverlay.innerHTML = ''
        this.#rcCtrlOverlay.innerHTML = ''
        this.#rcAltOverlay.innerHTML = ''
    }

    #clearAllArrows() {
        this.#rdNormalOverlay.innerHTML = ''
        this.#rdShiftOverlay.innerHTML = ''
        this.#rdCtrlOverlay.innerHTML = ''
        this.#rdAltOverlay.innerHTML = ''
    }

    #dragPiece(square, e) {
        const piece = this.#getPieceElement(square)
        if (!piece) return

        const rect = piece.getBoundingClientRect()

        const clone = document.createElement("img")
        const size = rect.width

        clone.src = piece.getAttribute("href")
        clone.classList.add("dragging-piece")
        clone.width = size

        clone.style.transform = `
            translate(${rect.left + rect.width / 2}px, ${rect.top + rect.height / 2}px)
            translate(-50%, -50%)
        `

        this.#draggingPiece = clone

        this.#svg.style.cursor = "var(--drag-cursor)"
        this.#piecesOverlay.style.cursor = "var(--drag-cursor)"
        piece.style.opacity = "var(--drag-opacity-original)"
        this.container.appendChild(clone)
    }


    #clearDragging() {
        this.#draggingPiece?.remove()
        this.#draggingPiece = null
        this.#getPieceElement(this.#selectedSquare).style.opacity = '1'
        this.#svg.style.cursor = 'auto'
        this.#piecesOverlay.style.cursor = "var(--piece-hover-cursor)"
        this.#alreadyMoveClickPixels = false
        this.#dragSquareOverlay.style.display = "none"
    }

    #renderLegalMoves(fromSquare) {
        // It would be a good idea in the future to change it to a getter and setter that removes the currently visible movements.
        if (!this.visual.showLegalMoves) return
        const moves = this.chessLogic.moves({
            square: fromSquare,
            verbose: true
        })

        const { capture, empty } = this.style.legalMoves
        let captureHTML = ''
        let normalHTML = ''

        const uniqueMoves = new Set()

        for (const { to } of moves) {
            if (uniqueMoves.has(to)) continue
            uniqueMoves.add(to)

            const pieceOnTarget = this.chessLogic.get(to)
            const { x, y } = this.#notationToXY(to)
            const style = pieceOnTarget ? capture : empty

            const html = `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${style.radius}"`
            if (pieceOnTarget) {
                captureHTML += html + (pieceOnTarget ? ' class="capture"' : '') + '/>'
            } else {
                normalHTML += html + '/>'
            }

        }

        this.#lgCaptureOverlay.insertAdjacentHTML('beforeend', captureHTML)
        this.#lgNormalOverlay.insertAdjacentHTML('beforeend', normalHTML)
    }

    #syncBoard() {
        this.chessLogic.board().forEach((row, y) => {
            row.forEach((square, x) => {
                const displayX = x
                const displayY = y

                const notation = this.#xyToNotation(displayX, displayY)
                const id = `${this.container.id}-${notation}`
                const existing = document.getElementById(id)

                if (!square) {
                    existing?.remove()
                    return
                }

                const pieceType = square.type
                const pieceColor = square.color
                const pieceSvg = this.pieceImagesMap[
                    pieceColor === 'w'
                        ? pieceType.toUpperCase()
                        : pieceType
                ]

                if (existing) {
                    if (existing.dataset.piece === pieceType && existing.dataset.color === pieceColor) {
                        existing.setAttribute('x', displayX)
                        existing.setAttribute('y', displayY)
                        return
                    }

                    existing.setAttribute('href', this.piecesPath + pieceSvg)
                    existing.dataset.piece = pieceType
                    existing.dataset.color = pieceColor
                    existing.setAttribute('x', displayX)
                    existing.setAttribute('y', displayY)

                    return
                }

                this.#piecesOverlay.insertAdjacentHTML(
                    'beforeend',
                    `
                    <image
                        id="${id}"
                        href="${this.piecesPath + pieceSvg}"
                        x="${displayX}"
                        y="${displayY}"
                        data-piece="${pieceType}"
                        data-color="${pieceColor}"
                        ${pieceType === 'k'
                        ? (pieceColor === 'w' ? 'class="K"' : 'class="k"')
                        : ''
                    }
                    />
                    `
                )
            })
        })
    }

    #renderDragSquareCircle(square) {
        if (!this.visual.dragSquareCircle) return
        this.#dragSquareOverlay.style.display = "block"
        const circle = this.#dragSquareOverlay.children[0]
        if (circle.dataset.square !== square) {
            const { x, y } = this.#notationToXY(square)
            circle.setAttribute('cx', x + 0.5)
            circle.setAttribute('cy', y + 0.5)
        }
    }

    #isOwnPiece(piece) {
        if (!piece) return null
        return this.playerColor === 'both'
            ? piece.color === this.chessLogic.turn()
            : piece.color === this.playerColor
    }

    #selectSquare(square) {
        this.#selectedSquare = square
        this.#renderLegalMoves(square)
        if (square !== this.#history[this.#currentMoveIndex]?.to) {
            let { x, y } = this.#notationToXY(square)

            const piece = this.chessLogic.get(square)
            const isOwn = this.#isOwnPiece(piece)

            if (
                (isOwn && !this.visual.highlightSelectedPieceSquareOwn) ||
                (!isOwn && !this.visual.highlightSelectedPieceSquareEnemy)
            ) {
                return
            }

            const cls = isOwn
                ? "selected-piece-square-own"
                : "selected-piece-square-enemy"
            this.#selectedPieceSquareOverlay.innerHTML = `<rect  x="${x}" y="${y}" class="${cls}"/>`
        }
    }

    #clearSelection() {
        this.#selectedSquare = null
        this.#immuneFirstPointerUp = true
        this.#selectedPieceSquareOverlay.innerHTML = ''
        this.#clearLegalMoves()
    }

    #clearLegalMoves() {
        this.#lgCaptureOverlay.innerHTML = ''
        this.#lgNormalOverlay.innerHTML = ''
    }

    setPosition(position) {
        this.chessLogic.load(position)
        this.#initialPosition = position
        this.#history = []
        this.#currentMoveIndex = -1
        this.#syncBoard()
        this.#lastMoveOverlay.innerHTML = ''
    }

    flipBoard() {
        this.orientation = this.orientation === 'w' ? 'b' : 'w'
    }


    static #initStyle(style) {
        function merge(defaultObj, customObj) {
            return { ...defaultObj, ...customObj }
        }

        return {
            board: merge(DEFAULT_STYLE.board, style?.board),
            drag: merge(DEFAULT_STYLE.drag, style?.drag),
            piece: {
                hover: merge(DEFAULT_STYLE.piece.hover, style?.piece?.hover)
            },
            legalMoves: {
                empty: merge(DEFAULT_STYLE.legalMoves.empty, style?.legalMoves?.empty),
                capture: merge(DEFAULT_STYLE.legalMoves.capture, style?.legalMoves?.capture)
            },
            selectedPieceSquare: {
                own: merge(DEFAULT_STYLE.selectedPieceSquare.own, style?.selectedPieceSquare?.own),
                enemy: merge(DEFAULT_STYLE.selectedPieceSquare.enemy, style?.selectedPieceSquare?.enemy)
            },
            lastMove: {
                from: merge(DEFAULT_STYLE.lastMove.from, style?.lastMove?.from),
                to: merge(DEFAULT_STYLE.lastMove.to, style?.lastMove?.to)
            }
        }
    }

    static #initInteractivity(interactivity) {
        return {
            ...DEFAULT_INTERACTIVITY,
            ...interactivity
        }
    }

    static #initVisual(visual) {
        return {
            ...DEFAULT_VISUAL,
            ...visual
        }
    }

    #canMovePiece(square) {
        const piece = this.chessLogic.get(square)
        return piece && (this.playerColor === 'both'
            ? piece.color === this.chessLogic.turn()
            : piece.color === this.playerColor && piece.color === this.chessLogic.turn())
    }

    #isLegalMove(square) {
        if (this.#selectedSquare === null || this.#selectedSquare === square || !this.#canMovePiece(this.#selectedSquare)) return
        const isLegal = this.chessLogic.moves({ square: this.#selectedSquare, verbose: true }).some(move => move.to === square)
        if (this.chessLogic.isCheck() && !isLegal) {
            this.#renderCheckKingRect()
        }

        return isLegal
    }

    #renderCheckKingRect() {
        const king = this.#piecesOverlay.querySelector(this.chessLogic.turn() === 'w' ? '.K' : '.k')
        let x = king.getAttribute('x')
        let y = king.getAttribute('y')

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        rect.setAttribute("x", x)
        rect.setAttribute("y", y)
        rect.setAttribute("fill", "#ff0000ab")

        this.#checkKingOverlay.appendChild(rect)

        setTimeout(() => rect.remove(), 250)
    }

    #isPromotion(from, to) {
        const piece = this.chessLogic.get(from)
        if (!piece || piece.type !== 'p') return

        const rank = +to[1]
        if ((piece.color === 'w' && rank === 8) || (piece.color === 'b' && rank === 1)) return true
    }

    #executeMove(from, to, promotion, animate = true) {
        this.handlers.onMoveStart?.(from, to, promotion)
        const move = this.chessLogic.move({ from, to, promotion })

        if (this.#currentMoveIndex < this.#history.length - 1) {
            const next = this.#history[this.#currentMoveIndex + 1]

            if (
                next.from === move.from &&
                next.to === move.to &&
                next.promotion === move.promotion
            ) {
                this.#redoMove(true, animate)
                return
            }

            this.#history = this.#history.slice(0, this.#currentMoveIndex + 1)
        }

        this.#history.push({
            from: move.from,
            to: move.to,
            promotion: move.promotion,
            san: move.san
        })
        this.#currentMoveIndex++

        this.#syncBoard()
        this.#clearSelection()
        this.#updateLastMoveOverlay(move.from, move.to)

        this.handlers.onMoveEnd?.(this, move)

        if (this.chessLogic.isCheckmate()) this.handlers.onCheckmate?.(move)
        else if (this.chessLogic.isStalemate()) this.handlers.onStalemate?.(move)
        else if (this.chessLogic.isThreefoldRepetition()) this.handlers.onThreefoldRepetition?.(move)
        else if (this.chessLogic.isInsufficientMaterial()) this.handlers.onInsufficientMaterial?.(move)
        else if (this.chessLogic.isDraw()) this.handlers.onDraw?.(move)
        else if (this.chessLogic.inCheck()) this.handlers.onCheck?.(move)

        if (animate && !promotion) {
            this.#animateMove(move)
        }
    }


    #animatePiece(element, fromSquare, toSquare) {
        const { x: x1, y: y1 } = this.#notationToXY(fromSquare)
        const { x: x2, y: y2 } = this.#notationToXY(toSquare)

        const dx = x1 - x2
        const dy = y1 - y2

        element.animate(
            [
                { translate: `${dx}px ${dy}px` },
                { translate: `0px 0px` }
            ],
            {
                duration: 100,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            }
        )
    }


    #updateLastMoveOverlay(from, to) {
        if (!this.visual.highlightLastMove) return

        let { x: x1, y: y1 } = this.#notationToXY(from)
        let { x: x2, y: y2 } = this.#notationToXY(to)

        this.#lastMoveOverlay.innerHTML = `
            <rect x="${x1}" y="${y1}" class="last-move-from"/>
            <rect x="${x2}" y="${y2}" class="last-move-to"/>
        `
    }

    #xyToNotation(x, y) {
        const files = 'abcdefgh'
        return files[x] + (8 - y)
    }

    #notationToXY(notation) {
        const files = 'abcdefgh'

        let x = files.indexOf(notation[0])
        let y = 8 - +notation[1]

        return { x, y }
    }

    #getEventSquare(e) {
        const r = this.#svg.getBoundingClientRect()

        let x = Math.floor((e.clientX - r.left) / r.width * 8)
        let y = Math.floor((e.clientY - r.top) / r.height * 8)

        if (this.orientation === 'b') {
            x = 7 - x
            y = 7 - y
        }

        return this.#xyToNotation(x, y)
    }

    #getPieceElement(square) {
        return document.getElementById(`${this.container.id}-${square}`)
    }

    #renderPromotionOptions(notation) {
        this.#getPieceElement(this.#selectedSquare).style.opacity = 0

        const { x } = this.#notationToXY(notation)
        const isBlack = this.chessLogic.turn() === 'b'
        this.#promotionOptionsOverlay.dataset.notation = notation

        const pieceCodes = isBlack ? ['q', 'n', 'r', 'b'] : ['Q', 'N', 'R', 'B']
        const top = isBlack ? 4 : 0

        let html = `<rect width="1" height="4" rx="0.01" ry="0.01" stroke="#000000c9" stroke-width="0.002"/>`
        pieceCodes.forEach((p, i) => {
            html += `<image data-promotion="${p}" href="${this.piecesPath + this.pieceImagesMap[p]}" y="${isBlack ? 3 - i : i}" width="1" height="1"/>`
        })

        this.#promotionOptionsOverlay.innerHTML = html
        this.#promotionOptionsOverlay.style.transform = `translate(${x}px,${top}px)`
    }



    #clearPromotionOptions() {
        this.#promotionOptionsOverlay.innerHTML = ''
        this.#getPieceElement(this.#selectedSquare).style.opacity = 1
    }

    #goToStart() {
        if (!this.#initialPosition || this.#currentMoveIndex === -1) return
        if (this.#isPromotionActive()) {
            this.#clearPromotionOptions()
        }
        while (this.#currentMoveIndex >= 0) {
            this.chessLogic.undo()
            this.#currentMoveIndex--
        }
        this.#currentMoveIndex = -1
        this.#lastMoveOverlay.innerHTML = ''
        this.#syncBoard()
        this.#clearSelection()
    }

    #goToEnd() {
        if (this.#currentMoveIndex === this.#history.length - 1) return
        if (this.#isPromotionActive()) this.#clearPromotionOptions()

        for (let i = this.#currentMoveIndex + 1; i < this.#history.length; i++) {
            this.chessLogic.move(this.#history[i])
        }
        this.#currentMoveIndex = this.#history.length - 1

        if (this.#currentMoveIndex >= 0) {
            const last = this.#history[this.#currentMoveIndex]
            this.#updateLastMoveOverlay(last.from, last.to)
        } else {
            this.#lastMoveOverlay.innerHTML = ""
        }

        this.#syncBoard()
        this.#clearSelection()
    }

    #undoMove() {
        if (this.#currentMoveIndex < 0) return
        if (this.#isPromotionActive()) {
            this.#clearPromotionOptions()
        }

        const last = this.#history[this.#currentMoveIndex]

        this.chessLogic.undo()
        this.#currentMoveIndex--

        this.#syncBoard()
        this.#clearSelection()

        if (this.#currentMoveIndex >= 0) {
            const beforeLast = this.#history[this.#currentMoveIndex]
            this.#updateLastMoveOverlay(beforeLast.from, beforeLast.to)
        } else {
            this.#lastMoveOverlay.innerHTML = ""
        }

        this.#animateMove(last, true)
    }

    #redoMove(skipChessLogic = false, animate = true) {
        if (this.#currentMoveIndex >= this.#history.length - 1) return
        if (this.#isPromotionActive()) this.#clearPromotionOptions()

        const next = this.#history[this.#currentMoveIndex + 1]

        const move = skipChessLogic ? next : this.chessLogic.move(next)
        if (!move) return


        this.#currentMoveIndex++
        this.#syncBoard()
        this.#clearSelection()
        this.#updateLastMoveOverlay(next.from, next.to)
        if (animate) this.#animateMove(next, false)
    }

    #animateMove(move, isUndo = false) {
        const from = isUndo ? move.to : move.from
        const to = isUndo ? move.from : move.to
        const piece = this.#getPieceElement(to)
        piece.parentNode.appendChild(piece)
        this.#animatePiece(piece, from, to)

        if (move.san === 'O-O' || move.san === 'O-O-O') {
            let rookFrom, rookTo
            const number = move.to[1]

            if (move.san === 'O-O') {
                rookFrom = 'h' + number
                rookTo = 'f' + number
            } else {
                rookFrom = 'a' + number
                rookTo = 'd' + number
            }

            const rook = this.#getPieceElement(isUndo ? rookFrom : rookTo)
            isUndo ? this.#animatePiece(rook, rookTo, rookFrom) : this.#animatePiece(rook, rookFrom, rookTo)
        }
    }

    #isPromotionActive() {
        return this.#promotionOptionsOverlay.innerHTML !== ''
    }

    addCustomMark(square, style) {
        const id = `${this.container.id}-rc-custom-${square}`
        const existing = document.getElementById(id)
        if (existing) existing.remove()

        this.#renderMarkInternal(id, square, 'custom', style)
    }

    removeCustomMark(square) {
        const id = `${this.container.id}-rc-custom-${square}`
        document.getElementById(id)?.remove()
    }

    clearCustomMarks() {
        this.#rcCustomOverlay.innerHTML = ''
    }

    #renderMarkInternal(id, square, type, style) {
        let { x, y } = this.#notationToXY(square)

        const overlay = this.#getRcOverlay(type)
        overlay.insertAdjacentHTML(
            "beforeend",
            `<rect
                id="${id}"
                x="${x}"
                y="${y}"
                ${type ? `data-type="${type}"` : ''}
                ${style ? `style="${style}"` : ''}>
            </rect>`
        )
    }

    addCustomArrow(from, to, style) {
        const id = `${this.container.id}-rd-custom-${from}${to}`
        const existing = document.getElementById(id)
        if (existing) existing.remove()

        this.#renderArrowInternal(id, from, to, 'custom', style)
    }

    removeCustomArrow(from, to) {
        const id = `${this.container.id}-rd-custom-${from}${to}`
        document.getElementById(id)?.remove()
    }

    clearCustomArrows() {
        this.#rdCustomOverlay.innerHTML = ''
    }


    #renderArrowInternal(id, from, to, type, style) {
        let { x: x1, y: y1 } = this.#notationToXY(from)
        let { x: x2, y: y2 } = this.#notationToXY(to)

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

        const overlay = this.#getRdOverlay(type)
        overlay.insertAdjacentHTML(
            'beforeend',
            `<path id="${id}" data-type="${type}" d="${pathD}" ${style ? `style="${style}"` : ''}/>`
        )
    }

}
