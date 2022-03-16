import { GameState, Move } from "./engine.js";
import { Piece } from "./piece.js";

const pieceTypeFromChar = {
  k: Piece.King,
  p: Piece.Pawn,
  n: Piece.Knight,
  b: Piece.Bishop,
  r: Piece.Rook,
  q: Piece.Queen,
};

const IMAGES = {};
const board = document.querySelector("canvas");
const renderEngine = board.getContext("2d");
const WIDTH = 480;
const HEIGHT = WIDTH;
const DIMENSION = 8;
const SQ_SIZE = Math.floor(HEIGHT / DIMENSION);

let playerOne = true;
let playerTwo = true;
let playerPromoting = false;
let mouseDown = false;

let gameState = new GameState();
let promoting = false;
let legalMoves;
let moveMade = false;
let gameOver = false;

let squareSelected = {};
let currentPieceSelected = {};
const mouse = { x: null, y: null };

// perft debugging


function main() {
  
  loadImages();
  renderBoard();
  setupGame();
  gameLoop();
}




function loadImages() {
  let pieces = [
    "wp",
    "wR",
    "wN",
    "wB",
    "wQ",
    "wK",
    "bp",
    "bR",
    "bN",
    "bB",
    "bQ",
    "bK",
  ];
  for (let piece of pieces) {
    let color = piece[0] === "w" ? Piece.White : Piece.Black;
    let pieceType = pieceTypeFromChar[piece[1].toLowerCase()];
    let pieceKey = pieceType | color;
    IMAGES[pieceKey] = new Image();
    IMAGES[pieceKey].src = `/static/images/${piece}.png`;
  }
}

// responsible for drawing board
function renderBoard() {
  board.width = WIDTH;
  board.height = HEIGHT;
  for (let row = 0; row < DIMENSION; row++) {
    for (let col = 0; col < DIMENSION; col++) {
      let color = (row + col) % 2 === 0 ? "beige" : "brown";
      renderEngine.fillStyle = color;
      renderEngine.fillRect(col * SQ_SIZE, row * SQ_SIZE, SQ_SIZE, SQ_SIZE);
    }
  }
}
// setup event listeners, GameState
function setupGame() {
  addEventListener("mousedown", (e) => {
    if (!promoting) {
      const offset = board.getBoundingClientRect();
      mouse.x = e.clientX - offset.left;
      mouse.y = e.clientY - offset.top;
      const row = Math.floor(mouse.y / SQ_SIZE);
      const col = Math.floor(mouse.x / SQ_SIZE);
      mouseDown = true;

      if (row >= 0 && col >= 0 && row < 8 && col < 8) {
        const pieceInGameState = gameState.board[row][col];
        if (
          pieceInGameState != Piece.None &&
          Piece.Colour(pieceInGameState) === gameState.colorToMove
        ) {
          squareSelected.row = row;
          squareSelected.col = col;
        }
      }
    }
  });
  addEventListener("mousemove", (e) => {
    if (mouseDown) {
      const offset = board.getBoundingClientRect();
      mouse.x = e.clientX - offset.left;
      mouse.y = e.clientY - offset.top;
      const outOfBoundsOffset = SQ_SIZE * 0.25;
      if (mouse.x + outOfBoundsOffset > board.width) {
        mouse.x = board.width - outOfBoundsOffset;
      } else if (mouse.x - outOfBoundsOffset < 0) {
        mouse.x = 0 + outOfBoundsOffset;
      }
      if (mouse.y + outOfBoundsOffset > board.height) {
        mouse.y = board.height - outOfBoundsOffset;
      } else if (mouse.y - outOfBoundsOffset < 0) {
        mouse.y = 0 + outOfBoundsOffset;
      }
    }
  });
  addEventListener("mouseup", () => {
    mouseDown = false;
    mouse.x = null;
    mouse.y = null;
    squareSelected = {};
    if (Object.keys(currentPieceSelected).length !== 0) {
      if (
        !(
          currentPieceSelected.startRow === currentPieceSelected.endRow &&
          currentPieceSelected.startCol === currentPieceSelected.endCol
        )
      ) {
        let moveAboutToMake = new Move(
          [currentPieceSelected.startRow, currentPieceSelected.startCol],
          [currentPieceSelected.endRow, currentPieceSelected.endCol],
          gameState.board
        );
        for (let move of legalMoves) {
          if (moveAboutToMake.moveID === move.moveID) {
            if (move.isPawnPromotion) {
              promoting = true;
            } else {
              movePiece(move);

            }
          }
        }
      }
    }
  });
  addEventListener("keypress", (e) => {
      if (e.key === "z") {
          gameState.undoMove()
          moveMade = true
      }
  })

  gameState.setup({});
  legalMoves = gameState.getLegalMoves();
}

