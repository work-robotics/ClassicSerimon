import React, { ReactElement } from "react";
import { css } from "emotion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import CustomStyle from "./CustomStyle";

export type ModalWindowProps = {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  content: ReactElement;
};

const ModalWindow: React.FC<ModalWindowProps> = (props) => {
  const Overlay = css`
    ${CustomStyle.modalWindow.overlay}
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const OverlayContent = css`
    ${CustomStyle.modalWindow.overlayContent}
    z-index: 2;
    margin: 0;
    padding: 0;
    width: 70%;
    height: 70%;
    padding: 0;
    border-radius: 10px;
    overflow-y: hidden;
    font-size: 16px;
    font-weight: bold;
  `;

  const ContentHeader = css`
    ${CustomStyle.modalWindow.contentHeader}
    width: 100%;
    height: 50px;
    padding-top: 10px;
    display: flex;
    position: relative;
  `;

  const ContentMain = css`
    width: 100%;
    height: calc(100% - 50px); //50=30+10+10
    overflow-y: scroll;
    padding: 20px 20px 20px 20px;
  `;

  const CloseBotton = css`
    ${CustomStyle.modalWindow.closeBotton}
    width: 30px;
    height: 30px;
    position: absolute;
    right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    border-radius: 10px;
    :hover {
      cursor: pointer;
    }
  `;

  const ContentTitle = css`
    position: absolute;
    left: 0px;
    font-size: 20px;
  `;

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
