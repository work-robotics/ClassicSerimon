import Konva from "konva";
import Params from "./Params";
import State from "./State";

export class Common {
  private params: Params;
  private state: State;
  private mainStage: Konva.Stage;

  private tempText: Konva.Text | undefined;

  constructor(stage: Konva.Stage, params: Params, state: State) {
    // 親のViewからStageとParam,Stateの参照を受け取る
    this.mainStage = stage;
    this.params = params;
    this.state = state;
    this.init();
  }

  public init() {
    // テキストの共通設定
    const textConfig = {
      fontSize: this.params.fontSize,
      fontFamily: this.params.fontFamily,
      lineHeight: this.params.rowHeight / this.params.fontSize,
    };
    // テキスト検査用のテキスト
    this.tempText = new Konva.Text({ ...textConfig });

    // 事前にASCIIの文字幅のテーブルを作成
    for (let i = 0; i < 256; i++) {
      this.params.asciiFontWidthTable.push(this.getTextWidth(String.fromCharCode(i)));
    }
  }

  public getTextWidth(data: string): number {
    this.tempText.text(data);
    return this.tempText.getTextWidth();
  }
}

export default Common;
