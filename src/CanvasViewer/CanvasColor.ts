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

import ConfigStore from "../ConfigStore";

export class CanvasColor {
  public textLineBackground: string;
  public textTopBackground: string;
  public textBorder: string;
  public textDataContent: string;
  public textLineNumContent: string;
  public textTopNumContent: string;

  public selectColor: string;

  public scrollBarBackground: string;
  public scrollBar: string;

  constructor() {
    if (ConfigStore.getData().darkMode) {
      this.setDarkColor();
    } else {
      this.setLightColor();
    }
  }

  public setLightColor() {
    this.textLineBackground = "#424242";
    this.textTopBackground = "#333333";
    this.textBorder = "#F2F2F2";
    this.textDataContent = "#000";
    this.textLineNumContent = "#FFF";
    this.textTopNumContent = "#FFF";
    this.selectColor = "#0000FF";
    this.scrollBarBackground = "#CCC";
    this.scrollBar = "#333";
  }
  public setDarkColor() {
    this.textLineBackground = "#21252B";
    this.textTopBackground = "#181b1f";
    this.textBorder = "#21242b";
    this.textDataContent = "#BBBBBB";
    this.textLineNumContent = "#BBBBBB";
    this.textTopNumContent = "#BBBBBB";
    this.selectColor = "#FFF";
    this.scrollBarBackground = "#21252B";
    this.scrollBar = "#787c81";
  }
}

export default new CanvasColor();
