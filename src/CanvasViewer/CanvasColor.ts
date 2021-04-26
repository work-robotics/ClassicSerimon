import ConfigStore from "../ConfigStore";

export class CanvasColor {
  public textLineBackground: string;
  public textTopBackground: string;
  public textBorder: string;
  public textDataContent: string;
  public textLineNumContent: string;
  public textTopNumContent: string;

  public selectColor: string;

  public scrollBarBackground: string;
  public scrollBar: string;

  constructor() {
    if (ConfigStore.getData().darkMode) {
      this.setDarkColor();
    } else {
      this.setLightColor();
    }
  }

  public setLightColor() {
    this.textLineBackground = "#424242";
    this.textTopBackground = "#333333";
    this.textBorder = "#F2F2F2";
    this.textDataContent = "#000";
    this.textLineNumContent = "#FFF";
    this.textTopNumContent = "#FFF";
    this.selectColor = "#0000FF";
    this.scrollBarBackground = "#CCC";
    this.scrollBar = "#333";
  }
  public setDarkColor() {
    this.textLineBackground = "#21252B";
    this.textTopBackground = "#181b1f";
    this.textBorder = "#21242b";
    this.textDataContent = "#BBBBBB";
    this.textLineNumContent = "#BBBBBB";
    this.textTopNumContent = "#BBBBBB";
    this.selectColor = "#FFF";
    this.scrollBarBackground = "#CCC";
    this.scrollBar = "#333";
  }
}

export default new CanvasColor();
