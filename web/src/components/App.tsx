import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "../assets/App.css";
import Visitor from "../pages/visitor";
import Dashboard from "../pages/dashboard";
import { ProvideAuth, useAuth } from "../api/use-auth";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import { useEffect } from "react";
import { UserType } from "../api/authentication";

function Redirector() {
  let history = useHistory();
  const auth = useAuth();

  useEffect(() => {
    auth.fetchSession().then((data) => {
      if (
        data.result === "success" &&
        data.userData?.userType !== UserType.PUBLIC
      ) {
        history.replace("/dashboard");
      } else {
        history.replace("/visitor");
      }
    });
  }, []);

  return <div></div>;
}

export default function App() {
  return (
    <div className="App">
      <ProvideAuth>
        <Router>
          <Switch>
            <Route path="/visitor">
              <Visitor />
            </Route>
            <Route path="/dashboard">
              <Dashboard />
            </Route>
            <Route path="/">
              <Redirector />
            </Route>
          </Switch>
        </Router>
      </ProvideAuth>
    </div>
  );
}
