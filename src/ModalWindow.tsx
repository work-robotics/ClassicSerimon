import React, { ReactElement } from "react";
import { css } from "emotion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Overlay = css`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OverlayContent = css`
  z-index: 2;
  margin: 0;
  padding: 0;
  width: 70%;
  height: 70%;
  background: #fff;
  padding: 0;
  border-radius: 10px;
  border: 1px solid #242424;
  overflow-y: hidden;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 10px 10px 10px 10px rgba(0, 0, 0, 0.1);
`;

const ContentHeader = css`
  width: 100%;
  height: 50px;
  padding-top: 10px;
  display: flex;
  position: relative;
  border-bottom: 1px solid #000;
`;

const ContentMain = css`
  width: 100%;
  height: calc(100% - 50px); //50=30+10+10
  overflow-y: scroll;
  padding: 20px 20px 20px 20px;
`;

const CloseBotton = css`
  width: 30px;
  height: 30px;
  position: absolute;
  right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  background: #eee;
  border-radius: 10px;
  :hover {
    background: #ddd;
    cursor: pointer;
  }
`;

const ContentTitle = css`
  position: absolute;
  left: 0px;
  font-size: 20px;
`;

export type ModalWindowProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  content: ReactElement;
};

const ModalWindow: React.FC<ModalWindowProps> = (props) => {
  function CloseBottonEvent() {
    props.setShow(false);
  }

  if (props.show) {
    return (
      <>
        <div className={Overlay} onClick={CloseBottonEvent}>
          <div className={OverlayContent} onClick={(e) => e.stopPropagation()}>
            <div className={ContentHeader}>
              <div onClick={CloseBottonEvent} className={CloseBotton}>
                <FontAwesomeIcon icon={faTimes} />
              </div>
              <div className={ContentTitle}>　{props.title}</div>
            </div>
            <div className={ContentMain}>{props.content}</div>
          </div>
        </div>
      </>
    );
  } else {
    return null;
  }
};

export default ModalWindow;
