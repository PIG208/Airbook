import { Card } from "react-bootstrap";
import { useEffect, useState } from "react";
import { TopCustomersProp } from "../../api/spendings";
import AlertMessage from "../AlertMessage";
import { Bar } from "react-chartjs-2";
import {
  TopDestinationResult,
  getTopDestinations,
  TopDestinationProp,
} from "../../api/staff";

export default function ViewCommission() {
  const [errorMessage, setErrorMessage] = useState("");
  const [chartData, setChartData] = useState({
    lastThreeMonths: {},
    lastYear: {},
  });

  useEffect(() => {
    fetchTopDestinations();
  }, []);

  const handleChartData = (destinationsResult: TopDestinationResult) => {
    setChartData({
      lastThreeMonths: {
        labels: destinationsResult.lastThreeMonths.reduce(
          (accu: Array<any>, curr: TopDestinationProp) => {
            accu.push(curr.city);
            return accu;
          },
          []
        ),
        datasets: [
          {
            label: "Top Cities as Destinations in the Past Three Months",
            data: destinationsResult.lastThreeMonths.reduce(
              (accu: Array<any>, curr: TopDestinationProp) => {
                accu.push(curr.visits);
                return accu;
              },
              []
            ),
            backgroundColor: "rgba(100, 230, 132)",
          },
        ],
      },
      lastYear: {
        labels: destinationsResult.lastYear.reduce(
          (accu: Array<any>, curr: TopDestinationProp) => {
            accu.push(curr.city);
            return accu;
          },
          []
        ),
        datasets: [
          {
            label: "Top Cities as Destinations in the Last Year",
            data: destinationsResult.lastYear.reduce(
              (accu: Array<any>, curr: TopDestinationProp) => {
                accu.push(curr.visits);
                return accu;
              },
              []
            ),
            backgroundColor: "rgba(123, 99, 200)",
          },
        ],
      },
    });
  };

  const fetchTopDestinations = () => {
    getTopDestinations().then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "Some network errors occurred!");
        return;
      }
      if (
        res.data === undefined ||
        (res.data.lastYear.length === 0 &&
          res.data.lastThreeMonths.length === 0)
      ) {
        setErrorMessage("No data to display!");
      }
      if (res.data !== undefined) {
        handleChartData(res.data);
      }
    });
  };

  return (
    <div>
      <AlertMessage message={errorMessage} />
      <div className="card-flex-container">
        <Card>
          <Card.Header>Top Destinations in the Last 3 Months</Card.Header>
          <div className="chart-container">
            <Bar redraw={false} data={chartData.lastThreeMonths} type="bar" />
          </div>
        </Card>
        <Card>
          <Card.Header>Top Destinations in the Last Year</Card.Header>
          <div className="chart-container">
            <Bar redraw={false} data={chartData.lastYear} type="bar" />
          </div>
        </Card>
      </div>
    </div>
  );
}
