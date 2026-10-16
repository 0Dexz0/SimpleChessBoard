export class SimpleChessBoard {
    static isCoordsOutOfBounds({ x, y }: {
        x: any;
        y: any;
    }): boolean;
    static areSquaresEqual(square1: any, square2: any): boolean;
    static areCoordsEqual(a: any, b: any): boolean;
    /**
    * @param {Types.SimpleChessBoardOptions} options
    */
    constructor({ container, position, playerColor, orientation, piecesPath, interactivity, style, markGroups, $listeners }: Types.SimpleChessBoardOptions);
    set piecesPath(value: any);
    get piecesPath(): any;
    set orientation(value: string);
    get orientation(): string;
    set position(value: any);
    get position(): any;
    set interactivity(value: Types.Interactivity);
    get interactivity(): Types.Interactivity;
    set style(value: Types.Style);
    get style(): Types.Style;
    /**
    * @template {keyof Types.SimpleChessBoardEventMap} K
    * @param {K} eventName
    * @param {(data: Types.SimpleChessBoardEventMap[K]) => void} callback
    */
    on<K extends keyof Types.SimpleChessBoardEventMap>(eventName: K, callback: (data: Types.SimpleChessBoardEventMap[K]) => void): void;
    /**
    * @template {keyof Types.SimpleChessBoardEventMap} K
    * @param {K} eventName
    * @param {(data: Types.SimpleChessBoardEventMap[K]) => void} callback
    */
    off<K extends keyof Types.SimpleChessBoardEventMap>(eventName: K, callback: (data: Types.SimpleChessBoardEventMap[K]) => void): void;
    container: any;
    svg: any;
    g: {
        pieces: any;
        lm: any;
        lmCapture: any;
        lmEmpty: any;
        hsSelectedPiece: any;
        hsLastMove: any;
        promotionOptions: any;
        marksSquares: any;
        marksArrows: any;
        hsCheckKing: any;
        dragTrails: any;
    } | undefined;
    chessLogic: Chess | undefined;
    playerColor: any;
    clearAll(): void;
    clearSelection(): void;
    clearMarks(type?: Types.MarkType): void;
    clearDragTrails(): void;
    clearHsLastMove(): void;
    clearHistory(): void;
    createGroupMarkArrows(name: string, mode: Types.MarkGroupMode, options?: Types.MarkGroupOptions | null): boolean;
    createGroupMarkSquares(name: string, mode: Types.MarkGroupMode, options?: Types.MarkGroupOptions | null): boolean;
    deleteGroupMarkArrows(name: string): boolean;
    deleteGroupMarkSquares(name: string): boolean;
    renderMarkArrow(type: Types.MarkType, from: Types.Pos, to: Types.Pos, style?: Types.ArrowStyle | null, group?: string | null): SVGPathElement | null;
    renderMarkSquare(type: Types.MarkType, pos: Types.Pos, style?: Types.MarkStyle | null, group?: string | null): SVGRectElement | null;
    removeMark(mark: SVGElement): boolean;
    clearMarksArrows(type?: Types.MarkType, from?: Types.Pos, to?: Types.Pos): void;
    clearMarksSquares(type?: Types.MarkType, pos?: Types.Pos): void;
    clearGroupMarkArrows(group: string, type?: Types.MarkType, from?: Types.Pos, to?: Types.Pos): void;
    clearGroupMarkSquares(group: string, type?: Types.MarkType, pos?: Types.Pos): void;
    /**
    * @param {Types.Pos} pos
    * @returns {SVGUseElement}
    */
    getPieceElementFrom(pos: Types.Pos): SVGUseElement;
    /** @returns {SVGUseElement | undefined} */
    getLastDeadPieceElement(): SVGUseElement | undefined;
    /** @param {Types.Pos} pos */
    selectPiece(pos: Types.Pos, { clearMarks }?: {
        clearMarks?: boolean | undefined;
    }): boolean;
    setPiecesPath(newPath: any): void;
    setPosition(FEN: any, { throwOnError }?: {
        throwOnError?: boolean | undefined;
    }): boolean;
    setPlayerColor(color: any): void;
    resetPosition(): void;
    executeMove(from: Types.Pos, to: Types.Pos, animate?: boolean, promotion?: "q" | "r" | "b" | "n"): void;
    cancelPromotion(): void;
    /** @param {'w' | 'b'} [force] */
    flipBoard(force?: "w" | "b"): void;
    toggleMarks(): void;
    findKingCoords(color: any): {
        x: number;
        y: number;
    } | null;
    /**
    * @param {Types.Coords} coords
    * @returns {Types.Coords}
    */
    getOrientedCoords({ x, y }: Types.Coords): Types.Coords;
    /** @param {Types.Pos} pos */
    isLegalMove(pos: Types.Pos): boolean;
    /** @param {Types.Pos} pos */
    isEmpty(pos: Types.Pos): boolean;
    isMyTurn(): boolean;
    /** @param {Types.Pos} pos */
    isMyPiece(pos: Types.Pos): boolean;
    /** @param {Types.Pos} input */
    normalizeToCoords(input: Types.Pos): Types.Coords | null;
    /** @param {Types.Pos} input */
    normalizeToSquare(input: Types.Pos): string | null | undefined;
    undoAllMoves(): void;
    redoAllMoves(): void;
    redoMove(): void;
    undoMove(): void;
    #private;
}
import * as Types from '../types/SimpleChessBoard.types';
import { Chess } from 'chess.js';
//# sourceMappingURL=SimpleChessBoard.d.ts.map