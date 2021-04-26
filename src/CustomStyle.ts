import { css } from "emotion";
import ConfigStore from "./ConfigStore";

export type MonitorColor = {
  header: string;
  footer: string;
  content: string;
};

export type ModalColor = {
  overlay: string;
  overlayContent: string;
  contentHeader: string;
  closeBotton: string;
};

export class CustomStyle {
  public selector: string;
  public monitor: MonitorColor;
  public modalWindow: ModalColor;

  constructor() {
    if (ConfigStore.getData().darkMode) {
      this.setDarkColor();
    } else {
      this.setLightColor();
    }
  }

  public setLightColor() {
    this.selector = css`
      color: #3d3d3d;
      background-color: #f1f1f1;
    `;
    this.monitor = {
      header: css`
        background-color: #e8e8e8;
        border-bottom: solid 1px #d3d3d3;
        border-top: solid 1px #d3d3d3;
      `,
      footer: css`
        border-top: solid 1px #d3d3d3;
        background-color: #e6e6e6;
      `,
      content: css`
        background-color: #fff;
      `,
    };

    this.modalWindow = {
      overlay: css`
        background-color: rgba(0, 0, 0, 0.6);
      `,
      overlayContent: css`
        border: 1px solid #242424;
        background: #fff;
        color: #000;
        box-shadow: 10px 10px 10px 10px rgba(0, 0, 0, 0.1);
      `,
      contentHeader: css`
        border-bottom: 1px solid #000;
      `,
      closeBotton: css`
        background: #eee;
        :hover {
          background: #ddd;
        }
      `,
    };
  }

  public setDarkColor() {
    this.selector = css`
      color: #bbbbbb;
      background-color: #21252b;
      border: 1px solid #131313;
    `;

    this.monitor = {
      header: css`
        color: #bbbbbb;
        background-color: #21252b;
        border-top: solid 1px #18191a;
        border-bottom: solid 1px #131313;
      `,
      footer: css`
        border-top: solid 1px #131313;
        background-color: #21252b;
        color: #bbbbbb;
      `,
      content: css`
        background-color: #282c34;
      `,
    };

    this.modalWindow = {
      overlay: css`
        background-color: rgba(0, 0, 0, 0.6);
      `,
      overlayContent: css`
        border: 1px solid #242424;
        background: #21252b;
        color: #bbbbbb;
        box-shadow: 10px 10px 10px 10px rgba(0, 0, 0, 0.1);
      `,
      contentHeader: css`
        border-bottom: 1px solid #000;
      `,
      closeBotton: css`
        background: #1a1d22;
        :hover {
          background: #282c33;
        }
      `,
    };
  }
}

export default new CustomStyle();
