import axios from "axios";
import { getSearchURL, ResponseProp } from "./api";
import { useCredentials } from "./authentication";
import { FlightProp } from "./data";
import { searchFlights } from "./flight";
import { handleError, handleThen } from "./utils";

export interface TopAgentsResults {
  lastMonthByTickets: TopAgentsProp[];
  lastMonthByCommission: TopAgentsProp[];
  lastYearByTickets: TopAgentsProp[];
  lastYearByCommission: TopAgentsProp[];
}

export interface TopAgentsProp {
  agentID: number;
  email: string;
  totalCommssion: number;
  totalTickets: number;
}

export interface FrequentCustomerProp {
  email: string;
  totalVisits: number;
  name: string;
}

export interface RevenueProp {
  direct: number;
  indirect: number;
}

const parseFrequentCustomerData = (
  frequentCustomerData: Array<any>
): FrequentCustomerProp[] => {
  return frequentCustomerData.reduce(
    (accumulator: FrequentCustomerProp[], current: Array<any>) => {
      const temp = {
        email: current[0],
        totalVisits: current[1],
        name: current[2],
      } as FrequentCustomerProp;
      accumulator.push(temp);
      return accumulator;
    },
    []
  );
};

const parseTopAgentsData = (topAgentData: Array<any>): TopAgentsResults => {
  let category = 0;
  return topAgentData.reduce(
    (accumulator: TopAgentsResults, current: Array<any>) => {
      if (current[0] === "divide") {
        category++;
        return accumulator;
      }
      const temp = {
        agentID: current[0],
        totalCommssion: current[1],
        totalTickets: current[2],
        email: current[3],
      } as TopAgentsProp;
      switch (category) {
        case 0:
          accumulator.lastYearByCommission.push(temp);
          break;
        case 1:
          accumulator.lastMonthByCommission.push(temp);
          break;
        case 2:
          accumulator.lastYearByTickets.push(temp);
          break;
        case 3:
          accumulator.lastMonthByTickets.push(temp);
          break;
      }
      return accumulator;
    },
    {
      lastMonthByCommission: [],
      lastMonthByTickets: [],
      lastYearByCommission: [],
      lastYearByTickets: [],
    } as TopAgentsResults
  );
};

export async function getBookingAgents(): Promise<
  ResponseProp<TopAgentsResults>
> {
  return axios
    .post(getSearchURL("top_agents"), {}, useCredentials)
    .then(handleThen, handleError)
    .then((data: ResponseProp) => {
      data.data = JSON.parse(data.data);
      data.data = parseTopAgentsData(data.data);
      return data;
    });
}

export async function getFrequentCustomers(): Promise<
  ResponseProp<FrequentCustomerProp[]>
> {
  return axios
    .post(getSearchURL("frequent_cust"), {}, useCredentials)
    .then(handleThen, handleError)
    .then((data: ResponseProp) => {
      data.data = JSON.parse(data.data);
      data.data = parseFrequentCustomerData(data.data);
      return data;
    });
}

export async function getCustomerFlights(
  email: string
): Promise<ResponseProp<FlightProp[]>> {
  return searchFlights({
    emails: [email],
    filterByEmails: true,
    depTimeUpper: new Date(), //We only want the previous flights
  });
}

export async function getRevenue(): Promise<ResponseProp<RevenueProp[]>> {
  return axios
    .post(getSearchURL("revenue_compare"), {}, useCredentials)
    .then(handleThen, handleError)
    .then((data: ResponseProp) => {
      data.data = JSON.parse(data.data);
      data.data = data.data.map((value: any) => {
        return {
          direct: value[0],
          indirect: value[1],
        } as RevenueProp;
      });
      return data;
    });
}
