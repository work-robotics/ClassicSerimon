import Konva from "konva";
import Params from "./Params";
import State from "./State";

class ScrollView {
  private params: Params;
  private state: State;
  private mainStage: Konva.Stage;

  /* スクロール */
  private scrollLayer: Konva.Layer | undefined;
  private scrollBar: Konva.Rect | undefined;
  private scrollBarBackground: Konva.Rect | undefined;
  private updateScrollLayerTicking: boolean;
  private scrollTimer: NodeJS.Timeout | undefined;
  private updateHandler: () => void;
  private updateDragHandler: () => void;
  private mouseEnterHandler: () => void;
  private mouseLeaveHandler: () => void;

  constructor(
    stage: Konva.Stage,
    params: Params,
    state: State,
    updateHandler: () => void,
    updateDragHandler: () => void,
    mouseEnterHandler: () => void = () => {},
    mouseLeaveHandler: () => void = () => {}
  ) {
    // 親のViewからStageとParam,Stateの参照を受け取る
    this.mainStage = stage;
    this.params = params;
    this.state = state;
    this.updateHandler = updateHandler;
    this.updateDragHandler = updateDragHandler;
    this.mouseEnterHandler = mouseEnterHandler;
    this.mouseLeaveHandler = mouseLeaveHandler;

    // フレーム制御のためのフラグ初期化
    this.updateScrollLayerTicking = false;

    // レイヤーの初期化
    this.initLayer();
  }

  // レイヤーの初期化関数
  public initLayer(): void {
    this.scrollLayer = new Konva.Layer();
    // スクロールバーの共通設定
    const BarConfig: Konva.RectConfig = {
      width: 20,
      opacity: 0.8,
    };

    // スクロールバーの背景
    this.scrollBarBackground = new Konva.Rect({ ...BarConfig, fill: "#CCC" });

    // スクロールバー
    this.scrollBar = new Konva.Rect({
      ...BarConfig,
      height: 20,
      fill: "#333",
      draggable: true,
      dragBoundFunc: this.scrollBarDragEvent.bind(this),
    });

    // レイヤに追加
    this.scrollLayer.add(this.scrollBarBackground);
    this.scrollLayer.add(this.scrollBar);
    this.mainStage.add(this.scrollLayer);

    // イベント登録
    this.scrollBar.on("mouseenter", this.mouseEnterHandler);
    this.scrollBar.on("mouseleave", this.mouseLeaveHandler);
    this.scrollBarBackground.on("mouseenter", this.mouseEnterHandler);
    this.scrollBarBackground.on("mouseleave", this.mouseLeaveHandler);
  }

  public updateContents() {
    // スクロールバーの表示設定
    const rawDatasSize = Math.ceil(this.state.rawDatas.size() / this.params.maxLineNum);
    if (rawDatasSize < this.state.rowNumber) {
      // スクロールバーを非表示に設定
      this.scrollBarBackground.visible(false);
      this.scrollBar.visible(false);
    } else {
      if (!this.scrollBar.visible()) {
        this.state.enableAutoScroll = true;
      }
      // スクロールバーの表示を有効
      this.scrollBarBackground.visible(true);
      this.scrollBar.visible(true);

      // scrollHeightを更新
      this.state.scrollHeight = Math.ceil(
        (rawDatasSize - this.state.rowNumber) * this.params.rowHeight +
          this.mainStage.height() -
          this.params.paddingCanvasTop
      );

      // scrollTopを更新
      if (this.state.enableAutoScroll) {
        this.state.scrollTop = this.state.scrollHeight - this.mainStage.height();
      } else {
        this.state.scrollTop = Math.ceil(
          Math.max(Math.min(this.state.scrollTop, this.state.scrollHeight - this.mainStage.height()), 0)
        );
      }

      // スクロールバー背景の更新
      this.scrollBarBackground.x(this.mainStage.width() - this.scrollBar.width());
      this.scrollBarBackground.height(this.mainStage.height());

      // スクロールバーの更新
      this.scrollBar.height(
        Math.max((this.mainStage.height() * this.mainStage.height()) / this.state.scrollHeight, 20)
      );
      const a = this.state.scrollHeight - this.mainStage.height();
      const b = this.state.scrollTop * (this.mainStage.height() - this.scrollBar.height());
      this.scrollBar.x(this.mainStage.width() - this.scrollBar.width());
      const y_pos = b / a;
      if (isNaN(y_pos)) {
        this.scrollBar.y(0);
      } else {
        this.scrollBar.y(y_pos);
      }
    }

    // rowTopIndex, rowBottomIndexの算出(スクロールが必要な状況でのみ)
    if (rawDatasSize > this.state.rowNumber) {
      if (this.state.scrollHeight - this.mainStage.height() == this.state.scrollTop) {
        this.state.rowTopIndex = rawDatasSize - this.state.rowNumber;
        this.state.rowBottomIndex = rawDatasSize;
      } else {
        this.state.rowTopIndex = Math.ceil(this.state.scrollTop / this.params.rowHeight);
        this.state.rowBottomIndex = this.state.rowTopIndex + this.state.rowNumber;
      }

      this.updateHandler();
    }
  }

