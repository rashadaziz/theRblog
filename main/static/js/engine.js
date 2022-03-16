import { Piece } from "./piece.js";
import { CastlingRights } from "./util.js";

const consolePieces = {
  18: "p",
  10: "P",
  17: "k",
  9: "K",
  11: "N",
  19: "n",
  12: "B",
  20: "b",
  13: "R",
  21: "r",
  14: "Q",
  22: "q",
  0: "-",
};
const ranksToRows = { 1: 7, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 0 };
const rowsToRanks = {
  7: "1",
  6: "2",
  5: "3",
  4: "4",
  3: "5",
  2: "6",
  1: "7",
  0: "8",
};
const filesToCols = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7 };
const colsToFiles = {
  0: "a",
  1: "b",
  2: "c",
  3: "d",
  4: "e",
  5: "f",
  6: "g",
  7: "h",
};

export class GameState {
  constructor() {
    this.checkCount = 0 //perft
    this.board = [[], [], [], [], [], [], [], []];
    this.colorToMove = Piece.White;
    this.moveLog = [];
    this.enPassantLog = {};
    this.castlingRightsLog = [
      new CastlingRights({ wks: true, wqs: true, bks: true, bqs: true }),
    ];

    this.whiteKingLocation = [];
    this.blackKingLocation = [];
    this.inCheck = false;
    this.pins = [];
    this.checks = [];
    this.enPassantSquare = [];

    this.checkmate = false;
    this.stalemate = false;
  }

  makeMove(move) {
    this.board[move.startRow][move.startCol] = Piece.None;
    this.board[move.endRow][move.endCol] = move.pieceMoved;
    this.moveLog.push(move);
    this.colorToMove ^= 0b11000;

    if (move.pieceMoved === Piece.WhiteKing) {
      this.whiteKingLocation = [move.endRow, move.endCol];
    } else if (move.pieceMoved === Piece.BlackKing) {
      
      this.blackKingLocation = [move.endRow, move.endCol];
    
    }

    if (move.isPawnPromotion) {
      this.board[move.endRow][move.endCol] =
        move.promotionPiece | (this.colorToMove ^ 0b11000);
    }

    if (move.enPassantMove) {
      this.board[move.startRow][move.endCol] = Piece.None;
    }

    if (this.enPassantSquare.length !== 0) {
      this.enPassantLog[this.moveLog.length] = this.enPassantSquare;
      this.enPassantSquare = [];
    }

    if (
      Piece.PieceType(move.pieceMoved) === Piece.Pawn &&
      Math.abs(move.startRow - move.endRow) === 2
    ) {
      this.enPassantSquare = [
        Math.floor((move.startRow + move.endRow) / 2),
        move.startCol,
      ];
    } else {
      this.enPassantSquare = [];
    }

    if (move.isCastleMove) {
      if (move.endCol - move.startCol === 2) {
        this.board[move.endRow][move.endCol - 1] =
          this.board[move.endRow][move.endCol + 1];
        this.board[move.endRow][move.endCol + 1] = Piece.None;
      } else {
        this.board[move.endRow][move.endCol + 1] =
          this.board[move.endRow][move.endCol - 2];
        this.board[move.endRow][move.endCol - 2] = Piece.None;
      }
    }
    this.castlingRightsLog.push(this.evalCastlingRights(move))
  }

