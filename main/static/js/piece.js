export const Piece = {
  None: 0,
  King: 1,
  Pawn: 2,
  Knight: 3,
  Bishop: 4,
  Rook: 5,
  Queen: 6,

  WhiteKing: 9,
  WhitePawn: 10,
  WhiteKnight: 11,
  WhiteBishop: 12,
  WhiteRook: 13,
  WhiteQueen: 14,

  BlackKing: 17,
  BlackPawn: 18,
  BlackKnight: 19,
  BlackBishop: 20,
  BlackRook: 21,
  BlackQueen: 22,

  White: 8,
  Black: 16,
  typeMask: 0b00111,
  blackMask: 0b10000,
  whiteMask: 0b01000,
  colourMask: 0b10000 | 0b01000,

  Colour: function (piece) {
    return piece & this.colourMask;
  },
  PieceType: function (piece) {
    return piece & this.typeMask;
  },
  IsRookOrQueen: function (piece) {
    return (piece & 0b110) === 0b110;
  },
  IsBishopOrQueen: function (piece) {
    return (piece & 0b101) === 0b101;
  },
  IsSlidingPiece: function (piece) {
    return (piece & 0b100) !== 0;
  },
};
