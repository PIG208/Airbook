import axios from "axios";
import { FeedbackFormProp } from "../components/FeedbackForm";
import { getAddFeedbackURL, getSearchURL, ResponseProp } from "./api";
import { useCredentials } from "./authentication";
import { FeedbackProp, FlightPrimaryProp } from "./data";
import { parseFlightPrimary } from "./flight";
import { handleError } from "./utils";

const parseFeedbackData = (data: Array<any>): FeedbackProp[] => {
  // Takes an array containing raw feedback data and turn them into an array of FeedbackProp
  if (data.length > 0) {
    return data.reduce((accumulator: FeedbackProp[], current: Array<any>) => {
      accumulator.push({
        flightNumber: current[0],
        depDate: current[1],
        depTime: current[2],
        createdAt: current[3],
        email: current[4],
        rate: current[5],
        comment: current[6],
      } as FeedbackProp);
      return accumulator;
    }, []);
  } else {
    return [];
  }
};

export async function getFeedbacksByFlight(
  props: FlightPrimaryProp
): Promise<ResponseProp<FeedbackProp[]>> {
  return axios
    .post(
      getSearchURL("flight_comments"),
      {
        filter_data: {
          ...parseFlightPrimary(props),
        },
      },
      useCredentials
    )
    .then((res) => {
      const data = res.data;
      if (data.result === "error") {
        return data;
      }
      if (!!data.data) {
        // The comment will be an array of arrays
        data.data = JSON.parse(data.data);
        data.data = parseFeedbackData(data.data);
      }
      return data;
    }, handleError);
}

export const addFeedbackForFlight = (
  props: FlightPrimaryProp & FeedbackFormProp
): Promise<ResponseProp> => {
  return axios
    .post(
      getAddFeedbackURL(),
      {
        ...parseFlightPrimary(props),
        comment: props.comment,
        rating: props.rating,
      },
      useCredentials
    )
    .then((res) => {
      const data = res.data;
      if (!data.result) {
        return { result: "error", message: "Unknown errors occurred." };
      }
      return data;
    }, handleError);
};
