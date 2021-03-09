import Konva from "konva";
import Params from "./Params";
import State from "./State";
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

  constructor(id: string) {
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
    this.params = new Params();
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
      for (const d of this.state.rawDatas[this.state.selectedIndexs.top.row].slice(
        this.state.selectedIndexs.top.start,
        this.state.selectedIndexs.top.end
      )) {
        output += this.textView.binaryFormatStr(d);
      }
      output += "\n";
      this.state.rawDatas
        .slice(this.state.selectedIndexs.top.row + 1, this.state.selectedIndexs.bottom.row)
        .forEach((data) => {
          for (const d of data) {
            output += this.textView.binaryFormatStr(d);
          }
          output += "\n";
        });
      if (this.state.selectedIndexs.bottom.row != this.state.selectedIndexs.top.row) {
        for (const d of this.state.rawDatas[this.state.selectedIndexs.bottom.row].slice(
          this.state.selectedIndexs.bottom.start,
          this.state.selectedIndexs.bottom.end
        )) {
          output += this.textView.binaryFormatStr(d);
        }
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
    this.selectView.selectEvent();
    // 各レイヤーに反映
    this.updateLayers();
  }

  // テキストを追加する関数
  public addText(data: string): void {
    if (this.state.rawDatas.length == 0) {
      this.state.rawDatas.push("");
    }
    for (const d of data) {
      if (this.column_counter == this.params.maxLineNum) {
        this.state.rawDatas.push("");
        this.column_counter = 0;
      }
      this.state.rawDatas[this.state.rawDatas.length - 1] += d;
      this.column_counter++;
    }
    // 各レイヤーに反映
    this.updateLayers();
  }

  public clearText(): void {
    this.state.rawDatas = [];
    // 各レイヤーに反映
    this.updateLayers();
  }

  public getTexts(): string[] {
    return this.state.rawDatas;
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
