import Konva from "konva";
import Params, { UserConfig } from "./Params";
import { ExtendArray, State } from "./State";
import TextView from "./TextView";
import ScrollView from "./ScrollView";
import SelectView from "./SelectView";

class CanvasViewer {
  private mainStage: Konva.Stage;
  private params: Params;
  private state: State;
  private textView: TextView;
  private scrollView: ScrollView;
  private selectView: SelectView;

  private column_counter: number;

  constructor(
    id: string,
    option: UserConfig = {
      rowHeight: 20,
      fontSize: 16,
      fontFamily: "JetBrains Mono, Source Han Code JP, Menlo, Consolas",
      maxLineNum: 20,
    }
  ) {
    // 関数をバインド
    this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    this.mouseDownEvent = this.mouseDownEvent.bind(this);
    this.mouseUpEvent = this.mouseUpEvent.bind(this);
    this.mouseWheelEvent = this.mouseWheelEvent.bind(this);
    this.updateScrollHandler = this.updateScrollHandler.bind(this);
    this.updateDragScrollHandler = this.updateDragScrollHandler.bind(this);
    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this);
    this.copyEvent = this.copyEvent.bind(this);

    // 初期化
    this.mainStage = new Konva.Stage({ container: id });
    this.params = new Params(option);
    this.state = new State();
    this.textView = new TextView(this.mainStage, this.params, this.state);
    this.scrollView = new ScrollView(
      this.mainStage,
      this.params,
      this.state,
      this.updateScrollHandler,
      this.updateDragScrollHandler,
      this.mouseEnterHandler,
      this.mouseLeaveHandler
    );
    this.selectView = new SelectView(this.mainStage, this.params, this.state);
    this.column_counter = 0;

    // イベントの登録
    this.mainStage.container().addEventListener("mousedown", this.mouseDownEvent);
    this.mainStage.container().addEventListener("wheel", this.mouseWheelEvent);
    document.addEventListener("copy", this.copyEvent);

