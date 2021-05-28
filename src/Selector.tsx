import React, { ReactElement } from "react";
import { css } from "emotion";
import CustomStyle from "./CustomStyle";

export type SelectorProps = {
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string | number;
  width: string;
  content: JSX.Element[];
};

const Selector: React.FC<SelectorProps> = (props) => {
  const Style = css`
    ${CustomStyle.selector}
    font-size: 16px;
    height: 100%;
    width: ${props.width};
    font-size: 14px;
    font-weight: bold;
    font-family: Yu Gothic UI, Helvetica, Ubuntu;
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
