import React, { useEffect, useRef, useContext, useState } from "react";
import { remote } from "electron";
import fs from "fs";
import { Container, Row, Col, Button } from "react-bootstrap";
import { css } from "emotion";
import BaudrateSelector from "./BaudrateSelector";
import DeviceSelector from "./DeviceSelector";
import ReactCanvasViewer from "./CanvasViewer";
import { CanvasViewerRef } from "./CanvasViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug, faSave, faCog, faBroom } from "@fortawesome/free-solid-svg-icons";
import SerialPort from "serialport";
import { BaudrateSelectorContext, DeviceStatusContext } from "./TotalProvider";
import MeasureStatus from "./MeasureStatus";
import ConfigPanel from "./ConfigPanel";
import SavePanel from "./SavePanel";
import ConfigStore from "./ConfigStore";
import CustomStyle from "./CustomStyle";
import path from "path";
import dateFormat from "dateformat";

const ContainerStyleBase: React.CSSProperties = { paddingLeft: 0, paddingRight: 0 };

const ContainerStyle = css`
  height: 100vh;
`;

const HeaderStyle = css`
  ${CustomStyle.monitor.header}
  height: 50px;
  text-align: right;
  align-items: center;
  padding: 0 15px 0 15px;
`;

const ContentStyle = css`
  ${CustomStyle.monitor.content}
  height: calc(100vh - 75px);
`;

const FooterStyle = css`
  ${CustomStyle.monitor.footer}
  height: 25px;
  padding: 0 0 0 10px;
  background-color: #e6e6e6;
`;

// FooterStyleで適用しているボーダと一体化させるためのmargin-topを-1px
const StatusLeftMenu = css`
  text-align: right;
  margin-top: -1px;
`;

const StatusRightMenu = css`
  font-size: 14px;
  font-weight: bold;
  margin-left: 10px;
  font-family: Yu Gothic UI, Helvetica, Ubuntu;
`;

const StatusRightLogo = css`
  width: 90px;
  height: 25px;
  margin-top: -2px;
  margin-left: -10px;
  text-align: center;
  vertical-align: middle;
  background-color: #ffffff;
  border-right: 1px solid #b4b4b4;
  font-family: Yu Gothic UI, Helvetica, Ubuntu;
`;

const LeftMenu = css`
  text-align: left;
`;

const RightMenu = css`
  text-align: right;
`;

