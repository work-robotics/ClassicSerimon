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

    this.params.preMeasureFontSize["F"] = this.getTextWidth("あ");
    this.params.preMeasureFontSize["W"] = this.getTextWidth("あ");
    this.params.preMeasureFontSize["A"] = this.getTextWidth("A");
    this.params.preMeasureFontSize["H"] = this.getTextWidth("A");
    this.params.preMeasureFontSize["Na"] = this.getTextWidth("A");
    this.params.preMeasureFontSize["N"] = this.getTextWidth("A");
  }

  public getTextWidth(data: string): number {
    this.tempText.text(data);
    return this.tempText.getTextWidth();
  }
}

export default Common;
