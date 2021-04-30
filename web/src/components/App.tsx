import React from "react";
import { login, register, UserType } from "../api/authentication";
import logo from "../assets/logo.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/App.css";
import Login from "../pages/login";

register({
  registerType: UserType.AGENT,
  email: "asd@asd.com",
  password: "asdasd",
}).then((res) => {
  console.log(res);
});

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div style={{ display: "block" }}>
          <Login />
        </div>
      </header>
    </div>
  );
}
