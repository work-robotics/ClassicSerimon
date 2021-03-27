import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Konva from "konva";
import { css } from "emotion";
import CanvasViewer from "./CanvasViewer/CanvasViewer";
import uniqueId from "lodash/uniqueId";
import { UserConfig } from "./CanvasViewer/Params";
import ConfigStore from "./ConfigStore";

export type CanvasViewerRef = {
  getCanvasViewer(): CanvasViewer;
};

const CanvasStyle = css`
  width: 100%;
  height: 100%;
`;

const ReactCanvasViewer = forwardRef<CanvasViewerRef>((props, ref) => {
  const CanvasViewerRef = useRef<CanvasViewer>();
  const elementRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const readConfig: UserConfig = ConfigStore.getData();
    ConfigStore.store.onDidAnyChange(onDidChangeStore);
    ConfigStore.store.onDidChange("asciiMaxWidth", onDidChangeASCIIMaxWidth);

    CanvasViewerRef.current = new CanvasViewer(elementRef.current.id, readConfig);
    function resizeEvent() {
      const width: number = elementRef.current.clientWidth;
      const height: number = elementRef.current.clientHeight;
      CanvasViewerRef.current.setStageSize(width, height);
    }
    window.addEventListener("resize", resizeEvent);
    resizeEvent();
    return () => window.removeEventListener("resize", resizeEvent);
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getCanvasViewer() {
        return CanvasViewerRef.current;
      },
    };
  });

  function onDidChangeASCIIMaxWidth(data: number) {
    CanvasViewerRef.current.updtaeASCIIMaxWidth();
  }

  function onDidChangeStore(data: UserConfig) {
    CanvasViewerRef.current.setParam(data);
  }

  return (
    <>
      <div className={CanvasStyle} id={uniqueId("konva-view-")} ref={elementRef}></div>
    </>
  );
});

export default ReactCanvasViewer;
