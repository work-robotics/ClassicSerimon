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

import { UserConfig } from "./Types";

export class Params {
  private _userConfig: UserConfig;
  private _lineNumbersWidth: number;
  private _paddingLineNumbersRight: number;
  private _topNumberHeight: number;
  public preMeasureFontSize: {
    F: number;
    H: number;
    W: number;
    Na: number;
    A: number;
    N: number;
  };

  constructor(userConfig: UserConfig) {
    this._userConfig = userConfig;
    this._lineNumbersWidth = 90;
    this._paddingLineNumbersRight = 10;
    this._topNumberHeight = 30;
    this.preMeasureFontSize = {
      F: 0,
      H: 0,
      W: 0,
      Na: 0,
      A: 0,
      N: 0,
    };
  }

  get userConfig(): UserConfig {
    return this._userConfig;
  }

  set userConfig(data: UserConfig) {
    this._userConfig = data;
  }

  get rowHeight(): number {
    return this._userConfig.rowHeight;
  }

  set rowHeight(data: number) {
    this._userConfig.rowHeight = data;
  }

  get fontSize(): number {
    return this._userConfig.fontSize;
  }

  set fontSize(data: number) {
    this._userConfig.fontSize = data;
  }

  get maxLineNum(): number {
    return this._userConfig.maxLineNum;
  }

  set maxLineNum(data: number) {
    this._userConfig.maxLineNum = data;
  }

  get lineNumbersWidth(): number {
    return this._lineNumbersWidth;
  }

  set lineNumbersWidth(data: number) {
    this._lineNumbersWidth = data;
  }

  get paddingLineNumbersRight(): number {
    return this._paddingLineNumbersRight;
  }

  set paddingLineNumbersRight(data: number) {
    this._paddingLineNumbersRight = data;
  }

  get topNumberHeight(): number {
    return this._topNumberHeight;
  }

  set topNumberHeight(data: number) {
    this._topNumberHeight = data;
  }

  get paddingCanvasTop(): number {
    return this.rowHeight / 2 + this.topNumberHeight / 1.2;
  }
}

export default Params;
