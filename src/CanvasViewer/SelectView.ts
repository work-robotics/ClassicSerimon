import Konva from "konva";
import Params, { ViewState } from "./Params";

class SelectView {
  private params: Params;
  private state: ViewState;
  private mainStage: Konva.Stage;
  private tempText: Konva.Text;

  /* セレクト */
  private selectLayer: Konva.Layer | undefined;

  private selectPolyTopContents: Konva.Line;
  private selectPolyMiddleContents: Konva.Line;
  private selectPolyBottomContents: Konva.Line;

  private updateSelectLayerTicking: boolean;

  constructor(stage: Konva.Stage, params: Params, state: ViewState) {
    // 親のViewからStageとParam,ViewStateの参照を受け取る
    this.mainStage = stage;
    this.params = params;
    this.state = state;

    // フレーム制御のためのフラグ初期化
    this.updateSelectLayerTicking = false;

    // レイヤーの初期化
    this.initLayer();
  }

  public resetSelectIndex() {
    this.state.selectedIndexs = {
      top: { row: undefined, start: undefined, end: undefined },
      bottom: { row: undefined, start: undefined, end: undefined },
      origin: { row: undefined, column: undefined },
    };
  }

  // レイヤーの初期化関数
  private initLayer(): void {
    this.selectLayer = new Konva.Layer({ listening: false });

    // セレクト情報の初期化
    this.state.selectedIndexs = {
      top: { row: undefined, start: undefined, end: undefined },
      bottom: { row: undefined, start: undefined, end: undefined },
      origin: { row: undefined, column: undefined },
    };

    // セレクトボックスの共通設定
    const SelectConfig: Konva.RectConfig = {
      x: this.params.lineNumbersWidth + this.params.paddingLineNumbersRight,
      fill: this.params.selectCellColor,
      opacity: 0.5,
      width: 5,
      height: this.params.rowHeight,
    };

    // テキスト検査用のテキスト
    this.tempText = new Konva.Text({
      fontSize: this.params.fontSize,
      fontFamily: this.params.fontFamily,
      lineHeight: this.params.rowHeight / this.params.fontSize,
    });

    const lineConfig: Konva.LineConfig = {
      points: [],
      fill: this.params.selectCellColor,
      opacity: 0.2,
      strokeEnabled: false,
      closed: true,
    };

    this.selectPolyTopContents = new Konva.Line({ ...lineConfig });
    this.selectPolyMiddleContents = new Konva.Line({ ...lineConfig });
    this.selectPolyBottomContents = new Konva.Line({ ...lineConfig });

    // レイヤーに追加
    this.selectLayer.add(this.selectPolyTopContents);
    this.selectLayer.add(this.selectPolyMiddleContents);
    this.selectLayer.add(this.selectPolyBottomContents);
    this.mainStage.add(this.selectLayer);
  }

  private getTextWidth(data: string): number {
    this.tempText.text(data);
    return this.tempText.getTextWidth();
  }

