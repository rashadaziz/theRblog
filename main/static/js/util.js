export class CastlingRights {
    constructor({wks:wks, wqs:wqs, bks:bks, bqs:bqs}) {
        this.wks = wks
        this.wqs = wqs
        this.bks = bks
        this.bqs = bqs
    }
    toString() {
        return `WhiteKingSide ${this.wks}, WhiteQueenSide ${this.wqs}, BlackKingSide  ${this.bks}, BlackQueenSide ${this.bqs}`
    }
    revoke() {
        this.wks = false
        this.wqs = false
        this.bks = false
        this.bqs = false
    }
}