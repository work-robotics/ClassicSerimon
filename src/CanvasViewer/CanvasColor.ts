export class CanvasColor {
  public textLineBackground: string;
  public textTopBackground: string;
  public textBorder: string;
  public textLineNumContent: string;
  public textTopNumContent: string;

  public selectColor: string;

  public scrollBarBackground: string;
  public scrollBar: string;

  constructor() {
    this.textLineBackground = "#424242";
    this.textTopBackground = "#333333";
    this.textBorder = "#F2F2F2";
    this.textLineNumContent = "#FFF";
    this.textTopNumContent = "#FFF";
    this.selectColor = "#0000FF";
    this.scrollBarBackground = "#CCC";
    this.scrollBar = "#333";
  }
}

export default new CanvasColor();
