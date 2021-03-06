import {
  getAddAirplaneURL,
  getAddAirportURL,
  getChangeFlightStatusURL,
  getCreateFlightURL,
  getPublicSearchURL,
  getSearchURL,
  ResponseProp,
} from "./api";
import axios from "axios";
import {
  AirplaneProp,
  AirportProp,
  FlightFormProp,
  FlightPrimaryProp,
  FlightProp,
  FlightStatus,
} from "./data";
import { useCredentials } from "./authentication";
import { handleError, handleThen } from "./utils";

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

export interface FlightFilterProp {
  filterByEmails?: boolean; // Equivalent to view purchased flights
  filterByAgentID?: boolean; // Equivalent to view purchased flights
  emails?: string[]; // Staff users only
  isCustomer?: boolean; // Staff users only
  flightNumber?: number;
  depTimeLower?: Date;
  depTimeUpper?: Date;
  arrTimeLower?: Date;
  arrTimeUpper?: Date;
  returnTimeLower?: Date;
  returnTimeUpper?: Date;
  depAirport?: string;
  depCity?: string;
  arrAirport?: string;
  arrCity?: string;
}

export const parseFlightPrimary = (props: FlightPrimaryProp) => {
  return {
    flight_number: props.flightNumber,
    dep_date: props.depDate,
    dep_time: props.depTime,
  };
};

export const parseFlightFormProp = (props: FlightFormProp) => {
  return {
    flight_number: props.flightNumber,
    dep_date: convertDate(props.depDatetime),
    dep_time: convertTime(props.depDatetime),
    arr_date: convertDate(props.arrDatetime),
    arr_time: convertTime(props.arrDatetime),
    dep_airport: props.depAirport,
    arr_airport: props.arrAirport,
    plane_ID: props.planeID,
    status: props.status,
    base_price: props.basePrice,
  };
};

const parseFlightData = (flightData: Array<any>): FlightProp[] => {
  return flightData.reduce((accumulator, current) => {
    let temp = {
      flightNumber: current[4],
      airlineName: current[3],
      depCity: current[12],
      depAirport: current[1],
      arrCity: current[13],
      arrAirport: current[0],
      depDate: current[5],
      depTime: current[6],
      arrDate: current[7],
      arrTime: current[8],
      basePrice: current[9],
      status: current[10],
      seatCapacity: current[11],
      planeID: current[2],
    };
    accumulator.push(temp);
    return accumulator;
  }, []) as FlightProp[];
};

const parseAirplaneData = (airplaneData: Array<any>): AirplaneProp[] => {
  return airplaneData.reduce((accumulator, current) => {
    let temp = {
      airlineName: current[0],
      planeID: current[1],
      seatCapacity: current[2],
    } as AirplaneProp;
    accumulator.push(temp);
    return accumulator;
  }, []);
};

const flightDataHandler = [
  (res: any): ResponseProp<FlightProp[]> & { message: string } => {
    // A message is required for the handler
    const data = res.data;
    if (data.result === "error") {
      return data;
    }
    let flightData = JSON.parse(data.data ?? "") as Array<any>;
    if (flightData !== undefined) {
      return {
        result: "success",
        message: "",
        data: parseFlightData(flightData),
      };
    }
    return { result: "error", message: "Failed to parse the flight data." };
  },
  handleError,
];

export function futureFlights(): Promise<ResponseProp<FlightProp[]>> {
  return axios
    .post<{ data?: string; result: string; message?: string }>(
      getPublicSearchURL("all_future")
    )
    .then(...flightDataHandler);
}

export function previousFlights(): Promise<ResponseProp<FlightProp[]>> {
  return axios
    .post(
      getSearchURL("advanced_flight"),
      {
        filter_data: {
          dep_date_upper: convertDate(new Date()),
          dep_time_upper: convertTime(new Date()),
          filter_by_emails: true,
        },
      },
      useCredentials
    )
    .then(...flightDataHandler);
}

export function custFutureFlights(): Promise<ResponseProp<FlightProp[]>> {
  let now = new Date();
  return axios
    .post<{ data?: string; result: string; message?: string }>(
      getSearchURL("advanced_flight"),
      {
        filter_data: {
          filter_by_emails: true,
          dep_date_lower: convertDate(now),
          dep_time_lower: convertTime(now),
        },
      },
      useCredentials
    )
    .then(...flightDataHandler);
}

