import { getTicketPriceURL, getTicketPurchaseURL, ResponseProp } from "./api";
import { FlightPrimaryProp, PurchaseProp } from "./data";
import { convertDate, parseFlightPrimary } from "./flight";
import axios from "axios";
import { useCredentials } from "./authentication";
import { handleError } from "./utils";

export function getFlightPrice(
  props: FlightPrimaryProp
): Promise<ResponseProp> {
  return axios
    .post(getTicketPriceURL(), parseFlightPrimary(props))
    .then((res) => {
      const data = res.data;
      if (data.result === "error") {
        return data;
      } else {
        return { result: "success", data: data.data };
      }
    }, handleError);
}

export function purchase(props: PurchaseProp): Promise<ResponseProp> {
  return axios
    .post(
      getTicketPurchaseURL(),
      {
        email: props.email,
        card_type: props.cardType,
        card_number: props.cardNumber,
        name_on_card: props.nameOnCard,
        exp_date: convertDate(props.expDate),
        airline_name: props.airlineName,
        flight_number: props.flightNumber,
        dep_date: props.depDate,
        dep_time: props.depTime,
      },
      useCredentials
    )
    .then((res) => {
      const data = res.data;
      if (data.result === "error") {
        return data;
      } else {
        return { result: "success" };
      }
    }, handleError);
}
