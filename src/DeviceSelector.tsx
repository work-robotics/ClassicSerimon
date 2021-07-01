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
import { useInterval } from "react-timing-hooks";
import { DeviceStatusContext } from "./TotalProvider";
import { css } from "emotion";
import SerialPort from "serialport";
import Selector from "./Selector";

const DeviceSelector: React.FC = () => {
  console.log("[Run] DeviceSelector");

  const { state: deviceStatus, setState: setDeviceStatus } = useContext(DeviceStatusContext);
  const [deviceList, setDeviceList] = useState<string[]>([]);

  useInterval(() => {
    SerialPort.list().then((ports) => {
      const devices: string[] = ports.map((port) => port.path);
      const diff_device = devices.filter((device) => deviceList.indexOf(device) == -1);
      if (devices.length != deviceList.length || diff_device.length > 0) {
        setDeviceList(devices);
        updateDeviceStatus(devices);
      }
    });
  }, 1000);

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

  const contents = deviceList.map((data, index) => (
    <option key={index} value={data}>
      {" "}
      {data}
    </option>
  ));
  return (
    <>
      <Selector width={"200px"} onChange={onChange} value={deviceStatus.selectedDevice} content={contents} />
    </>
  );
};

export default DeviceSelector;
