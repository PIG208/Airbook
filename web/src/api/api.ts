import { UserProp, UserType } from "./authentication";

export type ResponseProp<T = any> = {
  result: string;
  message?: string;
  data?: T;
  userData?: UserProp;
};

const host = "http://localhost:5000";
export const getFetchSessionURL = () => `${host}/session-fetch`;
export const getLoginURL = (method: UserType) => `${host}/login/${method}`;
export const getLogoutURL = () => `${host}/logout`;
export const getRegisterURL = (method: UserType) =>
  `${host}/register/${method}`;
export const getPublicSearchURL = (filter: string) =>
  `${host}/search-public/${filter}`;
export const getSearchURL = (filter: string) => `${host}/search/${filter}`;
export const getTicketPriceURL = () => `${host}/ticket_price`;
export const getTicketPurchaseURL = () => `${host}/ticket_purchase`;
export const getAddFeedbackURL = () => `${host}/add_feedback`;
export const getCreateFlightURL = () => `${host}/create_flight`;
export const getChangeFlightStatusURL = () => `${host}/change_status`;
export const getAddAirportURL = () => `${host}/add_airport`;
