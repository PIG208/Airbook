import React from "react";
import { WithChildren } from "./Utils";
import Card from "react-bootstrap/Card";
import "../assets/Portico.css";

type PorticoProp = {
  title?: string;
};

const Portico = (props: WithChildren<PorticoProp>) => {
  return (
    <Card className="portico">
      <Card.Header>
        <h2>{props.title}</h2>
      </Card.Header>
      <Card.Body>{props.children}</Card.Body>
    </Card>
  );
};

export default Portico;
