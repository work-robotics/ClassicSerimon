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

// ------------------------------------------------------------------

// コンテキストの作成
export const BaudrateSelectorContext = createContext<StateContextType<BaudrateStatus>>({
  state: { selectedBaudrate: 0 },
});

export const DeviceStatusContext = createContext<StateContextType<DeviceStatus>>({
  state: { selectedDevice: "" },
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
// ------------------------------------------------------------------

export const TotalProvider: React.FC = (props) => {
  console.log("[Update] TotalProvider");
  return (
    <BaudrateStatusProvider>
      <DeviceStatusProvider>{props.children}</DeviceStatusProvider>
    </BaudrateStatusProvider>
  );
};

export default TotalProvider;
