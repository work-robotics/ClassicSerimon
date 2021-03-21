export class Params {
  private _rowHeight: number;
  private _fontSize: number;
  private _fontFamily: string;
  private _maxLineNum: number;

  private _lineNumbersWidth: number;
  private _paddingLineNumbersRight: number;
  private _topNumberHeight: number;

  constructor() {
    this._rowHeight = 20;
    this._fontSize = 16;
    this._fontFamily = "JetBrains Mono, Source Han Code JP, Menlo, Consolas";
    this._maxLineNum = 20;

    this._lineNumbersWidth = 90;
    this._paddingLineNumbersRight = 10;
    this._topNumberHeight = 30;
  }

  get rowHeight(): number {
    return this._rowHeight;
  }

  set rowHeight(data: number) {
    this._rowHeight = data;
  }

  get fontSize(): number {
    return this._fontSize;
  }

  set fontSize(data: number) {
    this._fontSize = data;
  }

  get fontFamily(): string {
    return this._fontFamily;
  }

  set fontFamily(data: string) {
    this._fontFamily = data;
  }

  get maxLineNum(): number {
    return this._maxLineNum;
  }

  set maxLineNum(data: number) {
    this._maxLineNum = data;
  }

  get lineNumbersWidth(): number {
    return this._lineNumbersWidth;
  }

  set lineNumbersWidth(data: number) {
    this._lineNumbersWidth = data;
  }

  get paddingLineNumbersRight(): number {
    return this._paddingLineNumbersRight;
  }

  set paddingLineNumbersRight(data: number) {
    this._paddingLineNumbersRight = data;
  }

  get topNumberHeight(): number {
    return this._topNumberHeight;
  }

  set topNumberHeight(data: number) {
    this._topNumberHeight = data;
  }

  get paddingCanvasTop(): number {
    return this.rowHeight / 2 + this.topNumberHeight / 1.2;
  }
}

export default Params;
