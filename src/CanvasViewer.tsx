import React, { useEffect, useRef, useImperativeHandle, forwardRef, useContext } from "react";
import Konva from "konva";
import { css } from "emotion";
import CanvasViewer from "./CanvasViewer/CanvasViewer";
import uniqueId from "lodash/uniqueId";
import { UserConfig } from "./CanvasViewer/Types";
import ConfigStore from "./ConfigStore";
import { useInterval } from "react-timing-hooks";
import { MeasureFreqContext } from "./TotalProvider";
import CustomStyle from "./CustomStyle";

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

  const { state: measureFreq, setState: setMeasureFreq } = useContext(MeasureFreqContext);

  useInterval(() => {
    if (CanvasViewerRef.current.getParam().userConfig.asciiMode) {
      setMeasureFreq({ time: CanvasViewerRef.current.enterReceiveCounter });
    } else {
      const currentTime = CanvasViewerRef.current.currentReceiveCounter;
      setMeasureFreq({ time: currentTime / CanvasViewerRef.current.getParam().maxLineNum });
    }
    CanvasViewerRef.current.currentReceiveCounter = 0;
    CanvasViewerRef.current.enterReceiveCounter = 0;
  }, 1000);

  useEffect(() => {
    const readConfig: UserConfig = ConfigStore.getData();
    ConfigStore.userStore.onDidAnyChange(onDidChangeStore);
    ConfigStore.userStore.onDidChange("asciiMaxWidth", onDidChangeASCIIMaxWidth);
    ConfigStore.userStore.onDidChange("fontSize", onDidChangeASCIIMaxWidth);

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

  function onDidChangeASCIIMaxWidth(data: any) {
    CanvasViewerRef.current.updtaeASCIIMaxWidth();
  }

  function onDidChangeStore(data: UserConfig) {
    if (data.darkMode) {
      CustomStyle.setDarkColor();
    } else {
      CustomStyle.setLightColor();
    }
    CanvasViewerRef.current.setParam(data);
  }

  return (
    <>
      <div className={CanvasStyle} id={uniqueId("konva-view-")} ref={elementRef}></div>
    </>
  );
});

export default ReactCanvasViewer;
