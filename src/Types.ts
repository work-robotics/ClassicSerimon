import React from "react";

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