function gameLoop() {
  renderEngine.clearRect(0, 0, board.width, board.height);
  renderBoard();
  renderGameState(gameState.board);
  if (!promoting) {
    renderUserInput();
  } else {
    renderPromotionScreen();
  }
  if (moveMade) {
    // generate more moves
    moveMade = false;
    legalMoves = gameState.getLegalMoves();
  }
  requestAnimationFrame(gameLoop);
}

function renderPromotionScreen() {
    if (!document.querySelector(".promotion-screen")) {
        let promotionScreen = document.createElement("div")
        promotionScreen.classList.add("promotion-screen")
        let message = document.createElement("h1")
        message.innerText = "Promote To?"
        promotionScreen.appendChild(message)

        document.body.appendChild(promotionScreen)

        const promotionPieces = [Piece.Queen, Piece.Rook, Piece.Bishop, Piece.Knight]
        const pieceNames = ["Queen", "Rook", "Bishop", "Knight"]

        for (let i = 0; i < promotionPieces.length; i++) {
            let button = document.createElement("button")
            button.innerText = pieceNames[i]
            promotionScreen.appendChild(button)
            button.addEventListener("click", (e) => {
                const move = new Move([currentPieceSelected.startRow, currentPieceSelected.startCol], [currentPieceSelected.endRow, currentPieceSelected.endCol], gameState.board, promotionPieces[i])
                movePiece(move)
                promotionScreen.remove()
                promoting = false
            })
        }
    } 
}

function movePiece(move) {
  gameState.makeMove(move);
  currentPieceSelected = {}
  moveMade = true;
}

function renderGameState(board) {
  // render current board state here
  // do not render piece where position == the square selected
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (squareSelected.row === row && squareSelected.col === col) {
      } else {
        const piece = IMAGES[board[row][col]];
        if (piece) {
          renderEngine.drawImage(
            piece,
            col * SQ_SIZE,
            row * SQ_SIZE,
            SQ_SIZE,
            SQ_SIZE
          );
        }
      }
    }
  }
}

function renderUserInput() {
  if (Object.keys(squareSelected).length !== 0) {
    const pieceInGameState =
      gameState.board[squareSelected.row][squareSelected.col];

    renderEngine.fillStyle = "aqua";
    renderEngine.fillRect(
      squareSelected.col * SQ_SIZE,
      squareSelected.row * SQ_SIZE,
      SQ_SIZE,
      SQ_SIZE
    );
    if (mouse.x && mouse.y) {
      for (let move of legalMoves) {
        if (
          move.startRow === squareSelected.row &&
          move.startCol === squareSelected.col
        ) {
          // square move highlighting
          renderEngine.fillStyle = "rgba(255, 0, 0, 0.8)";
          renderEngine.fillRect(
            move.endCol * SQ_SIZE,
            move.endRow * SQ_SIZE,
            SQ_SIZE,
            SQ_SIZE
          );
        }
      }

      const piece = IMAGES[pieceInGameState];
      renderEngine.drawImage(
        // piece drag logic
        piece,
        mouse.x - piece.height*0.5,
        mouse.y - piece.width*0.5,
        SQ_SIZE,
        SQ_SIZE
      );
      // API to communicate to engine
      currentPieceSelected.startRow = squareSelected.row;
      currentPieceSelected.startCol = squareSelected.col;
      currentPieceSelected.endRow = Math.floor(mouse.y / SQ_SIZE);
      currentPieceSelected.endCol = Math.floor(mouse.x / SQ_SIZE);
    }
  }
}

addEventListener("load", () => {
  main();
});
