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

import React from "react";
import { JSONSchema7 } from "json-schema";
import Form, { ISubmitEvent } from "@rjsf/core";
import { Button } from "react-bootstrap";
import { UserConfig } from "./CanvasViewer/Types";
import ConfigStore from "./ConfigStore";
import ModalWindow from "./ModalWindow";
import { remote } from "electron";
import { css } from "emotion";

export type ConfigPanelProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConfigPanel: React.FC<ConfigPanelProps> = (props) => {
  function CloseBottonEvent() {
    props.setShow(false);
  }

  function submitBottonEvent(e: ISubmitEvent<UserConfig>) {
    for (const key in e.formData) {
      ConfigStore.userStore.set(key, e.formData[key]);
    }
  }

  const schema: JSONSchema7 = {
    type: "object",
    properties: {
      asciiMode: { type: "boolean", title: " アスキー表示モード", default: ConfigStore.userStore.get("asciiMode") },
      fontSize: {
        type: "number",
        title: "フォントサイズ（ピクセル指定）",
        default: ConfigStore.userStore.get("fontSize"),
      },
      rowHeight: {
        type: "number",
        title: "1行の高さ（ピクセル指定）",
        default: ConfigStore.userStore.get("rowHeight"),
      },
      maxLineNum: {
        type: "number",
        title: "バイナリ表示時の横列最大数",
        default: ConfigStore.userStore.get("maxLineNum"),
      },
      asciiMaxWidth: {
        type: "number",
        title: "アスキー表示モード時の横列最大幅（ピクセル指定）",
        default: ConfigStore.userStore.get("asciiMaxWidth"),
      },
      darkMode: { type: "boolean", title: " ダークモード", default: ConfigStore.userStore.get("darkMode") },
    },
  };

  if (props.show) {
    return (
      <>
        <ModalWindow
          show={props.show}
          setShow={props.setShow}
          title={"環境設定（" + "Version: " + remote.app.getVersion() + "）"}
          content={
            <>
              <Form schema={schema} onSubmit={submitBottonEvent}>
                <Button type="submit" variant="dark">
                  Apply
                </Button>
              </Form>
              <hr />
              <a
                href="#"
                className={css`
                  :hover {
                    text-decoration: none;
                  }
                `}
                onClick={() => {
                  window.open("licence.html", "");
                }}
              >
                ライセンスの表示
              </a>
            </>
          }
        />
      </>
    );
  } else {
    return null;
  }
};

export default ConfigPanel;
