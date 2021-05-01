import React from "react";
import { register, UserType } from "../api/authentication";
import logo from "../assets/logo.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/App.css";
import Visitor from "../pages/visitor";

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div>
          <Visitor />
        </div>
      </header>
    </div>
  );
}
