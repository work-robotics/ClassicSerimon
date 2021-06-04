// Copyright 2021 Work Robotics Co., Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
      fontFamily: "SJetBrainsMono, SSourceHanCodeJP",
      lineHeight: this.params.rowHeight / this.params.fontSize,
    };
    // テキスト検査用のテキスト
    this.tempText = new Konva.Text({ ...textConfig });

    this.params.preMeasureFontSize["F"] = this.getTextWidth("Ａ");
    this.params.preMeasureFontSize["W"] = this.getTextWidth("ア");
    this.params.preMeasureFontSize["A"] = this.getTextWidth("α");
    this.params.preMeasureFontSize["H"] = this.getTextWidth("ｱ");
    this.params.preMeasureFontSize["Na"] = this.getTextWidth("A");
    this.params.preMeasureFontSize["N"] = this.getTextWidth("À");
  }

  public getTextWidth(data: string): number {
    this.tempText.text(data);
    return this.tempText.getTextWidth();
  }

  public formCopyData(data: number[]) {
    for (let i = 0; i < data.length; i++) {
      // 4Byte文字
      let dataType = -1;
      if (data[i] >= 0xf0 && data[i] <= 0xf4) {
        if (data[i + 1] >= 0x80 && data[i + 1] <= 0xbf) {
          if (data[i + 2] >= 0x80 && data[i + 2] <= 0xbf) {
            if (data[i + 3] >= 0x80 && data[i + 3] <= 0xbf) {
              dataType = 4;
            }
          }
        }
      }
      // 3Byte文字
      if (data[i] >= 0xe0 && data[i] <= 0xef) {
        if (data[i + 1] >= 0x80 && data[i + 1] <= 0xbf) {
          if (data[i + 2] >= 0x80 && data[i + 2] <= 0xbf) {
            dataType = 3;
          }
        }
      }
      // 2Byte文字
      if (data[i] >= 0xc2 && data[i] <= 0xdf) {
        if (data[i + 1] >= 0x80 && data[i + 1] <= 0xbf) {
          dataType = 2;
        }
      }
      // 1Byte文字
      if (data[i] >= 0x00 && data[i] <= 0x7f) {
        // 表示可能でない文字はスペースに置換する
        if (data[i] >= 0x00 && data[i] <= 0x09) {
          dataType = -1;
        } else if (data[i] >= 0x0b && data[i] <= 0x1f) {
          dataType = -1;
        } else if (data[i] > 0x7f) {
          dataType = -1;
        } else {
          dataType = 1;
        }
      }
      if (dataType == -1) {
        data[i] = 0x20;
        dataType = 1;
      }
      i += dataType - 1;
    }
  }
}

export default Common;
