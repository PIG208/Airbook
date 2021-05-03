import { getTicketPriceURL, getTicketPurchaseURL, ResponseProp } from "./api";
import { FlightPrimaryProp, PurchaseProp } from "./data";
import { convertDate } from "./flight";
import axios from "axios";

export function getFlightPrice(
  props: FlightPrimaryProp
): Promise<ResponseProp> {
  return axios
    .post(getTicketPriceURL(), {
      flight_number: props.flightNumber,
      dep_date: props.depDate,
      dep_time: props.depTime,
    })
    .then(
      (res) => {
        const data = res.data;
        if (data.result === "error") {
          return data;
        } else {
          return { result: "success", data: data.data };
        }
      },
      (err) => {
        console.log(err);
        return { result: "error", message: "Some network errors occurred!" };
      }
    );
}

export function purchase(props: PurchaseProp): Promise<ResponseProp> {
  return axios
    .post(getTicketPurchaseURL(), {
      email: props.email,
      card_type: props.cardType,
      card_number: props.cardNumber,
      name_on_card: props.nameOnCard,
      exp_date: convertDate(props.expDate),
      airline_name: props.airlineName,
      flight_number: props.flightNumber,
      dep_date: props.depDate,
      dep_time: props.depTime,
    })
    .then(
      (res) => {
        const data = res.data;
        if (data.result === "error") {
          return data;
        } else {
          return { result: "success" };
        }
      },
      (err) => {
        console.log(err);
        return { result: "error", message: "Some network errors occurred!" };
      }
    );
}
