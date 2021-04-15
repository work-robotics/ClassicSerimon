import React, { useState } from "react";
import { css } from "emotion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { JSONSchema7 } from "json-schema";
import Form, { ISubmitEvent } from "@rjsf/core";
import { Button } from "react-bootstrap";
import { UserConfig } from "./CanvasViewer/Types";
import ConfigStore from "./ConfigStore";

const Overlay = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OverlayContent = css`
  z-index: 2;
  margin: 0;
  padding: 0;
  width: 70%;
  height: 70%;
  background: #fff;
  padding: 0;
  border-radius: 10px;
  border: 1px solid #242424;
  overflow-y: hidden;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 10px 10px 10px 10px rgba(0, 0, 0, 0.1);
`;

const ContentHeader = css`
  width: 100%;
  height: 50px;
  padding-top: 10px;
  display: flex;
  position: relative;
  border-bottom: 1px solid #000;
`;

const ContentMain = css`
  width: 100%;
  height: calc(100% - 50px); //50=30+10+10
  overflow-y: scroll;
  padding: 20px 20px 20px 20px;
`;

const CloseBotton = css`
  width: 30px;
  height: 30px;
  position: absolute;
  right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  background: #eee;
  border-radius: 10px;
  :hover {
    background: #ddd;
    cursor: pointer;
  }
`;

const ContentTitle = css`
  position: absolute;
  left: 0px;
  font-size: 20px;
`;

export type ModalWindowProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const ModalWindow: React.FC<ModalWindowProps> = (props) => {
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
    },
  };

  if (props.show) {
    return (
      <>
        <div className={Overlay} onClick={CloseBottonEvent}>
          <div className={OverlayContent} onClick={(e) => e.stopPropagation()}>
            <div className={ContentHeader}>
              <div onClick={CloseBottonEvent} className={CloseBotton}>
                <FontAwesomeIcon icon={faTimes} />
              </div>
              <div className={ContentTitle}>　環境設定</div>
            </div>
            <div className={ContentMain}>
              <Form schema={schema} onSubmit={submitBottonEvent}>
                <Button type="submit" variant="dark">
                  Apply
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return null;
  }
};

export default ModalWindow;