  undoMove() {
    if (this.moveLog.length !== 0) {
      const move = this.moveLog.pop();
      this.board[move.startRow][move.startCol] = move.pieceMoved;
      this.board[move.endRow][move.endCol] = move.pieceCaptured;
      this.colorToMove ^= 0b11000;

      if (move.pieceMoved === Piece.WhiteKing) {
        this.whiteKingLocation = [move.startRow, move.startCol];
      } else if (move.pieceMoved === Piece.BlackKing) {
        this.blackKingLocation = [move.startRow, move.startCol];
      }

      if (move.enPassantMove) {
        this.board[move.endRow][move.endCol] = Piece.None;
        this.board[move.startRow][move.endCol] =
          Piece.Pawn | (this.colorToMove ^ 0b11000);
      }

      let oldEnPassant = this.enPassantLog[this.moveLog.length + 1];
      if (oldEnPassant) {
        this.enPassantSquare = [...oldEnPassant];
        delete this.enPassantLog[this.moveLog.length + 1];
      } else {
        this.enPassantSquare = [];
      }
      this.castlingRightsLog.pop();

      if (move.isCastleMove) {
        if (move.endCol - move.startCol === 2) {
          this.board[move.endRow][move.endCol + 1] =
            this.board[move.endRow][move.endCol - 1];
          this.board[move.endRow][move.endCol - 1] = Piece.None;
        } else {
          this.board[move.endRow][move.endCol - 2] =
            this.board[move.endRow][move.endCol + 1];
          this.board[move.endRow][move.endCol + 1] = Piece.None;
        }
      }

      this.checkmate = false;
      this.stalemate = false;
    }
  }
  evalCastlingRights(move) {
    let oldCastleRights =
      this.castlingRightsLog[this.castlingRightsLog.length - 1];
    let newCastleRights = new CastlingRights({
      wks: oldCastleRights.wks,
      wqs: oldCastleRights.wks,
      bks: oldCastleRights.bks,
      bqs: oldCastleRights.bqs,
    });

    if (move.pieceMoved === Piece.WhiteKing) {
      newCastleRights.wks = false;
      newCastleRights.wqs = false;
    } else if (move.pieceMoved === Piece.BlackKing) {
      newCastleRights.bks = false;
      newCastleRights.bqs = false;
    } else if (move.pieceMoved === Piece.WhiteRook) {
      if (move.startRow === 7) {
        if (move.startCol === 0) {
          newCastleRights.wqs = false;
        } else if (move.startCol === 7) {
          newCastleRights.wks = false;
        }
      }
    } else if (move.pieceMoved === Piece.BlackRook) {
      if (move.startRow === 0) {
        if (move.startCol === 0) {
          newCastleRights.bqs = false;
        } else if (move.startCol === 7) {
          newCastleRights.bks = false;
        }
      }
    }
    if (move.pieceCaptured === Piece.WhiteRook) {
      if (move.endRow === 7) {
        if (move.endCol === 0) {
          newCastleRights.wqs = false;
        } else if (move.endCol === 7) {
          newCastleRights.wks = false;
        }
      }
    } else if (move.pieceCaptured === Piece.BlackRook) {
      if (move.startRow === 0) {
        if (move.startCol === 0) {
          newCastleRights.bqs = false;
        } else if (move.startCol === 7) {
          newCastleRights.bks = false;
        }
      }
    }
    return newCastleRights
  }

  getLegalMoves() {
      let moves = []
      let gameStateInfo = this.checkForPinsAndChecks()
      this.inCheck = gameStateInfo[0]
      this.pins = gameStateInfo[1]
      this.checks = gameStateInfo[2]

      let kingPos = this.colorToMove === Piece.White? this.whiteKingLocation : this.blackKingLocation
      let kingRow = kingPos[0]
      let kingCol = kingPos[1]

      if (this.inCheck) {
        this.checkCount++
          if (this.checks.length === 1) {
              moves = this.getAllMoves()
              let check = this.checks[0]
              let checkRow = check[0]
              let checkCol = check[1]
              let pieceChecking = this.board[checkRow][checkCol]
              let validSquares = []
              if (Piece.PieceType(pieceChecking) === Piece.Knight) {
                  validSquares = [[checkRow, checkCol]]
              } else {
                  for (let i = 1; i < 8; i++) {
                      let validSquare = [kingRow + check[2]*i, kingCol + check[3]*i]
                      validSquares.push(validSquare)
                      if (validSquare[0] === checkRow && validSquare[1] === checkCol) {
                          break
                      }
                  }
              }
              for (let i = moves.length-1; i >= 0; i--) {
                  if (Piece.PieceType(moves[i].pieceMoved) != Piece.King) {
                    if (!validSquares.some((arr) => arr[0] === moves[i].endRow && arr[1] === moves[i].endCol)) {
                        moves.splice(i, 1)
                    }      
                }
              }
          } else {
            this.checkCount++
              this.getKingMoves(kingRow, kingCol, moves)
          }
      } else {
          moves = this.getAllMoves()
      }
      
      if (moves.length === 0 && !this.inCheck) {
          this.stalemate = true
      } else if (moves.length === 0 && this.inCheck) {
          this.checkmate = true
      }

    return moves;
  }