    // マウスカーソルはテキストモードにする
    this.mainStage.container().style.cursor = "text";
    this.mainStage.container().style.overflow = "hidden";
  }

  private mouseWheelEvent(event: WheelEvent): void {
    this.state.scrollTop += event.deltaY;
    this.state.enableAutoScroll = this.state.scrollHeight - this.mainStage.height() < this.state.scrollTop;
    if (this.state.isMovedMouse == true) {
      // scrollTopを変更したので強制的に反映
      this.scrollView.updateContents();
      // ドラッグスクロールと同じ処理を実行
      this.updateDragScrollHandler();
    } else {
      this.updateScrollHandler();
    }
  }

  private mouseDownEvent(event: MouseEvent): void {
    // 左クリックの場合
    if (event.button == 0) {
      document.addEventListener("mousemove", this.mouseMoveEvent);
      document.addEventListener("mouseup", this.mouseUpEvent);
    }
  }

  private mouseMoveEvent(event: MouseEvent): void {
    this.state.enableAutoScroll = false;
    // セレクタ初期化
    if (this.state.isMovedMouse == false) {
      this.selectView.resetSelectIndex();
    }
    // マウス座標を更新
    if (this.state.isMovedMouse == false) {
      this.state.mouseOriginPosition.x = event.x - this.mainStage.container().getBoundingClientRect().left;
      this.state.mouseOriginPosition.y =
        event.y - this.mainStage.container().getBoundingClientRect().top - this.params.paddingCanvasTop;
    }
    this.state.isMovedMouse = true;
    this.state.mousePosition.x = event.x - this.mainStage.container().getBoundingClientRect().left;
    this.state.mousePosition.y =
      event.y - this.mainStage.container().getBoundingClientRect().top - this.params.paddingCanvasTop;

    // ドラッグスクロール
    this.scrollView.mouseDragScrollEvent();

    // カーソル上の行・列番号を計算
    this.textView.calcMouseOverIndex();
    // セレクタ処理
    this.selectView.selectEvent();
    // 各レイヤーに反映
    this.updateLayers();
  }

  private copyEvent(event: ClipboardEvent): void {
    if (this.state.selectedIndexs.top.row >= 0) {
      let output = "";
      output += this.textView
        .binaryFormatStr(
          this.state.rawDatas.slice(
            (this.state.rowTopIndex + this.state.selectedIndexs.top.row) * this.params.maxLineNum,
            (this.state.rowTopIndex + this.state.selectedIndexs.top.row + 1) * this.params.maxLineNum
          )
        )
        .slice(this.state.selectedIndexs.top.start, this.state.selectedIndexs.top.end);
      output += "\n";
      this.state.rawDatas.slice(
        (this.state.rowTopIndex + this.state.selectedIndexs.top.row) * this.params.maxLineNum,
        (this.state.rowTopIndex + this.state.selectedIndexs.top.row + 1) * this.params.maxLineNum
      );

      for (var i = 1; i < this.state.selectedIndexs.bottom.row - this.state.selectedIndexs.top.row; i++) {
        output += this.textView.binaryFormatStr(
          this.state.rawDatas.slice(
            (this.state.rowTopIndex + i) * this.params.maxLineNum,
            (this.state.rowTopIndex + i + 1) * this.params.maxLineNum
          )
        );
        output += "\n";
      }
      if (this.state.selectedIndexs.bottom.row != this.state.selectedIndexs.top.row) {
        output += this.textView
          .binaryFormatStr(
            this.state.rawDatas.slice(
              (this.state.rowTopIndex + this.state.selectedIndexs.bottom.row) * this.params.maxLineNum,
              (this.state.rowTopIndex + this.state.selectedIndexs.bottom.row + 1) * this.params.maxLineNum
            )
          )
          .slice(this.state.selectedIndexs.bottom.start, this.state.selectedIndexs.bottom.end);
      }
      event.clipboardData.setData("text/plain", output);
      event.preventDefault();
      console.log("Copy Done.");
    }
  }

  private mouseUpEvent(event): void {
    if (this.state.isMovedMouse == false) {
      this.selectView.resetSelectIndex();
      this.updateLayers();
    }
    // マウスボタンを上げたらドラッグスクロールを強制終了
    this.scrollView.mouseDragScrollStop();
    document.removeEventListener("mousemove", this.mouseMoveEvent);
    document.removeEventListener("mouseup", this.mouseUpEvent);
    this.state.isMovedMouse = false;
  }

  private mouseEnterHandler() {
    this.mainStage.container().removeEventListener("mousedown", this.mouseDownEvent);
    this.mainStage.container().style.cursor = "auto";
  }

  private mouseLeaveHandler() {
    this.mainStage.container().addEventListener("mousedown", this.mouseDownEvent);
    this.mainStage.container().style.cursor = "text";
  }

  // スクロール更新時にテキストを再描画
  private updateScrollHandler() {
    // 各レイヤーに反映
    this.updateLayers();
  }

  // ドラッグスクロール時はレイヤ更新+セレクト処理も実行
  private updateDragScrollHandler() {
    // セレクタ処理
    this.textView.updateContents();
    this.selectView.selectEvent();
    // 各レイヤーに反映
    this.updateLayers();
  }

  // テキストを追加する関数
  public addText(data: number[]): void {
    for (let i in data) {
      this.state.rawDatas.append(data[i]);
    }
    // 各レイヤーに反映
    this.updateLayers();
  }

  public clearText(): void {
    this.state.rawDatas.clear();
    this.column_counter = 0;
    this.selectView.resetSelectIndex();
    // 各レイヤーに反映
    this.updateLayers();
  }

  public getTexts(): ExtendArray {
    return this.state.rawDatas;
  }

  public setParam(data: UserConfig) {
    this.params.userConfig = data;
    // レイヤーを再描画
    this.mainStage.destroyChildren();
    this.textView.initLayer();
    this.selectView.initLayer();
    this.scrollView.initLayer();
    this.updateLayers();
  }

  public getTextsSlice(s: number, e: number): number[] {
    return this.state.rawDatas.slice(s, e);
  }

  public getTextsSize(): number {
    return this.state.rawDatas.size();
  }

  // ステージの大きさを変更したいときに呼び出す
  setStageSize(width: number, height: number) {
    // ステージの大きさを変更
    this.mainStage.width(width);
    this.mainStage.height(height);

    // 各レイヤーに反映
    this.updateLayers();
  }

  private updateLayers() {
    this.textView.updateLayer();
    this.selectView.updateLayer();
    this.scrollView.updateLayer();
  }
}

export default CanvasViewer;
