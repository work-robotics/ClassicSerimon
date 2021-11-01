// Copyright 2021 Work Robotics Co., Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export class UInt8ExtendArray {
  private _datas: ArrayBuffer[];
  private _datasView: Uint8Array[];
  private _maxSize: number;
  private _areaCounter: number;
  private _arrayHead: number;

  constructor(maxSize: number = 10000000) {
    this._maxSize = maxSize;
    this._areaCounter = 0;
    this._arrayHead = 0;
    this._datas = [];
    this._datasView = [];
    this._datas.push(new ArrayBuffer(this._maxSize));
    this._datasView.push(new Uint8Array(this._datas[0]));
  }

  public append(data: number) {
    this._datasView[this._areaCounter][this._arrayHead] = data;
    this._arrayHead++;
    if (this._arrayHead == this._maxSize) {
      this._areaCounter++;
      this._arrayHead = 0;
      this._datas.push(new ArrayBuffer(this._maxSize));
      this._datasView.push(new Uint8Array(this._datas[this._areaCounter]));
    }
  }

  public at(n: number) {
    const sr = Math.min(this._areaCounter, Math.floor(n / this._maxSize));
    return this._datasView[sr][n - this._maxSize * sr];
  }

  public slice(s: number, e: number): number[] {
    if (s > this.size()) return [];
    const ne = Math.min(this.size(), e);
    const sr = Math.min(this._areaCounter, Math.floor(s / this._maxSize));
    const er = Math.min(this._areaCounter, Math.floor(e / this._maxSize));

    if (sr == er) {
      return Array.from(this._datasView[sr].slice(s - this._maxSize * sr, ne - this._maxSize * er));
    }
    return [
      ...Array.from(this._datasView[sr].slice(s - this._maxSize * sr, this._maxSize)),
      ...this._datasView.slice(sr + 1, er).reduce((pre, current) => {
        pre.push(...Array.from(current));
        return pre;
      }, []),
      ...Array.from(this._datasView[er].slice(0, ne - this._maxSize * er)),
    ];
  }

  public size() {
    const a = this._maxSize * this._areaCounter;
    return a + this._arrayHead;
  }

  public clear() {
    this._areaCounter = 0;
    this._arrayHead = 0;
    this._datas = [];
    this._datasView = [];
    this._datas.push(new ArrayBuffer(this._maxSize));
    this._datasView.push(new Uint8Array(this._datas[0]));
  }
}

export default UInt8ExtendArray;
