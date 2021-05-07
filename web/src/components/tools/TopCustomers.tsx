import { Card } from "react-bootstrap";
import { useEffect, useState } from "react";
import {
  getTopCustomers,
  TopCustomersProp,
  TopResult,
} from "../../api/spendings";
import AlertMessage from "../AlertMessage";
import { Bar } from "react-chartjs-2";
import NothingHere from "../NothingHere";

export default function ViewCommission() {
  const [errorMessage, setErrorMessage] = useState("");
  const [topCustomerData, setTopCustomerData] = useState<TopResult>();

  useEffect(() => {
    fetchTopCustomers();
  }, []);

  const fetchTopCustomers = () => {
    getTopCustomers().then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "Some network errors occurred!");
        return;
      }
      setTopCustomerData(res.data);
    });
  };

  return (
    <div>
      <Card>
        <Card.Header>Your Commission</Card.Header>
        <Card.Body>
          <AlertMessage message={errorMessage} />
          {!!topCustomerData ? (
            <div>
              <div className="chart-container">
                <Bar
                  data={{
                    labels: topCustomerData.topByCommission.reduce(
                      (accu: Array<any>, curr: TopCustomersProp) => {
                        accu.push(curr.email);
                        return accu;
                      },
                      []
                    ),
                    datasets: [
                      {
                        label: "Top 5 Customers by Commssion",
                        data: topCustomerData.topByCommission.reduce(
                          (accu: Array<any>, curr: TopCustomersProp) => {
                            accu.push(curr.totalCommission);
                            return accu;
                          },
                          []
                        ),
                        backgroundColor: "rgba(100, 230, 132)",
                      },
                    ],
                  }}
                  type="bar"
                />
              </div>

              <div className="chart-container">
                <Bar
                  data={{
                    labels: topCustomerData.topByTickets.reduce(
                      (accu: Array<any>, curr: TopCustomersProp) => {
                        accu.push(curr.email);
                        return accu;
                      },
                      []
                    ),
                    datasets: [
                      {
                        label: "Top 5 Customers by Tickets",
                        data: topCustomerData.topByTickets.reduce(
                          (accu: Array<any>, curr: TopCustomersProp) => {
                            accu.push(curr.ticketsBought);
                            return accu;
                          },
                          []
                        ),
                        backgroundColor: "rgba(123, 99, 200)",
                      },
                    ],
                  }}
                  type="bar"
                />
              </div>
            </div>
          ) : (
            <NothingHere />
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
