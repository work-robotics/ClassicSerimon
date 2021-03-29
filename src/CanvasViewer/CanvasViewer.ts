import Konva from "konva";
import Params, { UserConfig } from "./Params";
import { ExtendArray, State } from "./State";
import Common from "./Common";
import TextView from "./TextView";
import ScrollView from "./ScrollView";
import SelectView from "./SelectView";
import easta from "easta";

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

  public buffer1byte = Buffer.from([0]);
  public buffer2byte = Buffer.from([0, 0]);
  public buffer3byte = Buffer.from([0, 0, 0]);
  public buffer4byte = Buffer.from([0, 0, 0, 0]);

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
      if (this.params.userConfig.asciiMode) {
        // アスキーモード時の処理
        const areaTop = this.state.enterPoint.slice(
          this.state.selectedIndexs.top.row,
          this.state.selectedIndexs.top.row + 2
        );
        let output = "";
        // 上段の指定範囲のデータを取り出す
        output += this.textView
          .asciiFormatStr(this.state.rawDatas.slice(areaTop[0], areaTop[1]))
          .slice(this.state.selectedIndexs.top.start, this.state.selectedIndexs.top.end);
        output += "\n";

        // 中段の指定範囲のデータを取り出す
        for (var i = 1; i < this.state.selectedIndexs.bottom.row - this.state.selectedIndexs.top.row; i++) {
          const areaMiddle = this.state.enterPoint.slice(
            this.state.selectedIndexs.top.row + i,
            this.state.selectedIndexs.top.row + i + 2
          );
          output += this.textView.asciiFormatStr(this.state.rawDatas.slice(areaMiddle[0], areaMiddle[1]));
          output += "\n";
        }

        // 下段の指定範囲のデータを取り出す
        if (this.state.selectedIndexs.bottom.row != this.state.selectedIndexs.top.row) {
          const areaBottom = this.state.enterPoint.slice(
            this.state.selectedIndexs.bottom.row,
            this.state.selectedIndexs.bottom.row + 2
          );
          if (areaBottom.length == 1) {
            areaBottom.push(this.state.rawDatas.size());
          }
          output += this.textView
            .asciiFormatStr(this.state.rawDatas.slice(areaBottom[0], areaBottom[1]))
            .slice(this.state.selectedIndexs.bottom.start, this.state.selectedIndexs.bottom.end);
        }
        event.clipboardData.setData("text/plain", output);
        event.preventDefault();
      } else {
        let output = "";
        // 上段の指定範囲のデータを取り出す
        output += this.textView
          .binaryFormatStr(
            this.state.rawDatas.slice(
              this.state.selectedIndexs.top.row * this.params.maxLineNum,
              (this.state.selectedIndexs.top.row + 1) * this.params.maxLineNum
            )
          )
          .slice(this.state.selectedIndexs.top.start, this.state.selectedIndexs.top.end);
        output += "\n";

        // 中段の指定範囲のデータを取り出す
        for (var i = 1; i < this.state.selectedIndexs.bottom.row - this.state.selectedIndexs.top.row; i++) {
          output += this.textView.binaryFormatStr(
            this.state.rawDatas.slice(
              (this.state.selectedIndexs.top.row + i) * this.params.maxLineNum,
              (this.state.selectedIndexs.top.row + i + 1) * this.params.maxLineNum
            )
          );
          output += "\n";
        }

        // 下段の指定範囲のデータを取り出す
        if (this.state.selectedIndexs.bottom.row != this.state.selectedIndexs.top.row) {
          output += this.textView
            .binaryFormatStr(
              this.state.rawDatas.slice(
                this.state.selectedIndexs.bottom.row * this.params.maxLineNum,
                (this.state.selectedIndexs.bottom.row + 1) * this.params.maxLineNum
              )
            )
            .slice(this.state.selectedIndexs.bottom.start, this.state.selectedIndexs.bottom.end);
        }
        event.clipboardData.setData("text/plain", output);
        event.preventDefault();
      }
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
    let dataType = 0;
    for (let i = 0; i < data.length; i++) {
      // 4Byte文字
      if (data[i] >= 0xf0 && data[i] <= 0xf4) {
        if (data[i + 1] >= 0x80 && data[i + 1] <= 0xbf) {
          if (data[i + 2] >= 0x80 && data[i + 2] <= 0xbf) {
            if (data[i + 3] >= 0x80 && data[i + 3] <= 0xbf) {
              dataType = 4;
              this.buffer4byte[0] = data[i];
              this.buffer4byte[1] = data[i + 1];
              this.buffer4byte[2] = data[i + 2];
              this.buffer4byte[3] = data[i + 3];
              this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer4byte.toString("utf-8"))];
            }
          }
        }
      }
      // 3Byte文字
      if (data[i] >= 0xe0 && data[i] <= 0xef) {
        if (data[i + 1] >= 0x80 && data[i + 1] <= 0xbf) {
          if (data[i + 2] >= 0x80 && data[i + 2] <= 0xbf) {
            dataType = 3;
            this.buffer3byte[0] = data[i];
            this.buffer3byte[1] = data[i + 1];
            this.buffer3byte[2] = data[i + 2];
            this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer3byte.toString("utf-8"))];
          }
        }
      }
      // 2Byte文字
      if (data[i] >= 0xc2 && data[i] <= 0xdf) {
        if (data[i + 1] >= 0x80 && data[i + 1] <= 0xbf) {
          dataType = 2;
          this.buffer2byte[0] = data[i];
          this.buffer2byte[1] = data[i + 1];
          this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer2byte.toString("utf-8"))];
        }
      }
      // 1Byte文字
      if (dataType == 0 || (data[i] >= 0x00 && data[i] <= 0x7f)) {
        dataType = 1;
        this.buffer1byte[0] = data[i];
        this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer1byte.toString("utf-8"))];
      }

      // データを文字コードに沿って取り出す
      for (let k = 0; k < dataType; k++) {
        this.state.rawDatas.append(data[i + k]);
      }

      if (data[i] == 10 || this.state.column_width_sum > this.params.userConfig.asciiMaxWidth) {
        this.state.enterPoint.append(this.state.rawDatas.size());
        this.state.column_counter = 0;
        this.state.column_width_sum = 0;
      } else {
        this.state.column_counter++;
      }
      i += dataType - 1;
      dataType = 0;
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
    this.state.isVisibleScroolBar = false;
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
    let buffer1byte = Buffer.from([0]);
    let buffer2byte = Buffer.from([0, 0]);
    let buffer3byte = Buffer.from([0, 0, 0]);
    let buffer4byte = Buffer.from([0, 0, 0, 0]);
    this.state.enterPoint.clear();
    this.state.column_counter;
    this.state.column_width_sum = 0;
    this.state.enterPoint.append(0);
    let dataType = 0;
    for (let i = 0; i < this.state.rawDatas.size(); i++) {
      // 4Byte文字
      if (this.state.rawDatas.at(i) >= 0xf0 && this.state.rawDatas.at(i) <= 0xf4) {
        if (this.state.rawDatas.at(i + 1) >= 0x80 && this.state.rawDatas.at(i + 1) <= 0xbf) {
          if (this.state.rawDatas.at(i + 2) >= 0x80 && this.state.rawDatas.at(i + 2) <= 0xbf) {
            if (this.state.rawDatas.at(i + 3) >= 0x80 && this.state.rawDatas.at(i + 3) <= 0xbf) {
              dataType = 4;
              buffer4byte[0] = this.state.rawDatas.at(i);
              buffer4byte[1] = this.state.rawDatas.at(i + 1);
              buffer4byte[2] = this.state.rawDatas.at(i + 2);
              buffer4byte[3] = this.state.rawDatas.at(i + 3);
              this.state.column_width_sum += this.params.preMeasureFontSize[easta(buffer4byte.toString("utf-8"))];
            }
          }
        }
      }
      // 3Byte文字
      if (this.state.rawDatas.at(i) >= 0xe0 && this.state.rawDatas.at(i) <= 0xef) {
        if (this.state.rawDatas.at(i + 1) >= 0x80 && this.state.rawDatas.at(i + 1) <= 0xbf) {
          if (this.state.rawDatas.at(i + 2) >= 0x80 && this.state.rawDatas.at(i + 2) <= 0xbf) {
            dataType = 3;
            buffer3byte[0] = this.state.rawDatas.at(i);
            buffer3byte[1] = this.state.rawDatas.at(i + 1);
            buffer3byte[2] = this.state.rawDatas.at(i + 2);
            this.state.column_width_sum += this.params.preMeasureFontSize[easta(buffer3byte.toString("utf-8"))];
          }
        }
      }
      // 2Byte文字
      if (this.state.rawDatas.at(i) >= 0xc2 && this.state.rawDatas.at(i) <= 0xdf) {
        if (this.state.rawDatas.at(i + 1) >= 0x80 && this.state.rawDatas.at(i + 1) <= 0xbf) {
          dataType = 2;
          buffer2byte[0] = this.state.rawDatas.at(i);
          buffer2byte[1] = this.state.rawDatas.at(i + 1);
          this.state.column_width_sum += this.params.preMeasureFontSize[easta(buffer2byte.toString("utf-8"))];
        }
      }
      // 1Byte文字
      if (dataType == 0 || (this.state.rawDatas.at(i) >= 0x00 && this.state.rawDatas.at(i) <= 0x7f)) {
        dataType = 1;
        buffer1byte[0] = this.state.rawDatas.at(i);
        this.state.column_width_sum += this.params.preMeasureFontSize[easta(buffer1byte.toString("utf-8"))];
      }

      if (this.state.rawDatas.at(i) == 10 || this.state.column_width_sum > this.params.userConfig.asciiMaxWidth) {
        this.state.enterPoint.append(i + dataType);
        this.state.column_counter = 0;
        this.state.column_width_sum = 0;
      } else {
        this.state.column_counter++;
      }
      i += dataType - 1;
      dataType = 0;
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
    this.selectView.resetSelectIndex();
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
