import { Card, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SpendingsFilterProp, getSpendingsByRange } from "../../api/spendings";
import AlertMessage from "../AlertMessage";
import { SpendingsProp } from "../../api/data";
import RangePicker from "../RangePicker";

export default function ViewCommission() {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<SpendingsFilterProp>();
  const [errorMessage, setErrorMessage] = useState("");
  const [commissionTotal, setCommissionTotal] = useState(0);
  const [numTicket, setNumTicket] = useState(0);
  const watchLowerBound = watch("purchaseDatetimeLower");
  const watchUpperBound = watch("purchaseDatetimeUpper");

  useEffect(() => {
    handleViewSpendings({
      purchaseDatetimeLower: watchLowerBound,
      purchaseDatetimeUpper: watchUpperBound,
    } as SpendingsFilterProp);
  }, [watchLowerBound, watchUpperBound]);

  const handleViewSpendings = (data: SpendingsFilterProp) => {
    getSpendingsByRange(data).then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "Some network errors occurred!");
        return;
      }
      if (res.data === undefined || !(res.data.length > 0)) {
        setCommissionTotal(0);
        setNumTicket(0);
        return;
      }
      //handleChartData(res.data);
      setNumTicket(res.data.length);
      setCommissionTotal(
        res.data.reduce((sum: number, current: SpendingsProp) => {
          return sum + Number(current.commission);
        }, 0)
      );
    });
  };

  return (
    <div>
      <Card>
        <Card.Header>Your Commission</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit(handleViewSpendings)} autoComplete="off">
            <AlertMessage message={errorMessage} />
            <RangePicker
              control={control}
              lowerName="purchaseDatetimeLower"
              lowerDisplay="Purchased After"
              upperName="purchaseDatetimeUpper"
              upperDisplay="Purchased Before"
              lowerError={errors.purchaseDatetimeLower}
              upperError={errors.purchaseDatetimeUpper}
            />
          </Form>
          <h4>Lastest Statistics</h4>
          {numTicket > 0 ? (
            <span>
              Your average commission is{" "}
              <strong>${(commissionTotal / numTicket).toFixed(2)}</strong> and{" "}
              {numTicket === 1 ? (
                <span>
                  <strong>{numTicket}</strong> ticket was sold{" "}
                </span>
              ) : (
                <span>
                  <strong>{numTicket}</strong> tickets were sold{" "}
                </span>
              )}
            </span>
          ) : (
            <span>No commission received or tickets sold </span>
          )}
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
          {!watchLowerBound && !watchUpperBound && "in the last 30 days."}
        </Card.Body>
      </Card>
    </div>
  );
}
