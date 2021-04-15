import React, { createContext, useState } from "react";

// Common
export type StateContextType<T> = {
  state: T;
  setState?: React.Dispatch<React.SetStateAction<T>>;
};

// BaudrateSelector
export type BaudrateStatus = {
  selectedBaudrate: number;
};

// DeviceSelector
export type DeviceStatus = {
  selectedDevice: string;
};

export type MeasureFreq = {
  time: number;
};

// ------------------------------------------------------------------

// コンテキストの作成
export const BaudrateSelectorContext = createContext<StateContextType<BaudrateStatus>>({
  state: { selectedBaudrate: 0 },
});

export const DeviceStatusContext = createContext<StateContextType<DeviceStatus>>({
  state: { selectedDevice: "" },
});

export const MeasureFreqContext = createContext<StateContextType<MeasureFreq>>({
  state: { time: 0 },
});

// ------------------------------------------------------------------
const BaudrateStatusProvider: React.FC = (props) => {
  const [baudrateStatus, setBaudrateStatus] = useState<BaudrateStatus>({ selectedBaudrate: 9600 });
  return (
    <BaudrateSelectorContext.Provider value={{ state: baudrateStatus, setState: setBaudrateStatus }}>
      {props.children}
    </BaudrateSelectorContext.Provider>
  );
};

const DeviceStatusProvider: React.FC = (props) => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({ selectedDevice: "" });
  return (
    <DeviceStatusContext.Provider value={{ state: deviceStatus, setState: setDeviceStatus }}>
      {props.children}
    </DeviceStatusContext.Provider>
  );
};

const MeasureFreqProvider: React.FC = (props) => {
  const [measureFreq, setMeasureFreq] = useState<MeasureFreq>({ time: 0 });
  return (
    <MeasureFreqContext.Provider value={{ state: measureFreq, setState: setMeasureFreq }}>
      {props.children}
    </MeasureFreqContext.Provider>
  );
};
// ------------------------------------------------------------------

export const TotalProvider: React.FC = (props) => {
  console.log("[Update] TotalProvider");
  return (
    <BaudrateStatusProvider>
      <DeviceStatusProvider>
        <MeasureFreqProvider>{props.children}</MeasureFreqProvider>
      </DeviceStatusProvider>
    </BaudrateStatusProvider>
  );
};

export default TotalProvider;
