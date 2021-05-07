export enum FlightStatus {
  ONTIME = "ontime",
  DELAYED = "delayed",
}

export interface FlightProp {
  flightNumber: number;
  airlineName: string;
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  basePrice: number;
  status: FlightStatus;
  seatCapacity: number;
  depCity: string;
  arrCity: string;
  arrAirport: string;
  depAirport: string;
  planeID: number;
}

export interface FlightFormProp {
  flightNumber: number;
  depDatetime: Date;
  arrDatetime: Date;
  basePrice: number;
  status: FlightStatus;
  arrAirport: string;
  depAirport: string;
  planeID: number;
}

export enum CardType {
  CREDIT = "credit",
  DEBT = "debt",
}

export interface PurchaseProp {
  email?: string; //Booking agent only
  cardType: CardType;
  cardNumber: string;
  nameOnCard: string;
  expDate: Date;
  airlineName?: string;
  flightNumber?: number;
  depDate?: string;
  depTime?: string;
}

export interface TicketProp {
  ticketID: number;
  email: string;
  soldPrice: number;
  cardType: CardType;
  cardNumber: string;
  nameOnCard: string;
  expDate: Date;
  purchaseDate: string;
  purchaseTime: string;
  airlineName: string;
  flightNumber: number;
  depDate: string;
  depTime: string;
  BookingAgentId?: number;
}

export interface SpendingsProp {
  email?: string;
  ticketID?: number;
  soldPrice?: number;
  actualPrice: string;
  commission?: number;
  purchaseDate: string;
  purchaseTime?: string;
}

export interface SpendingsGroupProp {
  groupDate: string;
  spendingsSum: number;
}

export interface FlightPrimaryProp {
  flightNumber: number;
  depDate: string;
  depTime: string;
}

export interface FeedbackProp {
  flightNumber: number;
  depDate: string;
  depTime: string;
  email: string;
  createdAt: string;
  rate: number;
  comment: string;
}

export interface AirportProp {
  airportName: string; //<20
  city: string; //<30
}

export interface AirplaneProp {
  planeID: number;
  airlineMame: string;
  seatCapacity: number;
}
