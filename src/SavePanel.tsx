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

import { metaConfig, UserConfig } from "./CanvasViewer/Types";
import ConfigStore from "./ConfigStore";
import ModalWindow from "./ModalWindow";

export type SavePanelProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  saveRequest: () => void;
};

const SavePanel: React.FC<SavePanelProps> = (props) => {
  function submitBottonEvent(e: ISubmitEvent<metaConfig>) {
    for (const key in e.formData) {
      if (e.formData[key] == undefined) {
        ConfigStore.metaStore.set(key, "");
      } else {
        ConfigStore.metaStore.set(key, e.formData[key]);
      }
    }
    props.saveRequest();
  }

  const schema: JSONSchema7 = {
    type: "object",
    properties: {
      user: {
        type: "string",
        title: "記録者",
        default: ConfigStore.metaStore.get("user"),
      },
      date: {
        type: "string",
        title: "日時",
        default: ConfigStore.metaStore.get("date"),
      },
      location: {
        type: "string",
        title: "場所",
        default: ConfigStore.metaStore.get("location"),
      },
      expName: {
        type: "string",
        title: "実験名",
        default: ConfigStore.metaStore.get("expName"),
      },
      expDescription: {
        type: "string",
        title: "実験説明",
        default: ConfigStore.metaStore.get("expDescription"),
      },
      deviceCode: {
        type: "string",
        title: "デバイスコード",
        default: ConfigStore.metaStore.get("deviceCode"),
      },
      memo: {
        type: "string",
        title: "備考欄",
        default: ConfigStore.metaStore.get("memo"),
      },
    },
  };

  if (props.show) {
    return (
      <>
        <ModalWindow
          show={props.show}
          setShow={props.setShow}
          title={"受信データの保存"}
          content={
            <Form schema={schema} onSubmit={submitBottonEvent}>
              <Button type="submit" variant="dark">
                保存
              </Button>
            </Form>
          }
        />
      </>
    );
  } else {
    return null;
  }
};

export default SavePanel;
