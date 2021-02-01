export class ViewState {
  public rowTopIndex: number;
  public rowBottomIndex: number;
  public renderDatas: string[];
  public renderDatasWidth: number[][];
  public scrollHeight: number;
  public scrollTop: number;
  public rowNumber: number;

  public mouseOriginPosition: { x: number; y: number };
  public mousePosition: { x: number; y: number };
  public mouseOverIndex: { x: number; y: number };
  public isMovedMouse: boolean;

  public selectedIndexs: {
    top: { row: number; start: number; end: number };
    bottom: { row: number; start: number; end: number };
    origin: { row: number; column: number };
  };

  constructor() {
    this.rowTopIndex = 0;
    this.rowBottomIndex = 0;
    this.renderDatas = [];
    this.renderDatasWidth = [];
    this.scrollHeight = 0;
    this.scrollTop = 0;
    this.rowNumber = 0;
    this.mouseOriginPosition = { x: 0, y: 0 };
    this.mousePosition = { x: 0, y: 0 };
    this.mouseOverIndex = { x: 0, y: 0 };
    this.isMovedMouse = false;
    this.selectedIndexs = {
      top: { row: -1, start: -1, end: -1 },
      bottom: { row: -1, start: -1, end: -1 },
      origin: { row: -1, column: -1 },
    };
  }
}

class Params {
  /* パラメータ */
  private _rowHeight: number;
  private _fontSize: number;
  private _fontColor: string;
  private _backgroundColor: string;
  private _selectCellColor: string;
  private _fontFamily: string;
  private _lineNumbersWidth: number;
  private _paddingLineNumbersRight: number;
  private _paddingCanvasTop: number;

  constructor(
    rowHeigh: number = 20,
    fontSize: number = 16,
    fontColor: string = "#000",
    backgroundColor: string = "#fff",
    selectCellColor: string = "#0000ff",
    fontFamily: string = "Menlo, Consolas",
    lineNumbersWidth: number = 90,
    paddingLineNumbersRight: number = 10
  ) {
    this._rowHeight = rowHeigh;
    this._fontSize = fontSize;
    this._fontColor = fontColor;
    this._backgroundColor = backgroundColor;
    this._selectCellColor = selectCellColor;
    this._fontFamily = fontFamily;
    this._lineNumbersWidth = lineNumbersWidth;
    this._paddingLineNumbersRight = paddingLineNumbersRight;
    this._paddingCanvasTop = this._rowHeight / 2;
  }

  get rowHeight(): number {
    return this._rowHeight;
  }

  get fontSize(): number {
    return this._fontSize;
  }

  get fontColor(): string {
    return this._fontColor;
  }

  get backgroundColor(): string {
    return this._backgroundColor;
  }

  get selectCellColor(): string {
    return this._selectCellColor;
  }

  get fontFamily(): string {
    return this._fontFamily;
  }

  get lineNumbersWidth(): number {
    return this._lineNumbersWidth;
  }

  get paddingLineNumbersRight(): number {
    return this._paddingLineNumbersRight;
  }

  get paddingCanvasTop(): number {
    return this._paddingCanvasTop;
  }
}

export default Params;