export function searchFlightsPublic(
  props: FlightFilterProp
): Promise<ResponseProp<FlightProp[]>> {
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

export function searchFlightsReturnPublic(
  props: FlightFilterProp
): Promise<ResponseProp<FlightProp[]>> {
  if (!props.returnTimeUpper && !props.returnTimeLower) {
    return new Promise(() => {
      return {
        result: "error",
        message: "Round trips need to have return datetime!",
      };
    });
  }
  if (!props.arrCity || !props.depCity) {
    return new Promise(() => {
      return {
        result: "error",
        message: "Round trips need to have arrival city and depature city!",
      };
    });
  }
  return searchFlightsPublic(
    Object.assign({}, props, {
      depTimeLower: props.returnTimeLower,
      depTimeUpper: props.returnTimeUpper,
      depCity: props.arrCity,
      arrCity: props.depCity,
    } as FlightFilterProp)
  );
}

export function searchFlightsReturn(
  props: FlightFilterProp
): Promise<ResponseProp<FlightProp[]>> {
  if (
    props.returnTimeUpper === undefined &&
    props.returnTimeLower === undefined
  ) {
    return new Promise(() => {
      return {
        result: "error",
        message: "Round trips need to have return datetime!",
      };
    });
  }
  if (props.arrCity === undefined || props.depCity === undefined) {
    return new Promise(() => {
      return {
        result: "error",
        message: "Round trips need to have arrival city and depature city!",
      };
    });
  }
  return searchFlights(
    Object.assign({}, props, {
      depTimeLower: props.returnTimeLower,
      depTimeUpper: props.returnTimeUpper,
      depCity: props.arrCity,
      arrCity: props.depCity,
    } as FlightFilterProp)
  );
}

export function searchFlights(
  props: FlightFilterProp
): Promise<ResponseProp<FlightProp[]>> {
  return axios
    .post(
      getSearchURL("advanced_flight"),
      {
        filter_data: {
          filter_by_emails: props.filterByEmails,
          filter_by_agent_id: props.filterByAgentID,
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
      useCredentials
    )
    .then(...flightDataHandler);
}

export async function getFlightByNumber(
  flightNumber: number,
  future: boolean = false
): Promise<ResponseProp<FlightProp[]>> {
  if (isNaN(flightNumber) || (!flightNumber && flightNumber !== 0)) {
    return new Promise((resolve) => {
      resolve({ result: "error", message: "Invalid flight number" });
    });
  }
  return searchFlights({
    flightNumber: flightNumber,
    depTimeLower: future ? new Date() : undefined,
  });
}

export async function getFlightCustomers(
  props: FlightPrimaryProp
): Promise<ResponseProp<{ email: string; name: string; tickets: number }[]>> {
  return axios
    .post(
      getSearchURL("flight_customers"),
      { filter_data: { ...parseFlightPrimary(props) } },
      useCredentials
    )
    .then(handleThen, handleError)
    .then((data: ResponseProp) => {
      data.data = JSON.parse(data.data);
      data.data = data.data.reduce(
        (
          accumulator: { email: string; name: string; tickets: number }[],
          current: any
        ) => {
          const temp = {
            email: current[0],
            name: current[1],
            tickets: current[2],
          };
          accumulator.push(temp);
          return accumulator;
        },
        []
      );
      return data;
    });
}

export async function createFlight(
  flight_data: FlightFormProp
): Promise<ResponseProp> {
  return axios
    .post(
      getCreateFlightURL(),
      parseFlightFormProp(flight_data),
      useCredentials
    )
    .then(handleThen, handleError);
}

export async function changeFlightStatus(
  flight_data: FlightPrimaryProp & { status: FlightStatus }
): Promise<ResponseProp> {
  return axios
    .post(
      getChangeFlightStatusURL(),
      {
        ...parseFlightPrimary(flight_data),
        status: flight_data.status,
      },
      useCredentials
    )
    .then(handleThen, handleError);
}

export async function addAirport(
  airport_data: AirportProp
): Promise<ResponseProp> {
  return axios
    .post(
      getAddAirportURL(),
      {
        airport_name: airport_data.airportName,
        city: airport_data.city,
      },
      useCredentials
    )
    .then(handleThen, handleError);
}

export async function addAirplane(
  airplane_data: AirplaneProp
): Promise<ResponseProp> {
  return axios
    .post(
      getAddAirplaneURL(),
      {
        plane_ID: airplane_data.planeID,
        seat_capacity: airplane_data.seatCapacity,
      },
      useCredentials
    )
    .then(handleThen, handleError);
}

export async function fetchAirplanes(): Promise<ResponseProp<AirplaneProp[]>> {
  return axios
    .post(getSearchURL("airline_planes"), {}, useCredentials)
    .then(handleThen, handleError)
    .then((data: ResponseProp) => {
      data.data = JSON.parse(data.data);
      data.data = parseAirplaneData(data.data);
      return data;
    });
}
