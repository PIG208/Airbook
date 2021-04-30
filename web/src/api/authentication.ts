import axios from "axios";
import { getLoginURL, getRegisterURL, ResponseProp } from "./api";

export enum UserType {
  CUST = "cust",
  AGENT = "agent",
  STAFF = "staff",
}

export type LoginProp = {
  loginType: UserType;
  email?: string;
  userName?: string;
  agentId?: string;
  password: string;
};

export type RegisterProp = {
  registerType: UserType;
  password: string;
  email?: string;
  dateOfBirth?: string;
  // Customer-only fields
  name?: string;
  phoneNumber?: string;
  passportNumber?: string;
  passportExpiration?: string;
  passportCountry?: string;
  street?: string;
  city?: string;
  state?: string;
  // Staff-only fields
  userName?: string;
  firstName?: string;
  lastName?: string;
  airlineName?: string;
};

export async function login(prop: LoginProp): Promise<ResponseProp> {
  let data = null;
  await axios
    .post(getLoginURL(prop.loginType), {
      email: prop.email,
      username: prop.userName,
      booking_agent_id: Number(prop.agentId),
      password: prop.password,
    })
    .then((res) => {
      data = res.data;
    });
  return data ?? { result: "error", message: "Invalid login method" };
}

export async function register(prop: RegisterProp): Promise<ResponseProp> {
  let data = null;
  await axios
    .post(getRegisterURL(prop.registerType), {
      password: prop.password,
      email: prop.email,
      date_of_birth: prop.dateOfBirth,
      // Fields for customer
      name: prop.name,
      phone_number: prop.phoneNumber,
      passport_number: prop.passportNumber,
      passport_expiration: prop.passportExpiration,
      passport_country: prop.passportCountry,
      street: prop.street,
      city: prop.city,
      state: prop.state,
      // Fields for staff
      username: prop.userName,
      first_name: prop.firstName,
      last_name: prop.lastName,
      airline_name: prop.airlineName,
    })
    .then((res) => {
      data = res.data;
    });
  return data ?? { result: "error", message: "Invalid registration method" };
}
