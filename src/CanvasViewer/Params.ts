export class Params {
  public rowHeight: number;
  public fontSize: number;
  public selectCellColor: string;
  public fontFamily: string;
  public lineNumbersWidth: number;
  public paddingLineNumbersRight: number;
  public paddingCanvasTop: number;
  public maxLineNum: number;
  public topNumberHeight: number;

  constructor() {
    this.rowHeight = 20;
    this.fontSize = 16;
    this.selectCellColor = "#0000ff";
    this.fontFamily = "JetBrains Mono, Source Han Code JP, Menlo, Consolas";
    this.lineNumbersWidth = 90;
    this.paddingLineNumbersRight = 10;
    this.topNumberHeight = 30;
    this.paddingCanvasTop = this.rowHeight / 2 + this.topNumberHeight / 1.2;
    this.maxLineNum = 20;
  }
}

export default Params;
