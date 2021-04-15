import React, { useState, useContext } from "react";
import { MeasureFreqContext } from "./TotalProvider";

const MeasureStatus: React.FC = () => {
  // console.log("[Run] MeasureStatus");
  const { state: measureFreq, setState: setMeasureFreq } = useContext(MeasureFreqContext);

  return <>Frequency: {measureFreq.time.toFixed(3)}[Hz]</>;
};

export default MeasureStatus;
