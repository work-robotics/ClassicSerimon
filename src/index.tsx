import React from "react";
import ReactDOM from "react-dom";
import Monitor from "./Monitor";
import TotalProvider from "./TotalProvider";
import "bootstrap/dist/css/bootstrap.css";

const App: React.FC = () => {
  return (
    <TotalProvider>
      <Monitor />
    </TotalProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "1";