  // pseudo legal moves
  getAllMoves() {
    let moves = [];
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board.length; col++) {
        const piece = this.board[row][col];
        const pieceType = Piece.PieceType(piece);
        if (Piece.Colour(piece) === this.colorToMove) {
          if (pieceType === Piece.Pawn) {
            this.getPawnMoves(row, col, moves);
          } else if (pieceType === Piece.Rook) {
            this.getRookMoves(row, col, moves);
          } else if (pieceType === Piece.Bishop) {
            this.getBishopMoves(row, col, moves);
          } else if (pieceType === Piece.Knight) {
            this.getKnightMoves(row, col, moves);
          } else if (pieceType === Piece.Queen) {
            this.getQueenMoves(row, col, moves);
          } else if (pieceType === Piece.King) {
            this.getKingMoves(row, col, moves);
          }
        }
      }
    }
    return moves;
  }

  getPawnMoves(row, col, moves) {
    let piecePinned = false;
    let pinDirection = [];
    let kingPos =
      this.colorToMove === Piece.White
        ? this.whiteKingLocation
        : this.blackKingLocation;
    let kingRow = kingPos[0];
    let kingCol = kingPos[1];
    let moveAmount = this.colorToMove === Piece.White ? -1 : 1;
    let startRow = this.colorToMove === Piece.White ? 6 : 1;
    let opponentColor =
      this.colorToMove === Piece.White ? Piece.Black : Piece.White;

    for (let i = this.pins.length - 1; i >= 0; i--) {
      if (this.pins[i][0] == row && this.pins[i][1] == col) {
        piecePinned = true;
        pinDirection = [this.pins[i][2], this.pins[3]];
        this.pins.splice(i, 1);
        break;
      }
    }

    if (this.board[row + moveAmount][col] === Piece.None) {
      if (
        !piecePinned ||
        (pinDirection[0] === row + moveAmount && pinDirection[1] === 0)
      ) {
        let move = new Move([row, col], [row + moveAmount, col], this.board);
        if (move.isPawnPromotion) {
          moves.push(
            new Move(
              [row, col],
              [row + moveAmount, col],
              this.board,
              Piece.Queen
            )
          );
          moves.push(
            new Move(
              [row, col],
              [row + moveAmount, col],
              this.board,
              Piece.Rook
            )
          );
          moves.push(
            new Move(
              [row, col],
              [row + moveAmount, col],
              this.board,
              Piece.Bishop
            )
          );
          moves.push(
            new Move(
              [row, col],
              [row + moveAmount, col],
              this.board,
              Piece.Knight
            )
          );
        } else {
          moves.push(move);
        }
        if (
          row === startRow &&
          this.board[row + 2 * moveAmount][col] === Piece.None
        ) {
          moves.push(
            new Move([row, col], [row + 2 * moveAmount, col], this.board)
          );
        }
      }
    }

    const range = (start, stop, step = 1) =>
      Array(Math.ceil((stop - start) / step))
        .fill(start)
        .map((x, y) => x + y * step);

    if (col - 1 >= 0) {
      if (
        !piecePinned ||
        (pinDirection[0] === moveAmount && pinDirection[1] === -1)
      ) {
        if (
          Piece.Colour(this.board[row + moveAmount][col - 1]) === opponentColor
        ) {
          let move = new Move(
            [row, col],
            [row + moveAmount, col - 1],
            this.board
          );
          if (move.isPawnPromotion) {
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col - 1],
                this.board,
                Piece.Queen
              )
            );
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col - 1],
                this.board,
                Piece.Rook
              )
            );
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col - 1],
                this.board,
                Piece.Bishop
              )
            );
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col - 1],
                this.board,
                Piece.Knight
              )
            );
          } else {
            moves.push(move);
          }
        } else if (
          row + moveAmount === this.enPassantSquare[0] &&
          col - 1 == this.enPassantSquare[1]
        ) {
          let attackingPiece,
            blockingPiece = false;
          let insideRange = [];
          let outsideRange = [];
          if (kingRow === row) {
            if (kingRow < row) {
              insideRange = range(kingCol + 1, col - 1);
              outsideRange = range(col + 1, 8);
            } else {
              insideRange = range(kingCol - 1, col, -1);
              outsideRange = range(col - 2, -1, -1);
            }
            for (let i of insideRange) {
              if (this.board[row][i] != Piece.None) {
                blockingPiece = true;
              }
            }
            for (let i of outsideRange) {
              const piece = this.board[row][i];
              if (
                Piece.Colour(piece) === opponentColor &&
                (Piece.PieceType(piece) === Piece.Queen ||
                  Piece.PieceType(piece) === PieceRook)
              ) {
                attackingPiece = true;
              } else if (piece != Piece.None) {
                blockingPiece = true;
              }
            }
          }
          if (blockingPiece || !attackingPiece) {
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col - 1],
                this.board,
                Piece.None,
                true
              )
            );
          }
        }
      }
    }
    if (col + 1 <= 7) {
      if (
        !piecePinned ||
        (pinDirection[0] === moveAmount && pinDirection[1] === 1)
      ) {
        if (
          Piece.Colour(this.board[row + moveAmount][col + 1]) === opponentColor
        ) {
          let move = new Move(
            [row, col],
            [row + moveAmount, col + 1],
            this.board
          );
          if (move.isPawnPromotion) {
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col + 1],
                this.board,
                Piece.Queen
              )
            );
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col + 1],
                this.board,
                Piece.Rook
              )
            );
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col + 1],
                this.board,
                Piece.Bishop
              )
            );
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col + 1],
                this.board,
                Piece.Knight
              )
            );
          } else {
            moves.push(move);
          }
        } else if (
          row + moveAmount === this.enPassantSquare[0] &&
          col + 1 == this.enPassantSquare[1]
        ) {
          let attackingPiece,
            blockingPiece = false;
          let insideRange = [];
          let outsideRange = [];
          if (kingRow === row) {
            if (kingRow < row) {
              insideRange = range(kingCol + 1, col);
              outsideRange = range(col + 2, 8);
            } else {
              insideRange = range(kingCol - 1, col + 1, -1);
              outsideRange = range(col - 1, -1, -1);
            }
            for (let i of insideRange) {
              if (this.board[row][i] != Piece.None) {
                blockingPiece = true;
              }
            }
            for (let i of outsideRange) {
              const piece = this.board[row][i];
              if (
                Piece.Colour(piece) === opponentColor &&
                (Piece.PieceType(piece) === Piece.Queen ||
                  Piece.PieceType(piece) === PieceRook)
              ) {
                attackingPiece = true;
              } else if (piece != Piece.None) {
                blockingPiece = true;
              }
            }
          }
          if (blockingPiece || !attackingPiece) {
            moves.push(
              new Move(
                [row, col],
                [row + moveAmount, col + 1],
                this.board,
                Piece.None,
                true
              )
            );
          }
        }
      }
    }
  }

  getRookMoves(row, col, moves) {
    let piecePinned = false;
    let pinDirection = [];

    for (let i = this.pins - 1; i >= 0; i--) {
      if (this.pins[i][0] === row && this.pins[i][1] === col) {
        piecePinned = true;
        pinDirection = [this.pins[i][2], this.pins[i][3]];
        if (Piece.PieceType(this.board[row][col]) !== Piece.Queen) {
          this.pins.splice(i, 1);
        }
        break;
      }
    }

    const directions = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ];
    const opponentColor = this.colorToMove ^ 0b11000;

    for (let d of directions) {
      for (let i = 1; i < 8; i++) {
        let endRow = row + d[0] * i;
        let endCol = col + d[1] * i;

        if (0 <= endRow && endRow < 8 && 0 <= endCol && endCol < 8) {
          if (
            !piecePinned ||
            (pinDirection[0] === d[0] && pinDirection[1] === d[1]) ||
            (pinDirection[0] === -d[0] && pinDirection[1] === -d[1])
          ) {
            let endPiece = this.board[endRow][endCol];

            if (endPiece === Piece.None) {
              moves.push(new Move([row, col], [endRow, endCol], this.board));
            } else if (Piece.Colour(endPiece) === opponentColor) {
              moves.push(new Move([row, col], [endRow, endCol], this.board));
              break;
            } else {
              break;
            }
          }
        } else {
          break;
        }
      }
    }
  }

  getBishopMoves(row, col, moves) {
    let piecePinned = false;
    let pinDirection = [];

    for (let i = this.pins - 1; i >= 0; i--) {
      if (this.pins[i][0] === row && this.pins[i][1] === col) {
        piecePinned = true;
        pinDirection = [this.pins[i][2], this.pins[i][3]];
        this.pins.splice(i, 1);
        break;
      }
    }

    const directions = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    const opponentColor = this.colorToMove ^ 0b11000;

    for (let d of directions) {
      for (let i = 1; i < 8; i++) {
        let endRow = row + d[0] * i;
        let endCol = col + d[1] * i;

        if (0 <= endRow && endRow < 8 && 0 <= endCol && endCol < 8) {
          if (
            !piecePinned ||
            (pinDirection[0] === d[0] && pinDirection[1] === d[1]) ||
            (pinDirection[0] === -d[0] && pinDirection[1] === -d[1])
          ) {
            let endPiece = this.board[endRow][endCol];

            if (endPiece === Piece.None) {
              moves.push(new Move([row, col], [endRow, endCol], this.board));
            } else if (Piece.Colour(endPiece) === opponentColor) {
              moves.push(new Move([row, col], [endRow, endCol], this.board));
              break;
            } else {
              break;
            }
          }
        } else {
          break;
        }
      }
    }
  }

  getKnightMoves(row, col, moves) {
    let piecePinned = false;

    for (let i = this.pins - 1; i >= 0; i--) {
      if (this.pins[i][0] === row && this.pins[i][1] === col) {
        piecePinned = true;
        this.pins.splice(i, 1);
        break;
      }
    }

    const knightMoves = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    for (let m of knightMoves) {
      let endRow = row + m[0];
      let endCol = col + m[1];

      if (0 <= endRow && endRow < 8 && 0 <= endCol && endCol < 8) {
        if (!piecePinned) {
          let endPiece = this.board[endRow][endCol];
          if (Piece.Colour(endPiece) !== this.colorToMove) {
            moves.push(new Move([row, col], [endRow, endCol], this.board));
          }
        }
      }
    }
  }

  getQueenMoves(row, col, moves) {
    this.getRookMoves(row, col, moves);
    this.getBishopMoves(row, col, moves);
  }

  getKingMoves(row, col, moves) {
    const rowMoves = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colMoves = [-1, 0, 1, -1, 1, -1, 0, 1];

    for (let i = 0; i < 8; i++) {
      let endRow = row + rowMoves[i];
      let endCol = col + colMoves[i];

      if (0 <= endRow && endRow < 8 && 0 <= endCol && endCol < 8) {
        let endPiece = this.board[endRow][endCol];

        if (Piece.Colour(endPiece) !== this.colorToMove) {
          if (!this.squareUnderAttack(endRow, endCol)) {
            moves.push(new Move([row, col], [endRow, endCol], this.board));
          }
        }
      }
    }
    if (!this.inCheck) {
    this.getCastleMoves(row, col, moves)
    }
  }

  getCastleMoves(row, col, moves) {
      let castleRights = this.castlingRightsLog[this.castlingRightsLog.length-1]
      if ((this.colorToMove === Piece.White && castleRights.wks) || (this.colorToMove === Piece.Black && castleRights.bks)) {
          this.getKingSideCastle(row, col, moves)
      } 
      if ((this.colorToMove === Piece.White && castleRights.wqs) || (this.colorToMove === Piece.Black && castleRights.bqs)) {
          this.getQueenSideCastle(row, col, moves)
      }
  }

  getKingSideCastle(row, col, moves) {
      if (this.board[row][col+1] === Piece.None && this.board[row][col+2] === Piece.None) {
          if (!this.squareUnderAttack(row, col+1) && !this.squareUnderAttack(row, col+2)) {
              moves.push(new Move([row, col], [row, col+2], this.board, Piece.None, false, true))
          }
      } 
  }

  getQueenSideCastle(row, col, moves) {
    if (this.board[row][col-1] === Piece.None && this.board[row][col-2] === Piece.None && this.board[row][col-3] === Piece.None) {
        if (!this.squareUnderAttack(row, col-1) && !this.squareUnderAttack(row, col-2)) {
            moves.push(new Move([row, col], [row, col-2], this.board, Piece.None, false, true))
        }
    } 
  }

  squareUnderAttack(row, col) {
    let startRow = row;
    let startCol = col;

    const directions = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    let opponentColor = this.colorToMove ^ 0b11000;
    let friendlyPieceFound = false;

    for (let j = 0; j < directions.length; j++) {
      friendlyPieceFound = false;
      let d = directions[j];
      for (let i = 1; i < 8; i++) {
        if (friendlyPieceFound) {
          break;
        }
        let endRow = startRow + d[0] * i;
        let endCol = startCol + d[1] * i;
        if (0 <= endRow && endRow < 8 && 0 <= endCol && endCol < 8) {
          let endPiece = this.board[endRow][endCol];
          if (
            Piece.Colour(endPiece) === this.colorToMove &&
            Piece.PieceType(endPiece) !== Piece.King
          ) {
            friendlyPieceFound = true;
            break;
          } else if (Piece.Colour(endPiece) === opponentColor) {
            let pieceType = Piece.PieceType(endPiece);

            if (
              (0 <= j && j <= 3 && pieceType === Piece.Rook) ||
              (4 <= j && j <= 7 && pieceType === Piece.Bishop) ||
              (i == 1 &&
                pieceType === Piece.Pawn &&
                ((opponentColor === Piece.White && 6 <= j && j <= 7) ||
                  (opponentColor === Piece.Black && 4 <= j && j <= 5))) ||
              pieceType === Piece.Queen ||
              (i === 1 && pieceType === Piece.King)
            ) {
              return true;
            } else {
              break;
            }
          }
        } else {
          break;
        }
      }
    }
    const knightMoves = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    for (let m of knightMoves) {
      let endRow = row + m[0];
      let endCol = col + m[1];

      if (0 <= endRow && endRow < 8 && 0 <= endCol && endCol < 8) {
        let endPiece = this.board[endRow][endCol];
        if (
          Piece.Colour(endPiece) === opponentColor &&
          Piece.PieceType(endPiece) === Piece.Knight
        ) {
          return true;
        }
      }
    }
    return false;
  }
  checkForPinsAndChecks() {
    let pins = [];
    let checks = [];
    let inCheck = false;

    let opponentColor = this.colorToMove ^ 0b11000;
    let kingPos =
      this.colorToMove === Piece.White
        ? this.whiteKingLocation
        : this.blackKingLocation;
    let startRow = kingPos[0];
    let startCol = kingPos[1];

    const directions = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (let j = 0; j < directions.length; j++) {
      let d = directions[j];
      let possiblePin = [];
      for (let i = 1; i < 8; i++) {
        let endRow = startRow + d[0] * i;
        let endCol = startCol + d[1] * i;
        if (0 <= endRow && endRow < 8 && 0 <= endCol && endCol < 8) {
          let endPiece = this.board[endRow][endCol];
          if (
            Piece.Colour(endPiece) === this.colorToMove &&
            Piece.PieceType(endPiece) !== Piece.King
          ) {
            if (possiblePin.length === 0) {
              possiblePin = [endRow, endCol, d[0], d[1]];
            } else {
              break;
            }
          } else if (Piece.Colour(endPiece) === opponentColor) {
            let pieceType = Piece.PieceType(endPiece);

            if (
              (0 <= j && j <= 3 && pieceType === Piece.Rook) ||
              (4 <= j && j <= 7 && pieceType === Piece.Bishop) ||
              (i == 1 &&
                pieceType === Piece.Pawn &&
                ((opponentColor === Piece.White && 6 <= j && j <= 7) ||
                  (opponentColor === Piece.Black && 4 <= j && j <= 5))) ||
              pieceType === Piece.Queen ||
              (i === 1 && pieceType === Piece.King)
            ) {
              if (possiblePin.length === 0) {
                  inCheck = true
                  checks.push([endRow, endCol, d[0], d[1]])
                  break
              } else {
                  pins.push(possiblePin)
                  break
              }
            } else {
              break;
            }
          }
        } else {
          break;
        }
      }
    }
    const knightMoves = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    for (let m of knightMoves) {
      let endRow = startRow + m[0];
      let endCol = startCol + m[1];

      if (0 <= endRow && endRow < 8 && 0 <= endCol && endCol < 8) {
        let endPiece = this.board[endRow][endCol];
        if (
          Piece.Colour(endPiece) === opponentColor &&
          Piece.PieceType(endPiece) === Piece.Knight
        ) {
          inCheck = true
          checks.push([endRow, endCol, m[0], m[1]])
        }
      }
    }
    return [inCheck, pins, checks];
  }

  setup({
    FEN: fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
  }) {
    const fenSegments = fenString.split(" ");
    const pieceTypeFromChar = {
      k: Piece.King,
      p: Piece.Pawn,
      n: Piece.Knight,
      b: Piece.Bishop,
      r: Piece.Rook,
      q: Piece.Queen,
    };
    let file = 0,
      rank = 0;

    for (let i = 0; i < fenSegments[0].length; i++) {
      let char = fenSegments[0][i];
      if (char === "/") {
        file = 0;
        rank++;
      } else {
        if (!isNaN(char)) {
          let skips = parseInt(char);
          for (let j = file; j < skips + file; j++) {
            this.board[rank][j] = Piece.None;
          }
          file += skips;
        } else {
          let pieceColor =
            char === char.toUpperCase() ? Piece.White : Piece.Black;
          let pieceType = pieceTypeFromChar[char.toLowerCase()];
          this.board[rank][file] = pieceType | pieceColor;
          if (pieceType === Piece.King) {
            if (pieceColor === Piece.White) {
              this.whiteKingLocation = [rank, file];
            } else {
              this.blackKingLocation = [rank, file];
            }
          }
          file++;
        }
      }
    }
    if (fenSegments[1] === "w") {
      this.colorToMove = Piece.White;
    } else {
      this.colorToMove = Piece.Black;
    }
    let currentCastlingAbility =
      this.castlingRightsLog[this.castlingRightsLog.length - 1];
    currentCastlingAbility.revoke();
    for (let c = 0; c < fenSegments[2].length; c++) {
      let char = fenSegments[2][c];
      if (char === "K") {
        currentCastlingAbility.wks = true;
      } else if (char === "Q") {
        currentCastlingAbility.wqs = true;
      } else if (char === "k") {
        currentCastlingAbility.bks = true;
      } else if (char === "q") {
        currentCastlingAbility.bqs = true;
      }
    }
    let enPassant = fenSegments[3];
    if (enPassant !== "-") {
      this.enPassantSquare = [
        ranksToRows[enPassant[1]],
        filesToCols[enPassant[0]],
      ];
    }
  }

  toString() {
    let stringBuilder = "";
    for (let row of this.board) {
      let consoleRow = "";
      for (let piece of row) {
        consoleRow += ` ${consolePieces[piece]} `;
      }
      stringBuilder += `${consoleRow}\n`;
    }
    return stringBuilder;
  }
}

