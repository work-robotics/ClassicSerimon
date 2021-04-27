import { Data } from "electron/main";
import ExtendArray from "./ExtendArray";

export class State {
  public rowTopIndex: number;
  public rowBottomIndex: number;
  public rawDatas: ExtendArray;
  public firstReceivedDate: Date;
  public viewTextDatas: string[];
  public renderDataWidth: number[];
  public scrollHeight: number;
  public scrollTop: number;
  public rowNumber: number;
  public enterPoint: ExtendArray;
  public mouseOriginPosition: { x: number; y: number };
  public mousePosition: { x: number; y: number };
  public mouseOverIndex: { x: number; y: number };
  public mouseOverPastIndex: { x: number; y: number };
  public isMovedMouse: boolean;
  public enableAutoScroll: boolean;
  public selectDirection: string;
  public isVisibleScroolBar: boolean;

  public column_counter: number;
  public column_width_sum: number;

  public selectedIndexs: {
    top: { row: number; start: number; end: number };
    bottom: { row: number; start: number; end: number };
    origin: { row: number; column: number };
  };

  constructor() {
    this.rowTopIndex = 0;
    this.rowBottomIndex = 0;
    this.rawDatas = new ExtendArray();
    this.firstReceivedDate = undefined;
    this.renderDataWidth = [];
    this.scrollHeight = 0;
    this.scrollTop = 0;
    this.rowNumber = 0;
    this.mouseOriginPosition = { x: 0, y: 0 };
    this.mousePosition = { x: 0, y: 0 };
    this.mouseOverIndex = { x: 0, y: 0 };
    this.mouseOverPastIndex = { x: -1, y: -1 };
    this.isMovedMouse = false;
    this.selectedIndexs = {
      top: { row: -1, start: -1, end: -1 },
      bottom: { row: -1, start: -1, end: -1 },
      origin: { row: -1, column: -1 },
    };
    this.selectDirection = "No";
    this.enterPoint = new ExtendArray();
    this.enterPoint.append(0);
    this.column_counter = 0;
    this.column_width_sum = 0;
    this.isVisibleScroolBar = false;
  }
}

export default State;
