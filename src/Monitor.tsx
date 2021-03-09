import React, { useEffect, useRef, useContext, useState } from "react";
import { remote } from "electron";
import fs from "fs";
import { Container, Row, Col, Button } from "react-bootstrap";
import { css } from "emotion";
import BaudrateSelector from "./BaudrateSelector";
import DeviceSelector from "./DeviceSelector";
import ReactCanvasViewer, { CanvasViewerRef } from "./CanvasViewer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlug, faSave } from "@fortawesome/free-solid-svg-icons";
import SerialPort from "serialport";
import { BaudrateSelectorContext, DeviceStatusContext } from "./TotalProvider";

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
  const counter = useRef<number>(0);

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
          fs.writeFile(result.filePath, canvasViewerRef.current.getCanvasViewer().getTexts().join("\n"), (error) => {
            if (error != null) {
              alert("Save Error.");
              return;
            }
          });
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
          {/* <Col>Status</Col> */}
          <Col className={StatusMenu}>
            <DeviceSelector />
            <BaudrateSelector />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Monitor;
