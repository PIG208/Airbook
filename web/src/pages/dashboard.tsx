// We will have a left bar for functionalities
// and a main view for displaying the data
import "../assets/dashboard.css";

import { AuthContext, useAuth } from "../api/use-auth";
import Home from "../components/tools/Home";
import {
  AgentTools,
  CustomerTools,
  inUserTools,
  ITools,
  PublicTools,
  StaffTools,
  Tools,
} from "../api/tool";
import {
  useRouteMatch,
  Route,
  Switch,
  Link,
  useHistory,
} from "react-router-dom";
import { Nav } from "react-bootstrap";
import { ReactComponent as Plane } from "../assets/paper-plane.svg";
import {
  List,
  House,
  Receipt,
  BoxArrowRight,
  Handbag,
  ChatRightText,
  Cash,
  People,
  Wallet,
  Search,
  ChatDotsFill,
} from "react-bootstrap-icons";
import { PublicUser } from "../api/authentication";
import ViewFlights from "../components/tools/ViewFlights";
import { useEffect } from "react";
import LookupFlights from "../components/tools/LookupFlights";
import PurchaseTickets from "../components/tools/PurchaseTickets";
import AccessDenied from "../components/tools/AccessDenied";
import ToolNotFound from "../components/tools/ToolNotFound";
import ViewSpendings from "../components/tools/ViewSpendings";
import Feedback from "../components/tools/Feedback";
import FeedbackDisplay from "../components/tools/FeedbackDisplay";
import ViewCommission from "../components/tools/ViewCommission";
import TopCustomers from "../components/tools/TopCustomers";

type DashboardRoute = {
  tool: ITools;
  ToolView: (props: { auth: AuthContext }) => React.ReactElement;
  sidebar: (props: { auth: AuthContext }) => JSX.Element;
};

const routes: DashboardRoute[] = [
  {
    tool: PublicTools.HOME,
    ToolView: () => <Home />,
    sidebar: () => (
      <div>
        <House />
        Home
      </div>
    ),
  },
  {
    tool: PublicTools.VIEW_FLIGHTS,
    ToolView: () => <ViewFlights />,
    sidebar: () => (
      <div>
        <List />
        View Flights
      </div>
    ),
  },
  {
    tool: PublicTools.SEARCH_FLIGHTS,
    ToolView: () => <LookupFlights />,
    sidebar: () => (
      <div>
        <Search />
        Search Flights
      </div>
    ),
  },
  {
    tool: Tools.PURCHASE,
    ToolView: () => <PurchaseTickets />,
    sidebar: () => (
      <div>
        <Handbag />
        Purchase Tickets
      </div>
    ),
  },
  {
    tool: CustomerTools.VIEW_SPENDINGS,
    ToolView: () => <ViewSpendings />,
    sidebar: () => (
      <div>
        <Wallet />
        View Spendings
      </div>
    ),
  },
  {
    tool: CustomerTools.COMMENT,
    ToolView: () => <Feedback />,
    sidebar: () => (
      <div>
        <ChatRightText />
        Comment & Rate
      </div>
    ),
  },
  {
    tool: AgentTools.VIEW_COMMISSION,
    ToolView: () => <ViewCommission />,
    sidebar: () => (
      <div>
        <Cash />
        View Commission
      </div>
    ),
  },
  {
    tool: AgentTools.TOP_CUST,
    ToolView: () => <TopCustomers />,
    sidebar: () => (
      <div>
        <People />
        Top Customers
      </div>
    ),
  },
  {
    tool: StaffTools.VIEW_REPORT,
    ToolView: () => <Home />,
    sidebar: () => (
      <div>
        <Receipt />
        View Report
      </div>
    ),
  },
  {
    tool: StaffTools.VIEW_RATINGS,
    ToolView: () => <FeedbackDisplay />,
    sidebar: () => (
      <div>
        <ChatDotsFill />
        View Ratings
      </div>
    ),
  },
  {
    tool: Tools.LOGOUT,
    ToolView: ({ auth }) => {
      let history = useHistory();
      const Logout = () => {
        useEffect(() => {
          auth.logout(() => {
            history.push("/visitor");
          });
        }, []);
        return <div></div>;
      };
      return <Logout />;
    },
    sidebar: ({ auth }) => (
      <div>
        <BoxArrowRight />
        {auth.userProp === PublicUser ? "Login" : "Logout"}
      </div>
    ),
  },
];

export default function Dashboard() {
  let match = useRouteMatch<{ tool: string }>("/dashboard/:tool");
  let history = useHistory();
  const auth = useAuth();

  useEffect(() => {
    if (match?.params.tool === undefined) {
      history.replace("/dashboard/home");
    }
    if (!auth.authPending) {
      auth.fetchSession();
    }
  }, []);

  return (
    <div className="dashboard">
      <Nav className="flex-column dashboard-navbar" variant="pills">
        <div className="nav-brand">
          <Plane className="nav-icon" fill="white" stroke="transparent" />
          <h2>Airbook</h2>
        </div>
        {routes
          .filter((route) => {
            return inUserTools(route.tool, auth.userProp.userType);
          })
          .map((route, index) => {
            return (
              <Nav.Item key={index}>
                <Link
                  to={`/dashboard/${route.tool}`}
                  className={`nav-link ${
                    match?.params.tool === route.tool ? "active" : ""
                  }`}
                >
                  <route.sidebar auth={auth} />
                </Link>
              </Nav.Item>
            );
          })}
      </Nav>
      <div className="dashboard-view">
        <div className="dashboard-main">
          <Switch>
            {routes.map((route, index) => {
              return (
                <Route
                  key={index}
                  path={`/dashboard/${route.tool}`}
                  children={
                    inUserTools(route.tool, auth.userProp.userType) ? (
                      <route.ToolView auth={auth} />
                    ) : (
                      <AccessDenied />
                    )
                  }
                />
              );
            })}
            <Route path={`/dashboard/:tool`}>
              <ToolNotFound />
            </Route>
          </Switch>
        </div>
        <footer>
          <div>
            Special thanks to <a href="https://reactjs.org/">React</a>/
            <a href="https://react-bootstrap.github.io/">React-Bootstrap</a>/
            <a href="https://flask.palletsprojects.com/en/1.1.x/">Flask</a>/
            <a href="https://www.freepik.com" title="Freepik">
              Freepik
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