  // スクロールバーの移動時のイベント関数
  private scrollBarDragEvent(pos: Konva.Vector2d): Konva.Vector2d {
    const a = pos.y * (this.state.scrollHeight - this.mainStage.height());
    const b = this.mainStage.height() - this.scrollBar.height();
    this.state.scrollTop = Math.ceil(Math.max(Math.min(a / b, this.state.scrollHeight - this.mainStage.height()), 0));
    pos.y = Math.max(Math.min(pos.y, this.mainStage.height() - this.scrollBar.height()), 0);
    pos.x = this.mainStage.width() - this.scrollBar.width();
    this.updateLayer();
    this.state.enableAutoScroll = pos.y == this.mainStage.height() - this.scrollBar.height();
    return pos;
  }

  public updateLayer(moveLastLine: boolean = false): void {
    const rawDatasSize = Math.ceil(this.state.rawDatas.size() / this.params.maxLineNum);
    if (this.updateScrollLayerTicking == false) {
      requestAnimationFrame(() => {
        // moveLastLineが有効な場合、scrollTopを最後尾に移動
        if (moveLastLine == true) {
          // scrollTopを先最後尾に持っていくにはscrollHeightを先に計算する必要がある
          this.state.scrollHeight = Math.ceil(
            (rawDatasSize - this.state.rowNumber) * this.params.rowHeight +
              this.mainStage.height() -
              this.params.paddingCanvasTop
          );
          // scrollTopの計算
          this.state.scrollTop = this.state.scrollHeight - this.mainStage.height();
        }
        // スクロールバーの更新
        this.updateContents();

        // レイヤーの更新
        this.scrollLayer.batchDraw();
        this.updateScrollLayerTicking = false;
      });
    }
    this.updateScrollLayerTicking = true;
  }

  public mouseDragScrollStop() {
    clearInterval(this.scrollTimer);
    this.scrollTimer = undefined;
  }

  public mouseDragScrollEvent() {
    if (this.state.mousePosition.y <= 0) {
      if (this.scrollTimer == undefined) {
        this.scrollTimer = setInterval(() => {
          this.state.scrollTop -= Math.abs(this.state.mousePosition.y) * 0.1;
          this.state.enableAutoScroll = false;
          this.updateDragHandler();
        }, 1);
      }
    } else if (this.state.mousePosition.y >= this.params.rowHeight * this.state.rowNumber) {
      if (this.scrollTimer == undefined) {
        this.scrollTimer = setInterval(() => {
          this.state.scrollTop += 0.1 * (this.state.mousePosition.y - this.params.rowHeight * this.state.rowNumber);
          this.state.enableAutoScroll = this.state.scrollHeight - this.mainStage.height() < this.state.scrollTop;
          this.updateDragHandler();
        }, 1);
      }
    } else {
      clearInterval(this.scrollTimer);
      this.scrollTimer = undefined;
    }
  }
}

export default ScrollView;
