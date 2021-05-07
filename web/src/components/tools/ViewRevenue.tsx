import { useEffect, useState } from "react";
import AlertMessage from "../AlertMessage";
import { Pie } from "react-chartjs-2";
import { getRevenue, RevenueProp } from "../../api/staff";
import { Card } from "react-bootstrap";

export default function ViewRevenue() {
  const [errorMessage, setErrorMessage] = useState("");
  const [chartData, setChartData] = useState({ lastMonth: {}, lastYear: {} });

  useEffect(() => {
    fetchRevenue();
  }, []);

  const handleChartData = (spendingsData: RevenueProp[]) => {
    setChartData({
      lastMonth: {
        labels: ["direct", "indirect"],
        datasets: [
          {
            label: "Revenue Comparison",
            data: [spendingsData[0].direct, spendingsData[0].indirect],
            backgroundColor: "rgba(120, 150, 200)",
          },
        ],
      },
      lastYear: {
        labels: ["direct", "indirect"],
        datasets: [
          {
            label: "Revenue Comparison",
            data: [spendingsData[1].direct, spendingsData[1].indirect],
            backgroundColor: "rgba(150, 120, 200)",
          },
        ],
      },
    });
  };

  const fetchRevenue = () => {
    getRevenue().then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "Some network errors occurred!");
        return;
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
          <Card.Header>Statistics in the Last Month</Card.Header>
          <div className="chart-container">
            <Pie redraw={false} data={chartData.lastMonth} type="pie" />
          </div>
        </Card>
        <Card>
          <Card.Header>Statistics in the Last Year</Card.Header>
          <div className="chart-container">
            <Pie redraw={false} data={chartData.lastYear} type="pie" />
          </div>
        </Card>
      </div>
    </div>
  );
}
