import React, { useState, useContext } from "react";
import { useInterval } from "react-timing-hooks";
import { DeviceStatusContext } from "./TotalProvider";
import { css } from "emotion";
import SerialPort from "serialport";

const DeviceSelector: React.FC = () => {
  console.log("[Run] DeviceSelector");

  const { state: deviceStatus, setState: setDeviceStatus } = useContext(DeviceStatusContext);
  const [deviceList, setDeviceList] = useState<string[]>([]);

  function updateDeviceStatus(devices: string[]) {
    if (deviceStatus.selectedDevice === "" && devices.length > 0) {
      setDeviceStatus({ selectedDevice: devices[0] });
    } else if (!devices.find((item) => item === deviceStatus.selectedDevice)) {
      if (devices.length > 0) {
        setDeviceStatus({ selectedDevice: devices[0] });
      } else {
        setDeviceStatus({ selectedDevice: "" });
      }
    }
  }

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setDeviceStatus({ selectedDevice: event.target.value });
  }

  const Style = css`
    font-size: 16px;
    color: #3d3d3d;
    background-color: #f1f1f1;
    height: 100%;
    width: 200px;
  `;

  const contents = deviceList.map((data, index) => (
    <option key={index} value={data}>
      {" "}
      {data}
    </option>
  ));
  return (
    <>
      <select className={Style} onChange={onChange} value={deviceStatus.selectedDevice}>
        {contents}
      </select>
    </>
  );
};

export default DeviceSelector;
