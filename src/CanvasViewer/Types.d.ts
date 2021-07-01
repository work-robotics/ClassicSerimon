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

export type UserConfig = {
  fontSize: number;
  rowHeight: number;
  maxLineNum: number;
  asciiMode: boolean;
  darkMode: boolean;
  asciiMaxWidth: number;
};

export type metaConfig = {
  user: string;
  date: string;
  location: string;
  expName: string;
  expDescription: string;
  deviceCode: string;
  memo: string;
};

export type SysConfig = {
  baudrate: number;
};
