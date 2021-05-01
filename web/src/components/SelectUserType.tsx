import React from "react";
import { UserType } from "../api/authentication";
import Form from "react-bootstrap/Form";

interface ISelectUserType {
  onChange: React.ChangeEventHandler;
  value: UserType;
}

const SelectUserType = (field: ISelectUserType) => {
  return (
    <Form.Control {...field} as="select">
      <option value={UserType.CUST}>Customer</option>
      <option value={UserType.AGENT}>Booking Agent</option>
      <option value={UserType.STAFF}>Airline Staff</option>
    </Form.Control>
  );
};

export default SelectUserType;
