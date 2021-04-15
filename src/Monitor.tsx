import React, { useEffect, useRef, useContext, useState } from "react";
import { remote } from "electron";
import fs from "fs";
import { Container, Row, Col, Button } from "react-bootstrap";
import { css } from "emotion";
import BaudrateSelector from "./BaudrateSelector";
import DeviceSelector from "./DeviceSelector";
import ReactCanvasViewer from "./CanvasViewer";
import { CanvasViewerRef } from "./CanvasViewer/Types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug, faSave, faCog } from "@fortawesome/free-solid-svg-icons";
import SerialPort from "serialport";
import { BaudrateSelectorContext, DeviceStatusContext } from "./TotalProvider";
import MeasureStatus from "./MeasureStatus";
import ModalWindow from "./ModalWindow";

const ContainerStyleBase: React.CSSProperties = { paddingLeft: 0, paddingRight: 0 };

const ContainerStyle = css`
  height: 100vh;
`;

const HeaderStyle = css`
  height: 50px;
  text-align: right;
  align-items: center;
  padding: 0 15px 0 15px;
  background-color: #e8e8e8;
  border-bottom: solid 1px #d3d3d3;
  border-top: solid 1px #d3d3d3;
`;

const ContentStyle = css`
  height: calc(100vh - 75px);
  background-color: #fff;
`;

const FooterStyle = css`
  border-top: solid 1px #d3d3d3;
  height: 25px;
  padding: 0 0 0 10px;
  background-color: #e6e6e6;
`;

// FooterStyleで適用しているボーダと一体化させるためのmargin-topを-1px
const StatusMenu = css`
  text-align: right;
  margin-top: -1px;
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

  const counter = useRef<number>(0);

  function settingBottonHandler(e) {
    e.preventDefault();
    setOpenSettingWindow(true);
  }

  function clearBottonHandler(e) {
    e.preventDefault();
    canvasViewerRef.current.getCanvasViewer().clearText();
    counter.current = 0;
  }

  function startBottonHandler(e) {
    e.preventDefault();
    if (!isConnected) {
      SerialPortRef.current = new SerialPort(deviceStatus.selectedDevice, {
        baudRate: baudrateStatus.selectedBaudrate,
      });
      SerialPortRef.current.on("data", (data) => {
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

  function saveBottonHandler(e) {
    e.preventDefault();
    if (SerialPortRef.current != undefined) {
      SerialPortRef.current.pause();
    }
    remote.dialog
      .showSaveDialog(null, { properties: ["createDirectory"] })
      .then((result) => {
        if (!result.canceled) {
          const fd = fs.openSync(result.filePath, "w");
          // メタ情報の追加
          fs.writeSync(fd, "VERSION:0.0.1\n");
          fs.writeSync(fd, "PROTOCOL:None\n");
          fs.writeSync(fd, "USER:WorkRobotics\n");
          fs.writeSync(fd, "TIMESTAMP:" + Date.now().toString() + "\n");
          fs.writeSync(fd, "LOCATION:Home\n");
          fs.writeSync(fd, "DESCRIPTION:試験用のテストデータです。\n");
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
              <Button variant="danger" onClick={startBottonHandler}>
                <FontAwesomeIcon icon={faPlug} /> {" Stop"}
              </Button>
            )}
            {!isConnected && (
              <Button variant="success" onClick={startBottonHandler}>
                <FontAwesomeIcon icon={faPlug} /> {" Start"}
              </Button>
            )}
          </Col>
          <Col className={RightMenu}>
            <Button variant="dark" onClick={settingBottonHandler}>
              <FontAwesomeIcon icon={faCog} />
              {" Open Setting"}
            </Button>{" "}
            <Button variant="secondary" onClick={saveBottonHandler}>
              <FontAwesomeIcon icon={faSave} /> {" Save"}
            </Button>{" "}
            <Button variant="info" onClick={clearBottonHandler}>
              <FontAwesomeIcon icon={faSave} /> {" Clear"}
            </Button>
          </Col>
        </Row>
        <Row noGutters={true} className={ContentStyle}>
          <ReactCanvasViewer ref={canvasViewerRef} />
        </Row>
        <Row noGutters={true} className={FooterStyle}>
          <Col>
            <MeasureStatus />
          </Col>
          <Col className={StatusMenu}>
            <DeviceSelector />
            <BaudrateSelector />
          </Col>
        </Row>
      </Container>
      <ModalWindow show={openSettingWindow} setShow={setOpenSettingWindow} />
    </>
  );
};

export default Monitor;
