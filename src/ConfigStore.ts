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

import Store, { Schema } from "electron-store";
import { UserConfig, SysConfig, metaConfig } from "./CanvasViewer/Types";
import fs from "fs";
import path from "path";
import RootPath from "./RootPath";

export const userDefaultValue: UserConfig = {
  fontSize: 14,
  rowHeight: 20,
  maxLineNum: 16,
  asciiMode: false,
  darkMode: false,
  asciiMaxWidth: 650,
};

export const sysDefaultValue: SysConfig = {
  baudrate: 9600,
};

export const metaDefaultValue: metaConfig = {
  user: "",
  date: "",
  location: "",
  expName: "",
  expDescription: "",
  deviceCode: "",
  memo: "",
};

export class ConfigStore {
  public userSchema: Schema<UserConfig>;
  public userStore: Store<UserConfig>;

  public sysSchema: Schema<SysConfig>;
  public sysStore: Store<SysConfig>;

  public metaSchema: Schema<metaConfig>;
  public metaStore: Store<metaConfig>;

  constructor() {
    const confDataDirName = "user-datas";
    const confPath = path.join(RootPath(), confDataDirName);
    if (!fs.existsSync(confPath)) {
      fs.mkdir(confPath, (err) => {
        if (err) throw err;
      });
    }
    this.userStore = new Store<UserConfig>({
      clearInvalidConfig: true,
      defaults: userDefaultValue,
      schema: this.userSchema,
      name: "userconfig",
      cwd: confPath,
      watch: true,
    });

    this.sysStore = new Store<SysConfig>({
      clearInvalidConfig: true,
      defaults: sysDefaultValue,
      schema: this.sysSchema,
      name: "system",
      cwd: confPath,
      watch: true,
    });

    this.metaStore = new Store<metaConfig>({
      clearInvalidConfig: true,
      defaults: metaDefaultValue,
      schema: this.metaSchema,
      name: "meta",
      cwd: confPath,
      watch: true,
    });
  }

  public getData(): UserConfig {
    let data: UserConfig = userDefaultValue;
    for (const key in userDefaultValue) {
      data[key] = this.userStore.get(key);
    }
    return data;
  }
}

export default new ConfigStore();
