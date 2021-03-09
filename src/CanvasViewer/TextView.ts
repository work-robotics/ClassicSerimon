import Konva from "konva";
import Params from "./Params";
import State from "./State";

class TextView {
  private params: Params;
  private state: State;
  private mainStage: Konva.Stage;

  /* テキスト */
  private textLayer: Konva.Layer | undefined;
  private textConfig: Konva.TextConfig | undefined;
  private tempText: Konva.Text | undefined;

  private textDataContent: Konva.Text;

  private textLineBackground: Konva.Rect | undefined;
  private textLineNumContent: Konva.Text;

  private textTopBackground: Konva.Rect | undefined;
  private textTopNumContent: Konva.Text;

  private updateTextLayerTicking: boolean;

  constructor(stage: Konva.Stage, params: Params, state: State) {
    // 親のViewからStageとParam,Stateの参照を受け取る
    this.mainStage = stage;
    this.params = params;
    this.state = state;

    // フレーム制御のためのフラグ初期化
    this.updateTextLayerTicking = false;

    // 画面の高さなどから最大行数を計算（リサイズ時に要再計算）
    this.state.rowNumber = Math.floor((this.mainStage.height() - this.params.paddingCanvasTop) / this.params.rowHeight);

    // レイヤーの初期化
    this.initLayer();
  }

  public getTextWidth(data: string): number {
    this.tempText.text(data);
    return this.tempText.getTextWidth();
  }

  public calcMouseOverIndex() {
    // カーソル上の行番号を算出: 0～総行数or最大データ数の範囲
    this.state.mouseOverIndex.y = Math.max(
      Math.min(
        this.state.rowBottomIndex - this.state.rowTopIndex - 1,
        Math.floor(this.state.mousePosition.y / this.params.rowHeight)
      ),
      0
    );

    // カーソル上の列番号を算出
    this.state.mouseOverIndex.x = this.getColumnPosition(this.state.mouseOverIndex.y, this.state.mousePosition.x);
  }

  public getColumnPosition(targetRow: number, x: number): number {
    // オフセットの余白サイズを考慮したX座標を計算
    const offsetedX = x - this.params.lineNumbersWidth - this.params.paddingLineNumbersRight;
    // offsetedXがマイナスの場合（左にはみ出した状態）
    if (offsetedX < 0) {
      return 0;
    }
    // 左から探索してヒットした場所を返す
    let sum = 0;
    for (let index = 0; index < this.state.viewTextDatas[targetRow].length; index++) {
      const buf = this.state.renderDatasWidth[targetRow][index] / 2;
      sum += buf;
      if (sum > offsetedX) {
        return index;
      }
      sum += buf;
    }
    // ヒットしなかった場合は最大値を返す
    return this.state.viewTextDatas[targetRow].length;
  }

  // レイヤー初期化関数
  private initLayer(): void {
    this.textLayer = new Konva.Layer();

    // インデックスの初期化
    this.state.rowTopIndex = 0;
    this.state.rowBottomIndex = 0;

    // 行番号の背景
    this.textLineBackground = new Konva.Rect({
      fill: "#424242",
      width: this.params.lineNumbersWidth,
      height: this.mainStage.height(),
    });

    // 列番号の背景
    this.textTopBackground = new Konva.Rect({
      fill: "#333333",
      width: this.mainStage.width(),
      height: this.params.topNumberHeight,
    });

    // テキストの共通設定
    this.textConfig = {
      fontSize: this.params.fontSize,
      fontFamily: this.params.fontFamily,
      lineHeight: this.params.rowHeight / this.params.fontSize,
    };

    // テキスト検査用のテキスト
    this.tempText = new Konva.Text({ ...this.textConfig });

    // データ表示のテキスト
    this.textDataContent = new Konva.Text({
      ...this.textConfig,
      x: this.params.lineNumbersWidth + this.params.paddingLineNumbersRight,
      y: this.params.paddingCanvasTop,
    });

    // 行番号のテキスト
    this.textLineNumContent = new Konva.Text({
      ...this.textConfig,
      y: this.params.paddingCanvasTop,
      fill: "#FFF",
      align: "center",
      width: this.params.lineNumbersWidth,
    });

    // 列番号のテキスト
    this.textTopNumContent = new Konva.Text({
      ...this.textConfig,
      x: this.params.lineNumbersWidth + this.params.paddingLineNumbersRight,
      y: this.params.rowHeight / 3,
      fill: "#FFF",
      width: this.mainStage.width(),
    });

    let newTextTopNumContent = "";
    for (let i = 0; i < this.params.maxLineNum; i++) {
      newTextTopNumContent += ("00" + i.toString(16).toUpperCase()).substr(-2) + " ";
    }
    this.textTopNumContent.text(newTextTopNumContent);

    // レイヤに追加
    this.textLayer.add(this.textTopBackground);
    this.textLayer.add(this.textTopNumContent);
    this.textLayer.add(this.textLineBackground);
    this.textLayer.add(this.textLineNumContent);
    this.textLayer.add(this.textDataContent);
    this.mainStage.add(this.textLayer);
  }

  public updateLayer(): void {
    if (this.updateTextLayerTicking == false) {
      requestAnimationFrame(() => {
        this.updateContents();
        this.textLayer.batchDraw();
        this.updateTextLayerTicking = false;
      });
    }
    this.updateTextLayerTicking = true;
  }

  private updateContents() {
    // 行番号の背景の再設定
    this.textLineBackground.height(this.mainStage.height());
    this.textTopBackground.width(this.mainStage.width() - 20);
    this.textTopNumContent.width(this.mainStage.width() - 20);
    // 画面の高さなどから最大行数を計算
    this.state.rowNumber = Math.floor((this.mainStage.height() - this.params.paddingCanvasTop) / this.params.rowHeight);

    // データ数からインデックスの位置を再計算
    if (this.state.rawDatas.length < this.state.rowNumber) {
      this.state.rowTopIndex = 0;
      this.state.rowBottomIndex = this.state.rawDatas.length;
    } else {
      this.state.rowBottomIndex = this.state.rowTopIndex + this.state.rowNumber;
    }

    let newTextLineNumContent = "";
    this.state.viewTextDatas = [];
    this.state.renderDatasWidth = [];
    this.state.rawDatas.slice(this.state.rowTopIndex, this.state.rowBottomIndex).forEach((data, index) => {
      this.state.viewTextDatas.push("");
      this.state.renderDatasWidth.push([]);

      for (const strs of this.binaryFormatStr(data)) {
        for (const s of strs) {
          this.state.viewTextDatas[index] += s;
          this.state.renderDatasWidth[index].push(this.getTextWidth(s));
        }
      }

      newTextLineNumContent += ("0000000000" + (index + this.state.rowTopIndex)).slice(-8) + "\n";
    });
    this.textDataContent.text(this.state.viewTextDatas.join("\n"));
    this.textLineNumContent.text(newTextLineNumContent);
  }

  public binaryFormatStr(data: number[], addSpace: boolean = true): string {
    let content = "";
    for (let i in data) {
      content += data[i].toString(16);
      if (addSpace && parseInt(i) != data.length - 1) content += " ";
    }
    return content;
  }
}

export default TextView;
