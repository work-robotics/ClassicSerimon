export class State {
  public rowTopIndex: number;
  public rowBottomIndex: number;
  public renderDatas: string[];
  public renderDatasWidth: number[][];
  public scrollHeight: number;
  public scrollTop: number;
  public rowNumber: number;

  public mouseOriginPosition: { x: number; y: number };
  public mousePosition: { x: number; y: number };
  public mouseOverIndex: { x: number; y: number };
  public isMovedMouse: boolean;

  public selectedIndexs: {
    top: { row: number; start: number; end: number };
    bottom: { row: number; start: number; end: number };
    origin: { row: number; column: number };
  };

  constructor() {
    this.rowTopIndex = 0;
    this.rowBottomIndex = 0;
    this.renderDatas = [];
    this.renderDatasWidth = [];
    this.scrollHeight = 0;
    this.scrollTop = 0;
    this.rowNumber = 0;
    this.mouseOriginPosition = { x: 0, y: 0 };
    this.mousePosition = { x: 0, y: 0 };
    this.mouseOverIndex = { x: 0, y: 0 };
    this.isMovedMouse = false;
    this.selectedIndexs = {
      top: { row: -1, start: -1, end: -1 },
      bottom: { row: -1, start: -1, end: -1 },
      origin: { row: -1, column: -1 },
    };
  }
}

export default State;
