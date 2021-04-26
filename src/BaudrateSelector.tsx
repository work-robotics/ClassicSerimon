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
