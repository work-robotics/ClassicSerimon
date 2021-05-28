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

export default ExtendArray;
