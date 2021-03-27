import Konva from "konva";
import Params, { UserConfig } from "./Params";
import { ExtendArray, State } from "./State";
import Common from "./Common";
import TextView from "./TextView";
import ScrollView from "./ScrollView";
import SelectView from "./SelectView";

class CanvasViewer {
  // 描画用のステージ
  private mainStage: Konva.Stage;
  // 共有で使用するコンポーネント
  private params: Params;
  private state: State;
  private common: Common;
  // 各レイヤーコンポーネント
  private textView: TextView;
  private scrollView: ScrollView;
  private selectView: SelectView;

  constructor(id: string, option: UserConfig) {
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

    // 各コンポーネントを初期化
    this.mainStage = new Konva.Stage({ container: id });
    this.params = new Params(option);
    this.state = new State();
    this.common = new Common(this.mainStage, this.params, this.state);
    this.textView = new TextView(this.mainStage, this.params, this.state, this.common);
    this.scrollView = new ScrollView(
      this.mainStage,
      this.params,
      this.state,
      this.common,
      this.updateScrollHandler,
      this.updateDragScrollHandler,
      this.mouseEnterHandler,
      this.mouseLeaveHandler
    );
    this.selectView = new SelectView(this.mainStage, this.params, this.state, this.common);

    // イベントの登録
    this.mainStage.container().addEventListener("mousedown", this.mouseDownEvent);
    this.mainStage.container().addEventListener("wheel", this.mouseWheelEvent);
    document.addEventListener("copy", this.copyEvent);

    // マウスカーソルはテキストモードにする
    this.mainStage.container().style.cursor = "text";
    this.mainStage.container().style.overflow = "hidden";
  }

  // マウスホイールのイベント関数
  private mouseWheelEvent(event: WheelEvent): void {
    // ホイールの差分を加算する
    this.state.scrollTop += event.deltaY;
    // スクロールが一番下までいった場合はオートスクロールを有効にする
    this.state.enableAutoScroll = this.state.scrollHeight - this.mainStage.height() < this.state.scrollTop;

    // マウスカーソルの動作フラグが立っている場合
    if (this.state.isMovedMouse == true) {
      // scrollTopを変更したので強制的に反映
      this.scrollView.updateContents();
      // ドラッグスクロールと同じ処理を実行
      this.updateDragScrollHandler();
    } else {
      // レイヤを更新
      this.updateLayers();
    }
  }

  // マウスの左右クリックを押した場合のイベント関数
  private mouseDownEvent(event: MouseEvent): void {
    // 左クリックの場合でのみ処理
    if (event.button == 0) {
      // カーソルの移動 & クリックをやめたときのイベントを登録
      document.addEventListener("mousemove", this.mouseMoveEvent);
      document.addEventListener("mouseup", this.mouseUpEvent);
    }
  }

  // カーソル移動時のイベント関数
  private mouseMoveEvent(event: MouseEvent): void {
    // オートスクロールを停止する
    this.state.enableAutoScroll = false;

    // 選択レイヤーのインデックスを初期化
    if (this.state.isMovedMouse == false) {
      this.selectView.resetSelectIndex();
    }

    // マウス座標を更新
    if (this.state.isMovedMouse == false) {
      this.state.mouseOriginPosition.x = event.x - this.mainStage.container().getBoundingClientRect().left;
      this.state.mouseOriginPosition.y =
        event.y - this.mainStage.container().getBoundingClientRect().top - this.params.paddingCanvasTop;
    }

    // カーソル移動済みフラグを更新
    this.state.isMovedMouse = true;

    // 現在のマウスカーソルの位置を計算
    this.state.mousePosition.x = event.x - this.mainStage.container().getBoundingClientRect().left;
    this.state.mousePosition.y =
      event.y - this.mainStage.container().getBoundingClientRect().top - this.params.paddingCanvasTop;

    // ドラッグスクロールする状況か確認 & 必要に応じて自動的に実行する
    this.scrollView.mouseDragScrollEvent();

    // カーソル上の行・列番号を計算
    this.textView.calcMouseOverIndex();
    // 選択部分を計算する
    this.selectView.selectEvent();
    // 各レイヤーを更新
    this.updateLayers();
  }

  // コピー時のイベント関数
  private copyEvent(event: ClipboardEvent): void {
    if (this.state.selectedIndexs.top.row >= 0) {
      let output = "";
      // 上段の指定範囲のデータを取り出す
      output += this.textView
        .binaryFormatStr(
          this.state.rawDatas.slice(
            (this.state.rowTopIndex + this.state.selectedIndexs.top.row) * this.params.maxLineNum,
            (this.state.rowTopIndex + this.state.selectedIndexs.top.row + 1) * this.params.maxLineNum
          )
        )
        .slice(this.state.selectedIndexs.top.start, this.state.selectedIndexs.top.end);
      output += "\n";

      // 中段の指定範囲のデータを取り出す
      for (var i = 1; i < this.state.selectedIndexs.bottom.row - this.state.selectedIndexs.top.row; i++) {
        output += this.textView.binaryFormatStr(
          this.state.rawDatas.slice(
            (this.state.rowTopIndex + i) * this.params.maxLineNum,
            (this.state.rowTopIndex + i + 1) * this.params.maxLineNum
          )
        );
        output += "\n";
      }

      // 下段の指定範囲のデータを取り出す
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
    }
  }

