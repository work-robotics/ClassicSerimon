export type UserConfig = {
  fontSize: number;
  rowHeight: number;
  fontFamily: string;
  maxLineNum: number;
  asciiMode: boolean;
  asciiMaxWidth: number;
};

export class Params {
  private _userConfig: UserConfig;
  private _lineNumbersWidth: number;
  private _paddingLineNumbersRight: number;
  private _topNumberHeight: number;
  public asciiFontWidthTable: number[];

  constructor(userConfig: UserConfig) {
    this._userConfig = userConfig;
    this._lineNumbersWidth = 90;
    this._paddingLineNumbersRight = 10;
    this._topNumberHeight = 30;
    this.asciiFontWidthTable = [];
  }

  get userConfig(): UserConfig {
    return this._userConfig;
  }

  set userConfig(data: UserConfig) {
    this._userConfig = data;
  }

  get rowHeight(): number {
    return this._userConfig.rowHeight;
  }

  set rowHeight(data: number) {
    this._userConfig.rowHeight = data;
  }

  get fontSize(): number {
    return this._userConfig.fontSize;
  }

  set fontSize(data: number) {
    this._userConfig.fontSize = data;
  }

  get fontFamily(): string {
    return this._userConfig.fontFamily;
  }

  set fontFamily(data: string) {
    this._userConfig.fontFamily = data;
  }

  get maxLineNum(): number {
    return this._userConfig.maxLineNum;
  }

  set maxLineNum(data: number) {
    this._userConfig.maxLineNum = data;
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
