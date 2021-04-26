import React, { ReactElement } from "react";
import { css } from "emotion";

export type SelectorProps = {
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string | number;
  width: string;
  content: JSX.Element[];
};

const Selector: React.FC<SelectorProps> = (props) => {
  const Style = css`
    font-size: 16px;
    color: #3d3d3d;
    background-color: #f1f1f1;
    height: 100%;
    width: ${props.width};
  `;

  return (
    <>
      <select className={Style} onChange={props.onChange} value={props.value}>
        {props.content}
      </select>
    </>
  );
};

export default Selector;
