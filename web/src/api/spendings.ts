import axios from "axios";
import { getSearchURL, ResponseProp } from "./api";
import { useCredentials } from "./authentication";
import { SpendingsGroupProp } from "./data";
import { convertDate, convertTime } from "./flight";

export interface SpendingsFilterProp {
  purchaseDatetimeLower?: Date;
  purchaseDatetimeUpper?: Date;
}

export const getSpendingsByMonth = (
  props: SpendingsFilterProp
): Promise<ResponseProp<SpendingsGroupProp[]>> => {
  if (!props.purchaseDatetimeLower && !props.purchaseDatetimeUpper) {
    // By default, we want to only track the spendings in the past 6 months
    const lower = new Date();
    lower.setMonth(lower.getMonth() - 6);
    props.purchaseDatetimeLower = lower;
  }
  return axios
    .post(
      getSearchURL("advanced_spendings"),
      {
        filter_data: {
          purchase_date_lower: convertDate(props.purchaseDatetimeLower),
          purchase_date_upper: convertDate(props.purchaseDatetimeUpper),
          purchase_time_lower: convertTime(props.purchaseDatetimeLower),
          purchase_time_upper: convertTime(props.purchaseDatetimeUpper),
          group: "MONTH",
        },
      },
      useCredentials
    )
    .then((res) => {
      const data = res.data;
      if (data.result === "error") {
        return data;
      }
      data.data = JSON.parse(data.data);
      data.data = data.data.reduce(
        (accumulator: SpendingsGroupProp[], current: Array<any>) => {
          const temp = {
            groupDate: current[0],
            spendingsSum: current[1],
          } as SpendingsGroupProp;
          accumulator.push(temp);
          return accumulator;
        },
        [] as SpendingsGroupProp[]
      );
      return data;
    });
};
