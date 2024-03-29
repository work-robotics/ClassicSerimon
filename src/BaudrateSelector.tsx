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

import React, { useContext, useRef, useEffect } from "react";
import { BaudrateSelectorContext } from "./TotalProvider";
import ConfigStore from "./ConfigStore";
import Selector from "./Selector";

const BaudrateSelector: React.FC = () => {
  console.log("[Run] BaudrateSelector");

  const { state: baudrateStatus, setState: setBaudrateStatus } = useContext(BaudrateSelectorContext);
  const baudrateList = useRef<number[]>([9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600, 1000000, 2000000]);

  useEffect(() => {
    setBaudrateStatus({ selectedBaudrate: ConfigStore.sysStore.get("baudrate") });
    ConfigStore.sysStore.onDidChange("baudrate", onBaudrateChange);
  }, []);

  function onBaudrateChange(baudrate: number) {
    setBaudrateStatus({ selectedBaudrate: baudrate });
  }

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setBaudrateStatus({ selectedBaudrate: parseInt(event.target.value) });
    ConfigStore.sysStore.set("baudrate", parseInt(event.target.value));
  }

  const contents = baudrateList.current.map((data, index) => (
    <option key={index} value={data}>
      {" "}
      {data}
    </option>
  ));
  return (
    <>
      <Selector width={"100px"} onChange={onChange} value={baudrateStatus.selectedBaudrate} content={contents} />
    </>
  );
};

export default BaudrateSelector;
