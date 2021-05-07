import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { getBookingAgents, TopAgentsResults } from "../../api/staff";
import { handleError } from "../../api/utils";
import AlertMessage from "../AlertMessage";

const keys = ["Booking Agent ID", "Email", "Total Commission", "Total Tickets"];

export default function TopAgents() {
  const [error, setError] = useState("");
  const [agentsData, setAgentsData] = useState<TopAgentsResults>();

  useEffect(() => {
    getBookingAgents().then((res) => {
      if (res.result === "error") {
        setError(res.message ?? "Some unknown errors occurred!");
      } else {
        setAgentsData(res.data);
      }
    }, handleError);
  }, []);
  return (
    <div>
      <AlertMessage message={error} />
      {agentsData !== undefined && (
        <div>
          <h5>Top Agents Last Month By Total Commission</h5>
          <Table>
            <thead>
              <tr>
                {keys.map((value, index) => {
                  return <th key={index}>{value}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {agentsData.lastMonthByCommission.map((value, index) => {
                return (
                  <tr key={index}>
                    <td>{value.agentID}</td>
                    <td>{value.email}</td>
                    <td>${value.totalCommssion}</td>
                    <td>{value.totalTickets}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <h5>Top Agents Last Year By Total Commission</h5>
          <Table>
            <thead>
              <tr>
                {keys.map((value, index) => {
                  return <th key={index}>{value}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {agentsData.lastYearByCommission.map((value, index) => {
                return (
                  <tr key={index}>
                    <td>{value.agentID}</td>
                    <td>{value.email}</td>
                    <td>${value.totalCommssion}</td>
                    <td>{value.totalTickets}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <h5>Top Agents Last Month By Total Tickets Sold</h5>
          <Table>
            <thead>
              <tr>
                {keys.map((value, index) => {
                  return <th key={index}>{value}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {agentsData.lastMonthByTickets.map((value, index) => {
                return (
                  <tr key={index}>
                    <td>{value.agentID}</td>
                    <td>{value.email}</td>
                    <td>${value.totalCommssion}</td>
                    <td>{value.totalTickets}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <h5>Top Agents Last Year By Total Tickets Sold</h5>
          <Table>
            <thead>
              <tr>
                {keys.map((value, index) => {
                  return <th key={index}>{value}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {agentsData.lastYearByTickets.map((value, index) => {
                return (
                  <tr key={index}>
                    <td>{value.agentID}</td>
                    <td>{value.email}</td>
                    <td>${value.totalCommssion}</td>
                    <td>{value.totalTickets}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
