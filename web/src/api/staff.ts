import axios from "axios";
import { getSearchURL, ResponseProp } from "./api";
import { useCredentials } from "./authentication";
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

export function getBookingAgents(): Promise<ResponseProp<TopAgentsResults>> {
  return axios
    .post(getSearchURL("top_agents"), {}, useCredentials)
    .then(handleThen, handleError)
    .then((data: ResponseProp) => {
      data.data = JSON.parse(data.data);
      data.data = parseTopAgentsData(data.data);
      return data;
    });
}
