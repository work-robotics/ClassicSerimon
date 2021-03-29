import { Cookies } from "electron";
import Konva from "konva";
import Params from "./Params";
import State from "./State";
import Common from "./Common";

class TextView {
  private params: Params;
  private state: State;
  private common: Common;
  private mainStage: Konva.Stage;

  /* テキスト */
  private textLayer: Konva.Layer | undefined;
  private textConfig: Konva.TextConfig | undefined;

  private textDataContent: Konva.Text;

  private textLineBackground: Konva.Rect | undefined;
  private textLineNumContent: Konva.Text;

  private textTopBackground: Konva.Rect | undefined;
  private textTopNumContent: Konva.Text;

  private textBorder: Konva.Rect | undefined;

  private updateTextLayerTicking: boolean;

  constructor(stage: Konva.Stage, params: Params, state: State, common: Common) {
    // 親のViewからStageとParam,Stateの参照を受け取る
    this.mainStage = stage;
    this.params = params;
    this.state = state;
    this.common = common;

    // フレーム制御のためのフラグ初期化
    this.updateTextLayerTicking = false;

    // 画面の高さなどから最大行数を計算（リサイズ時に要再計算）
    this.state.rowNumber = Math.floor((this.mainStage.height() - this.params.paddingCanvasTop) / this.params.rowHeight);

    // レイヤーの初期化
    this.initLayer();
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
    this.state.mouseOverPastIndex.y = this.state.mouseOverIndex.y;
  }

  public getColumnPosition(targetRow: number, x: number): number {
    if (targetRow >= this.state.viewTextDatas.length) {
      return 0;
    }
    // オフセットの余白サイズを考慮したX座標を計算
    const offsetedX = x - this.params.lineNumbersWidth - this.params.paddingLineNumbersRight;
    // offsetedXがマイナスの場合（左にはみ出した状態）
    if (offsetedX < 0) {
      return 0;
    }
    // 左から探索してヒットした場所を返す
    let sum = 0;

    if (this.state.mouseOverPastIndex.y != this.state.mouseOverIndex.y) {
      this.state.renderDataWidth = [];
      for (var i = 0; i < this.state.viewTextDatas[targetRow].length; i++) {
        this.state.renderDataWidth.push(this.common.getTextWidth(this.state.viewTextDatas[targetRow][i]));
      }
    }

    for (let index = 0; index < this.state.viewTextDatas[targetRow].length; index++) {
      const buf = this.state.renderDataWidth[index] / 2;
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
  public initLayer(): void {
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

    // ボーダの背景
    this.textBorder = new Konva.Rect({
      x: this.params.lineNumbersWidth + this.params.paddingLineNumbersRight + this.params.userConfig.asciiMaxWidth + 20,
      y: this.params.paddingCanvasTop,
      fill: "#f2f2f2",
      width: 2,
      height: 0,
    });

    // テキストの共通設定
    this.textConfig = {
      fontSize: this.params.fontSize,
      fontFamily: this.params.fontFamily,
      lineHeight: this.params.rowHeight / this.params.fontSize,
    };

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
      newTextTopNumContent += ("00" + (i + 1).toString()).substr(-2) + " ";
    }
    this.textTopNumContent.text(newTextTopNumContent);

    if (this.params.userConfig.asciiMode) {
      this.textTopNumContent.visible(false);
    } else {
      this.textTopNumContent.visible(true);
      this.textBorder.visible(false);
    }

    // レイヤに追加
    this.textLayer.add(this.textTopBackground);
    this.textLayer.add(this.textTopNumContent);
    this.textLayer.add(this.textLineBackground);
    this.textLayer.add(this.textLineNumContent);
    this.textLayer.add(this.textBorder);
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

  public updateContents() {
    // 行番号の背景の再設定
    this.textLineBackground.height(this.mainStage.height());
    this.textBorder.height(this.mainStage.height() - 40);
    if (this.state.isVisibleScroolBar) {
      this.textTopBackground.width(this.mainStage.width() - 20);
      this.textTopNumContent.width(this.mainStage.width() - 20);
    } else {
      this.textTopBackground.width(this.mainStage.width());
      this.textTopNumContent.width(this.mainStage.width());
    }

    // 画面の高さなどから最大行数を計算
    this.state.rowNumber = Math.floor((this.mainStage.height() - this.params.paddingCanvasTop) / this.params.rowHeight);

    // データ数からインデックスの位置を再計算
    let rawDatasSize = 0;
    if (this.params.userConfig.asciiMode) {
      rawDatasSize = this.state.enterPoint.size();
    } else {
      rawDatasSize = Math.ceil(this.state.rawDatas.size() / this.params.maxLineNum);
    }
    if (rawDatasSize < this.state.rowNumber) {
      this.state.rowTopIndex = 0;
      this.state.rowBottomIndex = rawDatasSize;
    } else {
      this.state.rowBottomIndex = this.state.rowTopIndex + this.state.rowNumber;
    }

    let newTextLineNumContent = "";
    this.state.viewTextDatas = [];
    let counter = 0;
    if (this.params.userConfig.asciiMode) {
      let render_datas = [];
      // データを一時的に取り出す
      while (1) {
        if (counter == this.state.rowNumber) {
          break;
        }
        // 範囲データを取り出す
        const area = this.state.enterPoint.slice(
          counter + this.state.rowTopIndex,
          counter + this.state.rowTopIndex + 2
        );
        // データが有効な場合は処理を継続
        if (area.length == 2) {
          const rawData = this.state.rawDatas.slice(area[0], area[1]);
          this.common.formCopyData(rawData);
          render_datas.push(this.asciiFormatStr(rawData));
        } else if (area.length == 1) {
          const rawData = this.state.rawDatas.slice(area[0], this.state.rawDatas.size());
          this.common.formCopyData(rawData);
          render_datas.push(this.asciiFormatStr(rawData));
          break;
        } else {
          break;
        }
        counter++;
      }
      for (let i = 0; i < render_datas.length; i++) {
        this.state.viewTextDatas.push("");
        newTextLineNumContent += ("0000000000" + (i + 1 + this.state.rowTopIndex)).slice(-8) + "\n";
        for (const strs of render_datas[i]) {
          for (const s of strs) {
            if (s != "\n") this.state.viewTextDatas[i] += s;
          }
        }
        this.state.viewTextDatas.push("");
      }
    } else {
      for (var i = 0; i < this.state.rowNumber; i++) {
        this.state.viewTextDatas.push("");
        for (const strs of this.binaryFormatStr(
          this.state.rawDatas.slice(
            (this.state.rowTopIndex + i) * this.params.maxLineNum,
            (this.state.rowTopIndex + i + 1) * this.params.maxLineNum
          )
        )) {
          for (const s of strs) {
            this.state.viewTextDatas[i] += s;
          }
        }
        newTextLineNumContent += ("0000000000" + (i + 1 + this.state.rowTopIndex)).slice(-8) + "\n";
      }
    }
    this.textDataContent.text(this.state.viewTextDatas.join("\n"));
    this.textLineNumContent.text(newTextLineNumContent);
  }

  public binaryFormatStr(data: number[], addSpace: boolean = true): string {
    let content = "";
    for (let i in data) {
      content += ("00" + data[i].toString(16).toUpperCase()).substr(-2);
      if (addSpace && parseInt(i) != data.length - 1) content += " ";
    }
    return content;
  }

  public asciiFormatStr(data: number[], addSpace: boolean = true): string {
    return new TextDecoder("utf8").decode(Uint8Array.of(...data));
  }
}

export default TextView;