export class Move {
  constructor(
    start,
    end,
    board,
    promotionPiece = Piece.None,
    isEnpassant = false,
    isCastle = false
  ) {
    this.startRow = start[0];
    this.startCol = start[1];
    this.endRow = end[0];
    this.endCol = end[1];
    this.pieceMoved = board[this.startRow][this.startCol];
    this.pieceCaptured = board[this.endRow][this.endCol];

    this.isPawnPromotion =
      (this.pieceMoved === Piece.WhitePawn && this.endRow === 0) ||
      (this.pieceMoved === Piece.BlackPawn && this.endRow === 7);
    this.promotionPiece = promotionPiece;
    this.enPassantMove = isEnpassant;
    this.isCastleMove = isCastle;

    this.moveID =
      this.startRow * 1000 +
      this.startCol * 100 +
      this.endRow * 10 +
      this.endCol;
  }

  getChessNotation() {
    return `${this.getRankFile(
      this.startRow,
      this.startCol
    )} ${this.getRankFile(this.endRow, this.endCol)}`;
  }
  getRankFile(row, col) {
    return colsToFiles[col] + rowsToRanks[row];
  }
  toString() {
    return `${this.getChessNotation()}, enPassant: ${
      this.enPassantMove
    }, Castle: ${this.isCastleMove}, Pawn Promotion: ${this.isPawnPromotion}`;
  }
}
