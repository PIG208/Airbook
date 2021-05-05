import { Button, Col, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { forwardRef, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SpendingsFilterProp, getSpendingsByMonth } from "../../api/spendings";
import AlertMessage from "../AlertMessage";
import { SpendingsGroupProp } from "../../api/data";
import { Bar } from "react-chartjs-2";

export function ViewSpendings() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    watch,
  } = useForm<SpendingsFilterProp>();
  const [errorMessage, setErrorMessage] = useState("");
  const [spendingsData, setSpendingsData] = useState<SpendingsGroupProp[]>([]);
  const [spendingsTotal, setSpendingsTotal] = useState(0);
  const [chartData, setChartData] = useState({});
  const watchLowerBound = watch("purchaseDatetimeLower");
  const watchUpperBound = watch("purchaseDatetimeUpper");

  useEffect(() => {
    console.log("reloaded");
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
  }, [spendingsData]);

  useEffect(() => {
    handleViewSpendings(getValues());
  }, [watchLowerBound, watchUpperBound]);

  const handleViewSpendings = (data: SpendingsFilterProp) => {
    getSpendingsByMonth(data).then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "Some network errors occurred!");
        return;
      }

      if (res.data === undefined) {
        setSpendingsData([]);
        return;
      }

      console.log("1");
      setSpendingsData(res.data);
      console.log("2");
      setSpendingsTotal(
        spendingsData.reduce((sum: number, current: SpendingsGroupProp) => {
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
        <Form.Row>
          <Form.Group as={Col} controlId="formSpendingsDateLower">
            <Form.Label>Purchase Time Lower Bound</Form.Label>
            <Controller
              name="purchaseDatetimeLower"
              control={control}
              defaultValue={""}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  selected={value}
                  onChange={onChange}
                  placeholderText="(Optional)"
                  wrapperClassName={"form-control"}
                  showTimeSelect
                  dateFormat="yyyy/MM/dd h:mm aa"
                  customInput={
                    <DateCustomInput
                      isInvalid={errors.purchaseDatetimeLower !== undefined}
                    />
                  }
                />
              )}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="formSpendingsDateUpper">
            <Form.Label>Purchase Time Upper Bound</Form.Label>
            <Controller
              name="purchaseDatetimeUpper"
              control={control}
              defaultValue={""}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  selected={value}
                  onChange={onChange}
                  placeholderText="(Optional)"
                  wrapperClassName={"form-control"}
                  showTimeSelect
                  dateFormat="yyyy/MM/dd h:mm aa"
                  customInput={
                    <DateCustomInput
                      isInvalid={errors.purchaseDatetimeUpper !== undefined}
                    />
                  }
                />
              )}
            />
          </Form.Group>
        </Form.Row>
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
        <Bar data={chartData} type="bar" />
      </div>
    </div>
  );
}
