export enum FlightStatus {
  ONTIME,
  DELAYED,
}

export interface FlightProp {
  flightNumber: number;
  depDate: string;
  depTime: string;
  depAirport: string;
  arrDate: string;
  arrTime: string;
  arrAirport: string;
  basePrice: number;
  status: FlightStatus;
  planeID: number;
  airlineName: string;
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
  airlineName: string;
  flightNumber: number;
  depDate: string;
  depTime: string;
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

export interface FlightPrimaryProp {
  flightNumber: number;
  depDate: string;
  depTime: string;
}