  // マウスのクリックが終了した際に呼ばれるイベント関数
  private mouseUpEvent(event): void {
    if (this.state.isMovedMouse == false) {
      // 選択インデックスを初期化
      this.selectView.resetSelectIndex();
      // 各レイヤを更新
      this.updateLayers();
    }

    // マウスボタンを上げたらドラッグスクロールを強制終了
    this.scrollView.mouseDragScrollStop();
    document.removeEventListener("mousemove", this.mouseMoveEvent);
    document.removeEventListener("mouseup", this.mouseUpEvent);
    // 移動済みフラグを解除
    this.state.isMovedMouse = false;
  }

  // マウスがエリア内に入ったときに実行されるイベント関数
  private mouseEnterHandler() {
    this.mainStage.container().removeEventListener("mousedown", this.mouseDownEvent);
    this.mainStage.container().style.cursor = "auto";
  }

  // マウスがエリア外に出たときに実行されるイベント関数
  private mouseLeaveHandler() {
    this.mainStage.container().addEventListener("mousedown", this.mouseDownEvent);
    this.mainStage.container().style.cursor = "text";
  }

  // スクロール更新時にテキストを再描画
  private updateScrollHandler() {
    // 各レイヤーを更新
    this.updateLayers();
  }

  // ドラッグスクロール時はレイヤ更新+セレクト処理も実行
  private updateDragScrollHandler() {
    // セレクタ処理
    this.textView.updateContents();
    this.scrollView.updateContents();
    this.selectView.selectEvent();
    // 各レイヤーを更新
    this.updateLayers();
  }

  // テキストを追加する関数
  public addText(data: number[]): void {
    for (let i in data) {
      this.state.rawDatas.append(data[i]);
      this.state.column_width_sum += this.params.asciiFontWidthTable[data[i]];
      if (data[i] == 10 || this.state.column_width_sum > this.params.userConfig.asciiMaxWidth) {
        this.state.enterPoint.append(this.state.rawDatas.size());
        this.state.column_counter = 0;
        this.state.column_width_sum = 0;
      } else {
        this.state.column_counter++;
      }
    }
    // 各レイヤーに反映
    this.updateLayers();
  }

  // 画面をクリアする
  public clearText(): void {
    this.state.rawDatas.clear();
    this.state.enterPoint.clear();
    this.state.enterPoint.append(0);
    this.state.column_width_sum = 0;
    this.state.column_counter = 0;
    this.selectView.resetSelectIndex();
    // 各レイヤーに反映
    this.updateLayers();
  }

  // データオブジェクトを取得
  public getTexts(): ExtendArray {
    return this.state.rawDatas;
  }

  // アスキーモード時に表示幅のパラメータが更新された場合に呼び出す関数
  public updtaeASCIIMaxWidth() {
    this.state.enterPoint.clear();
    let counter = 0;
    this.state.column_counter;
    this.state.column_width_sum = 0;
    this.state.enterPoint.append(0);
    for (var i = 0; i < this.state.rawDatas.size(); i++) {
      this.state.column_width_sum += this.params.asciiFontWidthTable[this.state.rawDatas.at(i)];
      if (this.state.rawDatas.at(i) == 10 || this.state.column_width_sum > this.params.userConfig.asciiMaxWidth) {
        this.state.enterPoint.append(counter + 1);
        this.state.column_counter = 0;
        this.state.column_width_sum = 0;
      } else {
        this.state.column_counter++;
      }
      counter++;
    }
  }

  // パラメータを更新する関数
  public setParam(data: UserConfig) {
    this.params.userConfig = data;
    // レイヤーを再描画
    this.mainStage.destroyChildren();
    this.common.init();
    this.textView.initLayer();
    this.selectView.initLayer();
    this.scrollView.initLayer();
    this.updateLayers();
  }

  // データをスライスする関数のラッパー
  public getTextsSlice(s: number, e: number): number[] {
    return this.state.rawDatas.slice(s, e);
  }

  // データの総数を取得する関数のラッパー
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

  // 各レイヤーを更新する関数
  private updateLayers() {
    this.textView.updateLayer();
    this.selectView.updateLayer();
    this.scrollView.updateLayer();
  }
}

export default CanvasViewer;
