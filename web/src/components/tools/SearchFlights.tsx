import { MouseEventHandler } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";

export default function SearchFlights(props: { onClick: MouseEventHandler }) {
  return (
    <Form>
      <InputGroup>
        <Form.Control placeholder="enter"></Form.Control>
        <InputGroup.Append>
          <Button onClick={props.onClick}>Search</Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  );
}