const Monitor: React.FC = () => {
  console.log("[Run] Monitor");

  const SerialPortRef = useRef<SerialPort>();
  const { state: baudrateStatus, setState: setBaudrateStatus } = useContext(BaudrateSelectorContext);
  const { state: deviceStatus, setState: setDeviceStatus } = useContext(DeviceStatusContext);
  const canvasViewerRef = useRef<CanvasViewerRef>();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [openSettingWindow, setOpenSettingWindow] = useState<boolean>(false);
  const [openSaveWindow, setOpenSaveWindow] = useState<boolean>(false);
  const [changeColorMode, setChangeColorMode] = useState<boolean>();

  const counter = useRef<number>(0);

  useEffect(() => {
    ConfigStore.userStore.onDidChange("darkMode", (data: boolean) => {
      setChangeColorMode(data);
    });
  }, []);

  const HeaderStyle = css`
    ${CustomStyle.monitor.header}
    height: 50px;
    text-align: right;
    align-items: center;
    padding: 0 15px 0 15px;
  `;

  const ContentStyle = css`
    ${CustomStyle.monitor.content}
    height: calc(100vh - 75px);
  `;

  const FooterStyle = css`
    ${CustomStyle.monitor.footer}
    height: 25px;
    padding: 0 0 0 10px;
  `;

  function saveBottonHandler(e) {
    e.preventDefault();
    setOpenSaveWindow(true);
  }

  function settingBottonHandler(e) {
    e.preventDefault();
    setOpenSettingWindow(true);
  }

  function clearBottonHandler(e) {
    e.preventDefault();
    canvasViewerRef.current.getCanvasViewer().clearText();
    canvasViewerRef.current.getCanvasViewer().cleanFirstReceivedDate();
    counter.current = 0;
  }

  function startBottonHandler(e) {
    e.preventDefault();
    if (!isConnected) {
      SerialPortRef.current = new SerialPort(deviceStatus.selectedDevice, {
        baudRate: baudrateStatus.selectedBaudrate,
      });
      SerialPortRef.current.on("data", (data) => {
        if (!canvasViewerRef.current.getCanvasViewer().isSettedFirstReceivedDate()) {
          canvasViewerRef.current.getCanvasViewer().setFirstReceivedDate();
        }
        for (const d of data) {
          canvasViewerRef.current.getCanvasViewer().addText([d]);
        }
      });
      setIsConnected(true);
    } else {
      SerialPortRef.current.close();
      SerialPortRef.current = undefined;
      setIsConnected(false);
    }
  }

  function saveHandler() {
    if (SerialPortRef.current != undefined) {
      SerialPortRef.current.pause();
    }
    remote.dialog
      .showOpenDialog(null, { properties: ["openDirectory"] })
      .then((result) => {
        // console.log(result.filePaths[0]);
        let filename = "";

        // デバイスコードをファイル名に含める
        const deviceCode = ConfigStore.metaStore.get("deviceCode");
        if (deviceCode == "") {
          filename += "NODEVICECODE_";
        } else {
          filename += deviceCode + "_";
        }

        // 保存時のタイムスタンプを作成してファイル名に含める
        const saveTimeStamp = new Date();
        filename += dateFormat(saveTimeStamp, "yyyymmdd-HHMMss") + ".wrel";
        if (!result.canceled) {
          const fd = fs.openSync(path.join(result.filePaths[0], filename), "w");
          // メタ情報の追加
          fs.writeSync(fd, "VERSION:0.0.1\n");
          fs.writeSync(fd, "SAVE_TIMESTAMP:" + saveTimeStamp.getTime() + "\n");
          const firstReceivedDate = canvasViewerRef.current.getCanvasViewer().getFirstReceivedDate();
          if (firstReceivedDate != undefined) {
            fs.writeSync(fd, "FIRSTRECEIVED_TIMESTAMP:" + firstReceivedDate.getTime() + "\n");
          } else {
            fs.writeSync(fd, "FIRSTRECEIVED_TIMESTAMP:" + "\n");
          }
          fs.writeSync(fd, "USER:" + ConfigStore.metaStore.get("user") + "\n");
          fs.writeSync(fd, "DATE:" + ConfigStore.metaStore.get("date") + "\n");
          fs.writeSync(fd, "LOCATION:" + ConfigStore.metaStore.get("location") + "\n");
          fs.writeSync(fd, "EXPERIMENT_NAME:" + ConfigStore.metaStore.get("expName") + "\n");
          fs.writeSync(fd, "EXPERIMENT_DESCRIPTION:" + ConfigStore.metaStore.get("expDescription") + "\n");
          fs.writeSync(fd, "DEVICECODE:" + ConfigStore.metaStore.get("deviceCode") + "\n");
          fs.writeSync(fd, "MEMO:" + ConfigStore.metaStore.get("memo") + "\n");
          fs.writeSync(fd, "---\n");
          const textSize = canvasViewerRef.current.getCanvasViewer().getTextsSize();
          const blockSize = 1024;
          for (var i = 0; i < Math.ceil(textSize / blockSize); i++) {
            const data = canvasViewerRef.current.getCanvasViewer().getTextsSlice(i * blockSize, (i + 1) * blockSize);
            let bufferArray = Buffer.alloc(data.length);
            for (let k = 0; k < data.length; k++) {
              bufferArray.writeUInt8(data[k], k);
            }
            fs.writeSync(fd, bufferArray);
          }
          fs.closeSync(fd);
        }
        if (SerialPortRef.current != undefined) {
          SerialPortRef.current.resume();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <Container fluid style={ContainerStyleBase} className={ContainerStyle}>
        <Row noGutters={true} className={HeaderStyle}>
          <Col className={LeftMenu}>
            {isConnected && (
              <Button variant="dark" onClick={startBottonHandler}>
                <FontAwesomeIcon
                  icon={faPlug}
                  className={css`
                    color: #fd9a9a;
                  `}
                />{" "}
                {" Stop"}
              </Button>
            )}
            {!isConnected && (
              <Button variant="dark" onClick={startBottonHandler}>
                <FontAwesomeIcon
                  icon={faPlug}
                  className={css`
                    color: #ffffff;
                  `}
                />{" "}
                {" Start"}
              </Button>
            )}
          </Col>
          <Col className={RightMenu}>
            <Button variant="dark" onClick={settingBottonHandler}>
              <FontAwesomeIcon icon={faCog} />
              {" Open Setting"}
            </Button>{" "}
            <Button variant="dark" onClick={saveBottonHandler}>
              <FontAwesomeIcon icon={faSave} /> {" Save"}
            </Button>{" "}
            <Button variant="dark" onClick={clearBottonHandler}>
              <FontAwesomeIcon icon={faSave} /> {" Clear"}
            </Button>
          </Col>
        </Row>
        <Row noGutters={true} className={ContentStyle}>
          <ReactCanvasViewer ref={canvasViewerRef} />
        </Row>
        <Row noGutters={true} className={FooterStyle}>
          <div className={StatusRightLogo}>
            <a href="https://work-robotics.co.jp/" target="_blank">
              <img src={"./Images/wrlogo.png"} height={8} alt="" />
            </a>
          </div>
          <Col className={StatusRightMenu}>
            <MeasureStatus />
          </Col>
          <Col className={StatusLeftMenu}>
            <DeviceSelector />
            <BaudrateSelector />
          </Col>
        </Row>
      </Container>
      <ConfigPanel show={openSettingWindow} setShow={setOpenSettingWindow} />
      <SavePanel show={openSaveWindow} setShow={setOpenSaveWindow} saveRequest={saveHandler} />
    </>
  );
};

export default Monitor;
