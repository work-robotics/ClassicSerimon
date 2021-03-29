import React, { useState, useContext, useRef } from "react";
import { BaudrateSelectorContext } from "./TotalProvider";
import { css } from "emotion";

const BaudrateSelector: React.FC = () => {
  console.log("[Run] BaudrateSelector");

  const { state: baudrateStatus, setState: setBaudrateStatus } = useContext(BaudrateSelectorContext);
  const baudrateList = useRef<number[]>([9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600, 1000000, 2000000]);

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setBaudrateStatus({ selectedBaudrate: parseInt(event.target.value) });
  }

  const Style = css`
    font-size: 16px;
    color: #3d3d3d;
    background-color: #f1f1f1;
    height: 100%;
    width: 100px;
  `;

  const contents = baudrateList.current.map((data, index) => (
    <option key={index} value={data}>
      {" "}
      {data}
    </option>
  ));
  return (
    <>
      <select className={Style} onChange={onChange} value={baudrateStatus.selectedBaudrate}>
        {contents}
      </select>
    </>
  );
};

export default BaudrateSelector;
