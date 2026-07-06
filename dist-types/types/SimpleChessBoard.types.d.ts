export type ChessMove = import("chess.js").Move;
export type Coords = {
    x: number;
    y: number;
};
export type MarkType = "normal" | "shift" | "ctrl" | "alt" | "persistent";
export type Pos = string | Coords | SVGUseElement;
export type MarkOptions = {
    color?: string;
    opacity?: number;
    typeStyle?: MarkType;
};
export type RenderMarkArrow = (type: MarkType, from: Pos, to: Pos, options?: MarkOptions) => void;
export type RenderMarkSquare = (type: MarkType, pos: Pos, options?: MarkOptions) => void;
export type ClearMarks = (type?: MarkType) => void;
export type ClearMarkSquares = (type?: MarkType, pos?: Pos) => void;
export type ClearMarkArrows = (type?: MarkType, from?: Pos, to?: Pos) => void;
export type ExecuteMove = (from: Pos, to: Pos, animate?: true, promotion?: "q" | "r" | "b" | "n") => void;
export type Interactivity = {
    enabled?: boolean;
    drag?: {
        enabled?: boolean;
        trail?: {
            enabled?: boolean;
            circle?: boolean;
        };
    };
    selection?: {
        enabled?: boolean;
        ownPieces?: boolean;
        enemyPieces?: boolean;
    };
    deselection?: {
        enabled?: boolean;
        onClick?: {
            enabled?: boolean;
            empty?: boolean;
            selectedPiece?: boolean;
        };
        onDrop?: {
            enabled?: boolean;
            illegalMove?: boolean;
            selectedPiece?: boolean;
        };
    };
    marks?: {
        enabled?: boolean;
        squares?: boolean;
        arrows?: boolean;
    };
    keyboard?: {
        enabled?: boolean;
        navigation?: {
            enabled?: boolean;
            undoMove?: boolean;
            redoMove?: boolean;
            undoAllMoves?: boolean;
            redoAllMoves?: boolean;
        };
        shortcuts?: {
            enabled?: boolean;
            flipBoard?: boolean;
            toggleMarks?: boolean;
        };
    };
};
export type Style = {
    board?: {
        color1?: string;
        color2?: string;
    };
    dragPiece?: {
        cursor?: string;
        original?: {
            opacity?: number;
        };
        clone?: {
            opacity?: number;
            scale?: number;
            deltaPosition?: {
                x?: number;
                y?: number;
            };
        };
    };
    dragTrail?: {
        circle?: {
            radius?: number;
            color?: string;
            opacity?: number;
        };
    };
    piece?: {
        cursor?: string;
        animation?: {
            x?: {
                time?: string;
                type?: string;
            };
            y?: {
                time?: string;
                type?: string;
            };
            opacity?: {
                time?: string;
                type?: string;
            };
        };
    };
    legalMove?: {
        empty?: {
            radius?: number;
            color?: string;
            opacity?: number;
        };
        capture?: {
            radius?: number;
            color?: string;
            opacity?: number;
        };
    };
    highlightSquare?: {
        selectedPiece?: {
            color?: string;
            opacity?: number;
        };
        lastMove?: {
            from?: {
                color?: string;
                opacity?: number;
            };
            to?: {
                color?: string;
                opacity?: number;
            };
        };
        checkKing?: {
            color?: string;
            opacity?: number;
        };
    };
    marks?: {
        squares?: {
            normal?: {
                color?: string;
                opacity?: string | number;
            };
            shift?: {
                color?: string;
                opacity?: string | number;
            };
            ctrl?: {
                color?: string;
                opacity?: string | number;
            };
            alt?: {
                color?: string;
                opacity?: string | number;
            };
        };
        arrows?: {
            normal?: {
                color?: string;
                opacity?: string | number;
            };
            shift?: {
                color?: string;
                opacity?: string | number;
            };
            ctrl?: {
                color?: string;
                opacity?: string | number;
            };
            alt?: {
                color?: string;
                opacity?: string | number;
            };
        };
    };
};
export type SimpleChessBoardEventMap = {
    "selection:change": {
        pieceElement: SVGUseElement;
        square: string;
    };
    "selection:clear": void;
    "drag:start": {
        originalPiece: SVGUseElement;
        clonePiece: SVGUseElement;
    };
    "drag:end": {
        pieceElement: SVGUseElement;
        from: string;
        to: string;
    };
    "drag:cancel": {
        pieceElement: SVGUseElement;
        from: string;
        to: string;
    };
    "illegal-drop": {
        pieceElement: SVGUseElement;
        from: string;
        to: string;
    };
    "move:end": {
        pieceElement: SVGUseElement;
        move: ChessMove;
        animated: boolean;
    };
    "manual-promote:end": {
        from: Pos;
        to: Pos;
        animated: boolean;
        promotion: string;
    };
    "flip-board:end": {
        force?: "w" | "b";
        newOrientation: "w" | "b";
    };
    "undo:end": {
        move: ChessMove;
    };
    "redo:end": {
        move: ChessMove;
    };
    "reset-position:before": {
        cancel: () => boolean;
    };
    "reset-position:end": void;
    "undo-all:start": void;
    "redo-all:start": void;
    "undo-all:end": void;
    "redo-all:end": void;
};
export type SimpleChessBoardListeners = { [K in keyof SimpleChessBoardEventMap]?: ((data: SimpleChessBoardEventMap[K]) => void) | ((data: SimpleChessBoardEventMap[K]) => void)[]; };
export type SimpleChessBoardOptions = {
    container: HTMLElement;
    position?: string | undefined;
    playerColor?: "b" | "w" | undefined;
    orientation?: "b" | "w" | undefined;
    piecesPath?: string | undefined;
    interactivity?: Interactivity | undefined;
    style?: Style | undefined;
    $listeners?: SimpleChessBoardListeners | undefined;
};
//# sourceMappingURL=SimpleChessBoard.types.d.ts.map