  public selectEvent() {
    // セレクトの原点が-1されている場合は初期化
    if (this.state.selectedIndexs.origin.row == undefined || this.state.selectedIndexs.origin.column == undefined) {
      this.state.selectedIndexs.top.row = this.state.rowTopIndex + this.state.mouseOverIndex.y;
      this.state.selectedIndexs.bottom.row = this.state.rowTopIndex + this.state.mouseOverIndex.y;
      this.state.selectedIndexs.origin.row = this.state.rowTopIndex + this.state.mouseOverIndex.y;
      this.state.selectedIndexs.origin.column = this.state.mouseOverIndex.x;
    }
    // // セレクト原点からの縦横方向の移動量を計算
    const rowDiff = this.state.selectedIndexs.origin.row - (this.state.rowTopIndex + this.state.mouseOverIndex.y);
    const columnDiff = this.state.mouseOverIndex.x - this.state.selectedIndexs.origin.column;

    // 変数名が長いので短く
    const rowTopIndex = this.state.rowTopIndex;
    const rowBottomIndex = this.state.rowBottomIndex;

    // 原点の行の場合
    if (rowDiff == 0) {
      this.state.selectedIndexs.top.row = this.state.selectedIndexs.origin.row;
      this.state.selectedIndexs.bottom.row = this.state.selectedIndexs.origin.row;
      if (columnDiff < 0) {
        this.state.selectedIndexs.top.start = this.state.selectedIndexs.origin.column + columnDiff; // 左方向であればスタート位置に差分を反映
        this.state.selectedIndexs.top.end = this.state.selectedIndexs.origin.column; // // エンド位置を原点に設定
      } else if (columnDiff > 0) {
        this.state.selectedIndexs.top.end = this.state.selectedIndexs.origin.column + columnDiff; // 右方向であればエンド位置に差分を反映
        this.state.selectedIndexs.top.start = this.state.selectedIndexs.origin.column; // スタート位置を原点に設定
      } else {
        // 原点にいる場合は初期化
        this.state.selectedIndexs.top.start = this.state.selectedIndexs.origin.column;
        this.state.selectedIndexs.top.end = this.state.selectedIndexs.origin.column;
      }
      this.state.selectedIndexs.bottom.start = this.state.selectedIndexs.origin.column;
      this.state.selectedIndexs.bottom.end = this.state.selectedIndexs.origin.column;
    }
    // 上移動の場合
    if (rowDiff > 0) {
      // Top設定
      this.state.selectedIndexs.top.row = this.state.selectedIndexs.origin.row - rowDiff;
      // 一般的なセレクタは上に行くと原点より右側の項目をすべて選択することが多い（トップの場合）
      this.state.selectedIndexs.top.start = this.state.selectedIndexs.origin.column;
      this.state.selectedIndexs.top.end = this.state.renderDatas[rowTopIndex + this.state.mouseOverIndex.y].length;

      // Bottom設定(差分がプラス=原点以下は選択されていない=Bottomを原点に)
      this.state.selectedIndexs.bottom.row = this.state.selectedIndexs.origin.row;
      // 一般的なセレクタは上に行くと原点より左側の項目をすべて選択することが多い（ボトムの場合）
      this.state.selectedIndexs.bottom.start = 0;
      this.state.selectedIndexs.bottom.end = this.state.selectedIndexs.origin.column;

      if (columnDiff < 0) {
        this.state.selectedIndexs.top.start = this.state.selectedIndexs.origin.column + columnDiff; // 左方向であればスタート位置に差分を反映
      } else if (columnDiff > 0) {
        this.state.selectedIndexs.top.start = this.state.selectedIndexs.origin.column + columnDiff; // 右方向であればスタート位置に差分を反映（選択打ち消し）
      } else {
        this.state.selectedIndexs.top.start = this.state.selectedIndexs.origin.column; // 原点にいる場合は初期化
      }
    }

    if (rowDiff < 0) {
      // Top設定(原点に設定)
      this.state.selectedIndexs.top.row = this.state.selectedIndexs.origin.row;
      // 一般的なセレクタは上に行くと原点より右側の項目をすべて選択することが多い（トップの場合）
      this.state.selectedIndexs.top.start = this.state.selectedIndexs.origin.column;
      this.state.selectedIndexs.top.end = this.state.renderDatas[this.state.selectedIndexs.origin.row].length;

      // Bottom設定(差分がプラス=原点以下は選択されていない=Bottomを原点に)
      this.state.selectedIndexs.bottom.row = this.state.selectedIndexs.origin.row - rowDiff;
      // 一般的なセレクタは上に行くと原点より左側の項目をすべて選択することが多い（ボトムの場合）
      this.state.selectedIndexs.bottom.start = 0;
      this.state.selectedIndexs.bottom.end = this.state.selectedIndexs.origin.column;

      if (columnDiff < 0) {
        this.state.selectedIndexs.bottom.end = this.state.selectedIndexs.origin.column + columnDiff; // 左方向であればスタート位置に差分を反映
      } else if (columnDiff > 0) {
        this.state.selectedIndexs.bottom.end = this.state.selectedIndexs.origin.column + columnDiff; // 右方向であればスタート位置に差分を反映（選択打ち消し）
      } else {
        this.state.selectedIndexs.bottom.end = this.state.selectedIndexs.origin.column; // 原点にいる場合は初期化
      }
    }
  }

