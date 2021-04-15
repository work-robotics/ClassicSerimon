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
  public currentReceiveCounter: number;
  public enterReceiveCounter: number;

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

    this.currentReceiveCounter = 0;
    this.enterReceiveCounter = 0;

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
        const rawData = this.state.rawDatas.slice(areaTop[0], areaTop[1]);
        this.common.formCopyData(rawData);
        output += this.textView
          .asciiFormatStr(rawData)
          .slice(this.state.selectedIndexs.top.start, this.state.selectedIndexs.top.end);

        if (
          output[output.length - 1] != "\n" &&
          this.state.selectedIndexs.bottom.row - this.state.selectedIndexs.top.row != 0
        ) {
          output += "\n";
        }

        // 中段の指定範囲のデータを取り出す
        for (let i = 1; i < this.state.selectedIndexs.bottom.row - this.state.selectedIndexs.top.row; i++) {
          const areaMiddle = this.state.enterPoint.slice(
            this.state.selectedIndexs.top.row + i,
            this.state.selectedIndexs.top.row + i + 2
          );
          const rawData = this.state.rawDatas.slice(areaMiddle[0], areaMiddle[1]);
          this.common.formCopyData(rawData);
          output += this.textView.asciiFormatStr(rawData);
          if (output[output.length - 1] != "\n") {
            output += "\n";
          }
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
          const rawData = this.state.rawDatas.slice(areaBottom[0], areaBottom[1]);
          this.common.formCopyData(rawData);
          output += this.textView
            .asciiFormatStr(rawData)
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

  //-1: 初期状態, 1~4: 対象のバイトを指す
  private addTextState: {
    mode: number;
    counter: number;
    isReject: boolean;
    buffer: number[];
  } = { mode: -1, counter: 0, isReject: false, buffer: [] };

  private byteConfirm(data: number) {
    if (this.addTextState.mode == -1) {
      this.addTextState.buffer = [];
      this.addTextState.isReject = false;
      if (data >= 0xf0 && data <= 0xf4) {
        // 4Byteのヘッダか確認
        this.addTextState.mode = 4;
      } else if (data >= 0xe0 && data <= 0xef) {
        // 3Byteのヘッダか確認
        this.addTextState.mode = 3;
      } else if (data >= 0xc2 && data <= 0xdf) {
        // 2Byteのヘッダか確認
        this.addTextState.mode = 2;
      } else {
        // 1Byteのヘッダか確認
        this.addTextState.mode = 1;
      }
      this.addTextState.counter = this.addTextState.mode;
    }
  }

  private fourByteDecode(data: number) {
    if (this.addTextState.counter == 4) {
      this.buffer4byte[0] = data;
      this.addTextState.counter--;
    } else if (this.addTextState.counter == 3 && data >= 0x80 && data <= 0xbf) {
      this.buffer4byte[1] = data;
      this.addTextState.counter--;
    } else if (this.addTextState.counter == 2 && data >= 0x80 && data <= 0xbf) {
      this.buffer4byte[2] = data;
      this.addTextState.counter--;
    } else if (this.addTextState.counter == 1 && data >= 0x80 && data <= 0xbf) {
      this.buffer4byte[3] = data;
      this.addTextState.counter--;
    } else {
      this.addTextState.isReject = true;
    }
    // データが正常に読み込めた場合
    if (this.addTextState.counter == 0) {
      this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer4byte.toString("utf-8"))];
    }
  }

  private treeByteDecode(data: number) {
    if (this.addTextState.counter == 3) {
      this.buffer3byte[0] = data;
      this.addTextState.counter--;
    } else if (this.addTextState.counter == 2 && data >= 0x80 && data <= 0xbf) {
      this.buffer3byte[1] = data;
      this.addTextState.counter--;
    } else if (this.addTextState.counter == 1 && data >= 0x80 && data <= 0xbf) {
      this.buffer3byte[2] = data;
      this.addTextState.counter--;
    } else {
      this.addTextState.isReject = true;
    }
    // データが正常に読み込めた場合
    if (this.addTextState.counter == 0) {
      this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer3byte.toString("utf-8"))];
    }
  }

  private twoByteDecode(data: number) {
    if (this.addTextState.counter == 2) {
      this.buffer2byte[0] = data;
      this.addTextState.counter--;
    } else if (this.addTextState.counter == 1 && data >= 0x80 && data <= 0xbf) {
      this.buffer2byte[1] = data;
      this.addTextState.counter--;
    } else {
      this.addTextState.isReject = true;
    }
    // データが正常に読み込めた場合
    if (this.addTextState.counter == 0) {
      this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer2byte.toString("utf-8"))];
    }
  }

  private oneByteDecode(data: number) {
    if (this.addTextState.counter == 1) {
      // 表示可能でない文字はスペースに置換する
      if (data >= 0x00 && data <= 0x09) {
        this.buffer1byte[0] = 0x20;
      } else if (data >= 0x0b && data <= 0x1f) {
        this.buffer1byte[0] = 0x20;
      } else if (data > 0x7f) {
        this.buffer1byte[0] = 0x20;
      } else {
        this.buffer1byte[0] = data;
      }
      this.addTextState.counter--;
      this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer1byte.toString("utf-8"))];
    }
  }

  private otherByteDecode(data: number) {
    if (data >= 0x00 && data <= 0x09) {
      this.buffer1byte[0] = 0x20;
    } else if (data >= 0x0b && data <= 0x1f) {
      this.buffer1byte[0] = 0x20;
    } else if (data > 0x7f) {
      this.buffer1byte[0] = 0x20;
    } else {
      this.buffer1byte[0] = data;
    }
    this.state.column_width_sum += this.params.preMeasureFontSize[easta(this.buffer1byte.toString("utf-8"))];
  }

  private updateEnterPoint() {
    for (let i = 0; i < this.state.rawDatas.size(); i++) {
      const data = this.state.rawDatas.at(i);
      // 何バイトの文字か判定
      this.byteConfirm(data);
      // データを追加
      this.addTextState.buffer.push(data);

      // 各バイト文字ごとに処理
      switch (this.addTextState.mode) {
        case 4:
          this.fourByteDecode(data);
          break;
        case 3:
          this.treeByteDecode(data);
          break;
        case 2:
          this.twoByteDecode(data);
          break;
        case 1:
          this.oneByteDecode(data);
          break;
      }

      // 無効モード時は1Byteとして扱いながら文字幅計算と改行判定
      if (this.addTextState.isReject) {
        // 無効なデータはすべて1Byte文字として扱う
        for (var k = this.addTextState.mode - this.addTextState.counter; k >= 0; k--) {
          // 表示可能でない文字はスペースに置換する
          const targetData = this.addTextState.buffer[k];
          this.otherByteDecode(targetData);
          // 改行判定
          this.checkEnterPoint(targetData, i);
        }
        this.addTextState.mode = -1;
        this.addTextState.isReject = false;
      } else if (this.addTextState.counter == 0) {
        // 文字の読み込みが完了後に改行判定
        this.checkEnterPoint(data, i + 1);
        this.addTextState.mode = -1;
      }
    }
  }

  // テキストを追加する関数
  public addText(data: number[]): void {
    for (let i = 0; i < data.length; i++) {
      this.currentReceiveCounter++;
      // 何バイトの文字か判定
      this.byteConfirm(data[i]);
      // データを追加
      this.state.rawDatas.append(data[i]);
      this.addTextState.buffer.push(data[i]);

      // 各バイト文字ごとに処理
      switch (this.addTextState.mode) {
        case 4:
          this.fourByteDecode(data[i]);
          break;
        case 3:
          this.treeByteDecode(data[i]);
          break;
        case 2:
          this.twoByteDecode(data[i]);
          break;
        case 1:
          this.oneByteDecode(data[i]);
          break;
      }

      // 無効モード時は1Byteとして扱いながら文字幅計算と改行判定
      if (this.addTextState.isReject) {
        for (let k = this.addTextState.mode - this.addTextState.counter; k >= 0; k--) {
          // 表示可能でない文字はスペースに置換する
          const targetData = this.addTextState.buffer[k];
          this.otherByteDecode(targetData);
          // 改行判定
          this.checkEnterPoint(targetData, this.state.rawDatas.size());
        }
        // 状態変数を初期化
        this.addTextState.mode = -1;
        this.addTextState.isReject = false;
      } else if (this.addTextState.counter == 0) {
        // 文字の読み込みが完了後に改行判定
        this.checkEnterPoint(data[i], this.state.rawDatas.size());
        this.addTextState.mode = -1;
      }
    }
    // 各レイヤーに反映
    this.updateLayers();
  }

  private checkEnterPoint(data: number, setPoint: number) {
    if (data == 10 || this.state.column_width_sum > this.params.userConfig.asciiMaxWidth) {
      this.state.enterPoint.append(setPoint);
      this.state.column_width_sum = 0;
      this.enterReceiveCounter++;
    }
  }

  // 画面をクリアする
  public clearText(): void {
    this.state.rawDatas.clear();
    this.addTextState = { mode: -1, counter: 0, isReject: false, buffer: [] };
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
    this.state.enterPoint.clear();
    this.state.enterPoint.append(0);
    this.state.column_width_sum = 0;
    this.updateEnterPoint();
  }

  // パラメータを更新する関数
  public setParam(data: UserConfig) {
    this.params.userConfig = data;
    // レイヤーを再描画
    this.mainStage.destroyChildren();
    this.common.init();
    this.textView.initLayer();
    this.selectView.resetSelectIndex();
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
  public setStageSize(width: number, height: number) {
    // ステージの大きさを変更
    this.mainStage.width(width);
    this.mainStage.height(height);

    // 各レイヤーに反映
    this.updateLayers();
  }

  public getParam(): Params {
    return this.params;
  }

  // 各レイヤーを更新する関数
  private updateLayers() {
    this.textView.updateLayer();
    this.selectView.updateLayer();
    this.scrollView.updateLayer();
  }
}

export default CanvasViewer;
