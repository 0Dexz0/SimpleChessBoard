export const CHESSCOM_STYLE = {
    board: {
        color1: "#739552",
        color2: "#EBECD0"
    },

    dragPiece: {
        cursor: "grabbing",
        original: { opacity: 0.5 },
        clone: {
            opacity: 1,
            scale: 1,
            deltaPosition: {
                x: 0,
                y: 0
            }
        },
    },

    dragTrail: {
        circle: { radius: 1, color: "black", opacity: 0.141 },
    },

    piece: {
        cursor: "grab",
        animation: {
            x: { time: '0.3s', type: 'ease' },
            y: { time: '0.3s', type: 'ease' },
            opacity: { time: '0.2s', type: 'ease' }
        }
    },

    legalMove: {
        empty: { radius: 0.17, color: "black", opacity: 0.141 },
        capture: { radius: 0.45, color: "black", opacity: 0.141 }
    },

    highlightSquare: {
        selectedPiece: { color: "rgb(255, 255, 51)", opacity: 0.5 },

        lastMove: {
            from: { color: "rgb(255, 255, 51)", opacity: 0.5 },
            to: { color: "rgb(255, 255, 51)", opacity: 0.5 }
        },

        checkKing: { color: "#ff0000", opacity: 0.502 }
    },

    marks: {
        squares: {
            normal: { color: 'rgb(235, 97, 80)', opacity: '0.8' },
            shift: { color: 'rgb(172, 206, 89)', opacity: '0.8' },
            ctrl: { color: 'rgb(255, 170, 0)', opacity: '0.8' },
            alt: { color: 'rgb(82, 176, 220)', opacity: '0.8' }
        },

        arrows: {
            normal: { color: 'rgba(255, 170, 0, 0.8)', opacity: '0.8' },
            shift: { color: 'rgba(159, 207, 63, 0.8)', opacity: '0.8' },
            ctrl: { color: 'rgba(248, 85, 63, 0.8)', opacity: '0.8' },
            alt: { color: 'rgba(72, 193, 249, 0.8)', opacity: '0.8' }
        }
    }
}