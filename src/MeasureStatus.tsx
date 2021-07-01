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

import React, { useState, useContext } from "react";
import { MeasureFreqContext } from "./TotalProvider";

const MeasureStatus: React.FC = () => {
  // console.log("[Run] MeasureStatus");
  const { state: measureFreq, setState: setMeasureFreq } = useContext(MeasureFreqContext);

  return <>Freq: {measureFreq.time.toFixed(3)}[Hz]</>;
};

export default MeasureStatus;
