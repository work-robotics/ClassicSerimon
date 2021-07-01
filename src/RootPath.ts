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

// This file was written with reference to the following file released under the MIT License.
// npm-electron-root-path
// https://github.com/ganeshrvel/npm-electron-root-path/blob/fdc9bcb3e422b4a3912c5e30491a99b92e2b1cc2/lib/index.js
// Copyright (c) 2010-present Ganesh Rathinavel
// https://github.com/ganeshrvel/npm-electron-root-path/blob/fdc9bcb3e422b4a3912c5e30491a99b92e2b1cc2/LICENSE

import { isPackaged } from "electron-is-packaged";
import path from "path";

function RootPath(): string {
  if (isPackaged) {
    if (process.env.PORTABLE_EXECUTABLE_DIR == undefined) {
      if (process.platform === "linux") {
        return process.cwd();
      }
      if (process.platform === "darwin") {
        return path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(__dirname))))));
      }
    } else {
      return process.env.PORTABLE_EXECUTABLE_DIR;
    }
  } else {
    return path.dirname(path.dirname(__dirname));
  }

  return undefined;
}

export default RootPath;
