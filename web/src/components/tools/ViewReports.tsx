import { Form } from "react-bootstrap";
import { forwardRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SpendingsFilterProp, getSpendingsByMonth } from "../../api/spendings";
import AlertMessage from "../AlertMessage";
import { SpendingsGroupProp } from "../../api/data";
import { Bar } from "react-chartjs-2";
import RangePicker from "../RangePicker";

export default function ViewReports() {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SpendingsFilterProp>();
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketTotal, setTicketTotal] = useState(0);
  const [chartData, setChartData] = useState({});
  const watchLowerBound = watch("purchaseDatetimeLower");
  const watchUpperBound = watch("purchaseDatetimeUpper");

  useEffect(() => {
    handleViewSpendings({
      purchaseDatetimeLower: watchLowerBound,
      purchaseDatetimeUpper: watchUpperBound,
    } as SpendingsFilterProp);
  }, [watchLowerBound, watchUpperBound]);

  const handleChartData = (spendingsData: SpendingsGroupProp[]) => {
    setChartData({
      labels: spendingsData.reduce(
        (accu: Array<any>, curr: SpendingsGroupProp) => {
          accu.push(curr.groupDate);
          return accu;
        },
        []
      ),
      datasets: [
        {
          label: "Total tickets",
          data: spendingsData.reduce(
            (accu: Array<any>, curr: SpendingsGroupProp) => {
              accu.push(curr.ticketCount);
              return accu;
            },
            []
          ),
          backgroundColor: "#ffc107",
        },
      ],
    });
  };

  const handleViewSpendings = (data: SpendingsFilterProp) => {
    getSpendingsByMonth(Object.assign({}, data, { takeCount: true })).then(
      (res) => {
        if (res.result === "error") {
          setErrorMessage(res.message ?? "Some network errors occurred!");
          return;
        }
        if (res.data === undefined) {
          setTicketTotal(0);
          return;
        }
        handleChartData(res.data);
        setTicketTotal(
          res.data.reduce((sum: number, current: SpendingsGroupProp) => {
            return sum + Number(current.ticketCount);
          }, 0)
        );
      }
    );
  };

  return (
    <div>
      <Form onSubmit={handleSubmit(handleViewSpendings)} autoComplete="off">
        <AlertMessage message={errorMessage} />
        <RangePicker
          lowerName="purchaseDatetimeLower"
          lowerDisplay="Purchase Time Lower Bound"
          upperName="purchaseDatetimeUpper"
          upperDisplay="Purchase Time Upper Bound"
          lowerError={errors.purchaseDatetimeLower}
          upperError={errors.purchaseDatetimeUpper}
          control={control}
        />
      </Form>
      <div>
        The total number of tickets sold is <strong>{ticketTotal}</strong>{" "}
        {watchLowerBound ? (
          <span>
            after <strong>{watchLowerBound.toLocaleString()}</strong>
          </span>
        ) : (
          ""
        )}{" "}
        {watchUpperBound ? (
          <span>
            before <strong>{watchUpperBound.toLocaleString()}</strong>
          </span>
        ) : (
          ""
        )}
        {!watchLowerBound && !watchUpperBound && "in the last six months"}
      </div>
      <div>
        {ticketTotal > 0 ? (
          <div className="chart-container">
            <Bar redraw={false} data={chartData} type="bar" />
          </div>
        ) : (
          <div>no data</div>
        )}
      </div>
    </div>
  );
}
