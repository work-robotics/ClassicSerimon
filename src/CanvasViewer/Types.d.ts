export type UserConfig = {
  fontSize: number;
  rowHeight: number;
  fontFamily: string;
  maxLineNum: number;
  asciiMode: boolean;
  asciiMaxWidth: number;
};

export type SysConfig = {
  baudrate: number;
};

export type CanvasViewerRef = {
  getCanvasViewer(): CanvasViewer;
};
