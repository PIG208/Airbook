import React from "react";
import { WithChildren } from "./Utils";

type PorticoProp = {
  title?: string;
};

const Portico = (props: WithChildren<PorticoProp>) => {
  return (
    <div style={{ minWidth: "400px" }}>
      <h1>{props.title}</h1>
      {props.children}
    </div>
  );
};

export default Portico;
