import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import Konva from "konva";
import { css } from "emotion";
import CanvasViewer from "./CanvasViewer/CanvasViewer";
import uniqueId from "lodash/uniqueId";

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
    CanvasViewerRef.current = new CanvasViewer(elementRef.current.id);
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

  return (
    <>
      <div className={CanvasStyle} id={uniqueId("konva-view-")} ref={elementRef}></div>
    </>
  );
});

export default ReactCanvasViewer;
