import React from "react";
import { JSONSchema7 } from "json-schema";
import Form, { ISubmitEvent } from "@rjsf/core";
import { Button } from "react-bootstrap";
import { UserConfig } from "./CanvasViewer/Types";
import ConfigStore from "./ConfigStore";
import ModalWindow from "./ModalWindow";

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
      fontFamily: {
        type: "string",
        title: "使用するフォント",
        default: ConfigStore.userStore.get("fontFamily"),
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
          title={"環境設定"}
          content={
            <Form schema={schema} onSubmit={submitBottonEvent}>
              <Button type="submit" variant="dark">
                Apply
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

export default ConfigPanel;
