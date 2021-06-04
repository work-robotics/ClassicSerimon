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
