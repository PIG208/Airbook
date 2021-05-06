import { Form } from "react-bootstrap";
import { forwardRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SpendingsFilterProp, getSpendingsByMonth } from "../../api/spendings";
import AlertMessage from "../AlertMessage";
import { SpendingsGroupProp } from "../../api/data";
import { Bar } from "react-chartjs-2";
import RangePicker from "../RangePicker";

export default function ViewSpendings() {
  const { handleSubmit, control, watch } = useForm<SpendingsFilterProp>();
  const [errorMessage, setErrorMessage] = useState("");
  const [spendingsTotal, setSpendingsTotal] = useState(0);
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
          label: "Your Spendings",
          data: spendingsData.reduce(
            (accu: Array<any>, curr: SpendingsGroupProp) => {
              accu.push(curr.spendingsSum);
              return accu;
            },
            []
          ),
          backgroundColor: "rgba(255, 99, 132)",
        },
      ],
    });
  };

  const handleViewSpendings = (data: SpendingsFilterProp) => {
    getSpendingsByMonth(data).then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "Some network errors occurred!");
        return;
      }
      if (res.data === undefined) {
        setSpendingsTotal(0);
        return;
      }
      handleChartData(res.data);
      setSpendingsTotal(
        res.data.reduce((sum: number, current: SpendingsGroupProp) => {
          return sum + Number(current.spendingsSum);
        }, 0)
      );
    });
  };

  const DateCustomInput = forwardRef((props: any, ref) => {
    return <Form.Control {...props} ref={ref} />;
  });

  return (
    <div>
      <Form onSubmit={handleSubmit(handleViewSpendings)} autoComplete="off">
        <AlertMessage message={errorMessage} />
        <RangePicker
          lowerName="purchaseDatetimeLower"
          lowerDisplay="Purchase Time Lower Bound"
          upperName="purchaseDatetimeUpper"
          upperDisplay="Purchase Time Upper Bound"
          control={control}
        />
      </Form>
      <div>
        Your total spending is <strong>${spendingsTotal}</strong>{" "}
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
        {spendingsTotal > 0 ? (
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
