export class ExtendArray {
  private _datas: number[][];
  private _maxSize: number;
  private _areaCounter: number;

  constructor() {
    this._datas = [[]];
    this._maxSize = 10000000;
    this._areaCounter = 0;
  }

  public append(data: number) {
    this._datas[this._areaCounter].push(data);
    if (this._datas[this._areaCounter].length == this._maxSize) {
      this._datas.push([]);
      this._areaCounter++;
    }
  }

  public at(n: number) {
    const sr = Math.min(this._areaCounter, Math.floor(n / this._maxSize));
    return this._datas[sr][n - this._maxSize * sr];
  }

  public slice(s: number, e: number) {
    const sr = Math.min(this._areaCounter, Math.floor(s / this._maxSize));
    const er = Math.min(this._areaCounter, Math.floor(e / this._maxSize));

    if (sr == er) {
      return this._datas[sr].slice(s - this._maxSize * sr, e - this._maxSize * er);
    }
    return [
      ...this._datas[sr].slice(s - this._maxSize * sr, this._maxSize),
      ...this._datas.slice(sr + 1, er).reduce((pre, current) => {
        pre.push(...current);
        return pre;
      }, []),
      ...this._datas[er].slice(0, e - this._maxSize * er),
    ];
  }

  public size() {
    return this._maxSize * this._areaCounter + this._datas[this._areaCounter].length;
  }

  public clear() {
    this._areaCounter = 0;
    this._datas = [];
    this._datas.push([]);
  }
}

export class State {
  public rowTopIndex: number;
  public rowBottomIndex: number;
  public rawDatas: ExtendArray;
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
  }
}

export default State;
