import axios from "axios";
import { getSearchURL, ResponseProp } from "./api";
import { useCredentials } from "./authentication";
import { SpendingsGroupProp, SpendingsProp } from "./data";
import { convertDate, convertTime } from "./flight";
import { handleError } from "./utils";

export interface SpendingsFilterProp {
  takeCount?: boolean;
  purchaseDatetimeLower?: Date;
  purchaseDatetimeUpper?: Date;
}

export interface TopCustomersProp {
  email: string;
  totalCommission: number;
  ticketsBought: number;
}

export interface TopResult {
  topByCommission: TopCustomersProp[];
  topByTickets: TopCustomersProp[];
}

const parseSpendingsFilter = (spendingsData: SpendingsFilterProp) => {
  return {
    take_count: spendingsData.takeCount,
    purchase_date_lower: convertDate(spendingsData.purchaseDatetimeLower),
    purchase_date_upper: convertDate(spendingsData.purchaseDatetimeUpper),
    purchase_time_lower: convertTime(spendingsData.purchaseDatetimeLower),
    purchase_time_upper: convertTime(spendingsData.purchaseDatetimeUpper),
  };
};

const parseSpendingsData = (spendingsData: Array<any>): SpendingsProp[] => {
  return spendingsData.reduce(
    (accumulator: SpendingsProp[], current: Array<any>) => {
      const temp = {
        email: current[0],
        ticketID: current[2],
        soldPrice: current[3],
        actualPrice: current[4],
        commission: current[5],
        purchaseDate: current[6],
        purchaseTime: current[7],
      };
      accumulator.push(temp);
      return accumulator;
    },
    []
  );
};

const parseTopCustomersData = (topCustData: Array<any>): TopCustomersProp[] => {
  let doneCommission = false;
  return topCustData.reduce(
    (accumulator: TopResult, current: Array<any>) => {
      if (current[0] === "divide") {
        doneCommission = true;
        return accumulator;
      }
      const temp = {
        email: current[0],
        totalCommission: current[1],
        ticketsBought: current[2],
      } as TopCustomersProp;
      if (doneCommission) {
        accumulator.topByTickets.push(temp);
      } else {
        accumulator.topByCommission.push(temp);
      }
      return accumulator;
    },
    { topByTickets: [], topByCommission: [] } as TopResult
  );
};

export const getSpendingsByMonth = (
  props: SpendingsFilterProp
): Promise<ResponseProp<SpendingsGroupProp[]>> => {
  if (!props.purchaseDatetimeLower && !props.purchaseDatetimeUpper) {
    // By default, we want to only track the spendings in the past 6 months
    const lower = new Date();
    lower.setMonth(lower.getMonth() - 6);
    props.purchaseDatetimeLower = lower;
    props.purchaseDatetimeUpper = new Date();
  }
  return axios
    .post(
      getSearchURL("advanced_spendings"),
      {
        filter_data: {
          ...parseSpendingsFilter(props),
          group_by_month: true,
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
            ticketCount: current[2],
          } as SpendingsGroupProp;
          accumulator.push(temp);
          return accumulator;
        },
        [] as SpendingsGroupProp[]
      );
      return data;
    }, handleError);
};

export const getSpendingsByRange = (
  props: SpendingsFilterProp
): Promise<ResponseProp<SpendingsProp[]>> => {
  if (!props.purchaseDatetimeLower && !props.purchaseDatetimeUpper) {
    // By default, we want to only track the spendings in the past 30 days
    const lower = new Date();
    lower.setUTCDate(lower.getUTCDate() - 30);
    props.purchaseDatetimeLower = lower;
  }
  return axios
    .post(
      getSearchURL("advanced_spendings"),
      { filter_data: parseSpendingsFilter(props) },
      useCredentials
    )
    .then((res) => {
      const data = res.data;
      if (data.result === "error") {
        return data;
      } else {
        data.data = JSON.parse(data.data);
        data.data = parseSpendingsData(data.data);
        return data;
      }
    }, handleError);
};

export const getTopCustomers = (): Promise<ResponseProp<TopResult>> => {
  return axios
    .post(getSearchURL("top_customers"), {}, useCredentials)
    .then((res) => {
      const data = res.data;
      if (data.result === "error") {
        return data;
      } else {
        data.data = JSON.parse(data.data);
        data.data = parseTopCustomersData(data.data);
        return data;
      }
    }, handleError);
};
