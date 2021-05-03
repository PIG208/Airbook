import { getPublicSearchURL, getSearchURL, ResponseProp } from "./api";
import axios from "axios";
import { FlightProp } from "./data";
import { resolve } from "node:path";

export interface FlightFilterProp {
  filterByEmails?: boolean; // Equivalent to view purchased flights
  emails?: string[]; // Staff users only
  isCustomer?: boolean; // Staff users only
  flightNumber?: number;
  depTimeLower?: Date;
  depTimeUpper?: Date;
  arrTimeLower?: Date;
  arrTimeUpper?: Date;
  depAirport?: string;
  depCity?: string;
  arrAirport?: string;
  arrCity?: string;
}

const parseFlightData = (flightData: Array<any>) => {
  return flightData.reduce((accumulator, current) => {
    let temp = {
      flightNumber: current[0],
      depDate: current[1],
      depTime: current[2],
      depAirport: current[3],
      arrDate: current[4],
      arrTime: current[5],
      arrAirport: current[6],
      basePrice: current[7],
      status: current[8],
      planeID: current[9],
      airlineName: current[10],
    };
    accumulator.push(temp);
    return accumulator;
  }, []) as FlightProp[];
};

const flightDataHandler = [
  (res: any) => {
    const data = res.data;
    let flightData = JSON.parse(data.data ?? "") as Array<any>;
    if (data.result === "error") {
      return data;
    }
    if (flightData !== undefined) {
      return {
        result: "success",
        data: parseFlightData(flightData),
      };
    }
    return { result: "error", message: "Failed to parse the flight data." };
  },
  (err: any) => {
    return {
      result: "error",
      message: "Network error occurred while fetching data.",
    };
  },
];

export function futureFlights(): Promise<ResponseProp> {
  return axios
    .post<{ data?: string; result: string; message?: string }>(
      getPublicSearchURL("all_future")
    )
    .then(...flightDataHandler);
}

export const convertDate = (date: Date | undefined) => {
  if (!date) {
    return undefined;
  } else {
    return date.toISOString().slice(0, 10);
  }
};

export const convertTime = (date: Date | undefined) => {
  if (!date) {
    return undefined;
  } else {
    return date.toISOString().slice(11, -5);
  }
};

export function searchFlightsPublic(
  props: FlightFilterProp
): Promise<ResponseProp> {
  return axios
    .post(getPublicSearchURL("advanced_flight"), {
      filter_data: {
        filter_by_emails: props.filterByEmails,
        emails: props.emails,
        is_customer: props.isCustomer,
        flight_number: props.flightNumber,
        dep_date_lower: convertDate(props.depTimeLower),
        dep_date_upper: convertDate(props.depTimeUpper),
        dep_time_lower: convertTime(props.depTimeLower),
        dep_time_upper: convertTime(props.depTimeUpper),
        arr_date_lower: convertDate(props.arrTimeLower),
        arr_date_upper: convertDate(props.arrTimeUpper),
        arr_time_lower: convertTime(props.arrTimeLower),
        arr_time_upper: convertTime(props.arrTimeUpper),
        dep_airport: props.depAirport,
        dep_city: props.depCity,
        arr_airport: props.arrAirport,
        arr_city: props.arrCity,
      },
    })
    .then(...flightDataHandler);
}

export function searchFlights(props: FlightFilterProp): Promise<ResponseProp> {
  return axios
    .post(
      getSearchURL("advanced_flight"),
      {
        filter_data: {
          filter_by_emails: props.filterByEmails,
          emails: props.emails,
          is_customer: props.isCustomer,
          flight_number: props.flightNumber,
          dep_date_lower: convertDate(props.depTimeLower),
          dep_date_upper: convertDate(props.depTimeUpper),
          dep_time_lower: convertTime(props.depTimeLower),
          dep_time_upper: convertTime(props.depTimeUpper),
          arr_date_lower: convertDate(props.arrTimeLower),
          arr_date_upper: convertDate(props.arrTimeUpper),
          arr_time_lower: convertTime(props.arrTimeLower),
          arr_time_upper: convertTime(props.arrTimeUpper),
          dep_airport: props.depAirport,
          dep_city: props.depCity,
          arr_airport: props.arrAirport,
          arr_city: props.arrCity,
        },
      },
      {
        withCredentials: true,
      }
    )
    .then(...flightDataHandler);
}

export async function getFlightByNumber(
  flightNumber: number
): Promise<ResponseProp> {
  if (isNaN(flightNumber) || (!flightNumber && flightNumber !== 0)) {
    return new Promise((resolve) => {
      resolve({ result: "error", message: "Invalid flight number" });
    });
  }
  return searchFlights({ flightNumber: flightNumber });
}
