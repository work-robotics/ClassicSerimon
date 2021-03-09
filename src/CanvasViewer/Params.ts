export class Params {
  public rowHeight: number;
  public fontSize: number;
  public fontColor: string;
  public backgroundColor: string;
  public selectCellColor: string;
  public fontFamily: string;
  public lineNumbersWidth: number;
  public paddingLineNumbersRight: number;
  public paddingCanvasTop: number;

  constructor() {
    this.rowHeight = 20;
    this.fontSize = 16;
    this.fontColor = "#000";
    this.backgroundColor = "#fff";
    this.selectCellColor = "#0000ff";
    this.fontFamily = "JetBrains Mono, Source Han Code JP, Menlo, Consolas";
    this.lineNumbersWidth = 90;
    this.paddingLineNumbersRight = 10;
    this.paddingCanvasTop = this.rowHeight / 2;
  }
}

export default Params;