  public updateContents() {
    // 変数名が長いので短く
    const rowTopIndex = this.state.rowTopIndex;
    const rowBottomIndex = this.state.rowBottomIndex;
    const topRow = this.state.selectedIndexs.top.row;
    const topStart = this.state.selectedIndexs.top.start;
    const topEnd = this.state.selectedIndexs.top.end;

    const bottomRow = this.state.selectedIndexs.bottom.row;
    const bottomStart = this.state.selectedIndexs.bottom.start;
    const bottomEnd = this.state.selectedIndexs.bottom.end;

    let middlePoints: number[] = [];

    this.state.renderDatas.slice(rowTopIndex, rowBottomIndex).forEach((data, index) => {
      const h = this.params.rowHeight;
      // 上段
      if (topRow == rowTopIndex + index && topStart >= 0 && topEnd >= 0) {
        const startX = this.getTextWidth(this.state.renderDatas[rowTopIndex + index].slice(0, topStart));
        const endX = this.getTextWidth(this.state.renderDatas[rowTopIndex + index].slice(0, topEnd));
        const y = this.params.paddingCanvasTop + index * this.params.rowHeight;
        const x = startX + this.params.lineNumbersWidth + this.params.paddingLineNumbersRight;
        const w = endX - startX;
        this.selectPolyTopContents.points([x, y, x + w, y, x + w, y + h + 0.1, x, y + h + 0.1]);
      }
      // 下段
      if (bottomRow == rowTopIndex + index && bottomStart >= 0 && bottomStart >= 0) {
        const startX = this.getTextWidth(this.state.renderDatas[rowTopIndex + index].slice(0, bottomStart));
        const endX = this.getTextWidth(this.state.renderDatas[rowTopIndex + index].slice(0, bottomEnd));
        const y = this.params.paddingCanvasTop + index * this.params.rowHeight;
        const x = startX + this.params.lineNumbersWidth + this.params.paddingLineNumbersRight;
        const w = endX - startX;
        this.selectPolyBottomContents.points([x, y - 0.1, x + w, y - 0.1, x + w, y + h, x, y + h]);
      }
      // 中間層
      if (topRow < rowTopIndex + index && bottomRow > rowTopIndex + index) {
        const middleWidth = this.getTextWidth(data);
        const endX = this.getTextWidth(this.state.renderDatas[rowTopIndex + index].slice(0, middleWidth + 1));
        const y = this.params.paddingCanvasTop + index * this.params.rowHeight;
        const x = this.params.lineNumbersWidth + this.params.paddingLineNumbersRight;
        const w = endX;
        middlePoints.push(...[x, y, x, y + h, x + w, y + h, x + w, y, x, y]);
      }
    });
    // 表示設定
    this.selectPolyMiddleContents.points(middlePoints);
    this.selectPolyTopContents.visible(rowTopIndex <= topRow && rowBottomIndex > topRow);
    this.selectPolyBottomContents.visible(rowTopIndex <= bottomRow && rowBottomIndex > bottomRow);

    if (this.state.selectedIndexs.top.row == this.state.selectedIndexs.bottom.row) {
      this.selectPolyBottomContents.visible(false);
    }
  }

  public updateLayer(): void {
    if (this.updateSelectLayerTicking == false) {
      requestAnimationFrame(() => {
        // セレクトエリアを描画
        this.updateContents();

        // レイヤーの更新
        this.selectLayer.batchDraw();
        this.updateSelectLayerTicking = false;
      });
    }
    this.updateSelectLayerTicking = true;
  }
}

export default SelectView;
