import { css } from "emotion";

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
  public monitor: MonitorColor;
  public modalWindow: ModalColor;

  constructor() {
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
}

export default new CustomStyle();
