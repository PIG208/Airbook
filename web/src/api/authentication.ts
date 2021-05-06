import axios from "axios";
import {
  getLoginURL,
  getLogoutURL,
  getRegisterURL,
  getFetchSessionURL,
  ResponseProp,
} from "./api";
import { handleError } from "./utils";

export enum UserType {
  CUST = "cust",
  AGENT = "agent",
  STAFF = "staff",
  PUBLIC = "public",
}

export function userTypeToDisplayName(userType: UserType) {
  switch (userType) {
    case UserType.CUST:
      return "Customer";
    case UserType.AGENT:
      return "Booking Agent";
    case UserType.STAFF:
      return "Airline Staff";
    case UserType.PUBLIC:
      return "Visitor";
  }
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
  passwordConfirm?: string;
  email?: string;
  dateOfBirth?: Date;
  // Customer-only fields
  name?: string;
  phoneNumber?: string;
  passportNumber?: string;
  passportExpiration?: Date;
  passportCountry?: string;
  buildingNumber?: number;
  street?: string;
  city?: string;
  state?: string;
  // Staff-only fields
  userName?: string;
  firstName?: string;
  lastName?: string;
  airlineName?: string;
};

export type UserProp = Omit<
  RegisterProp,
  "registerType" | "passwordConfirm" | "password"
> & { agentId?: number; userType: UserType };

export const PublicUser = { userType: UserType.PUBLIC } as UserProp;

export const useCredentials = {
  withCredentials: true,
};

export function parseUserData(
  userType: UserType,
  data: { user_data: any }
): UserProp {
  return {
    userType: userType,
    email: data.user_data.email,
    name: data.user_data.name,
    phoneNumber: data.user_data.phone_number,
    dateOfBirth: new Date(data.user_data.date_of_birth),
    passportNumber: data.user_data.passport_number,
    passportExpiration: new Date(data.user_data.passport_expiration),
    passportCountry: data.user_data.passport_country,
    buildingNumber: data.user_data.building_number,
    street: data.user_data.street,
    city: data.user_data.city,
    state: data.user_data.state,
    agentId: data.user_data.agent_id,
    userName: data.user_data.username,
    firstName: data.user_data.first_name,
    lastName: data.user_data.last_name,
    airlineName: data.user_data.airline_name,
  } as UserProp;
}

export async function login(props: LoginProp): Promise<ResponseProp> {
  let data = null;
  await axios
    .post(
      getLoginURL(props.loginType),
      {
        email: props.email,
        username: props.userName,
        booking_agent_id: Number(props.agentId),
        password: props.password,
      },
      useCredentials
    )
    .then((res) => {
      data = res.data;
      if (data.result === "error") {
        return;
      }
      try {
        data.userData = parseUserData(props.loginType, data);
      } catch {
        data = { result: "error", message: "Recieved malformed user data." };
        return;
      }
      data.user_data = undefined;
    }, handleError);
  return data ?? { result: "error", message: "Invalid login method!" };
}

export async function register(props: RegisterProp): Promise<ResponseProp> {
  let data = null;
  let dateOfBirth = null;
  let passportExpiration = null;
  if (props.registerType !== UserType.AGENT) {
    try {
      dateOfBirth = props.dateOfBirth?.toJSON().slice(0, 10);
    } catch {
      return { result: "error", message: "Invalid date of birth!" };
    }
  }
  if (props.registerType === UserType.CUST) {
    try {
      passportExpiration = props.passportExpiration?.toJSON().slice(0, 10);
    } catch {
      return { result: "error", message: "Invalid passport expiration date!" };
    }
  }
  await axios
    .post(
      getRegisterURL(props.registerType),
      {
        password: props.password,
        email: props.email,
        date_of_birth: dateOfBirth,
        // Fields for customer
        name: props.name,
        phone_number: props.phoneNumber,
        passport_number: props.passportNumber,
        passport_expiration: passportExpiration,
        passport_country: props.passportCountry,
        street: props.street,
        city: props.city,
        state: props.state,
        // Fields for staff
        username: props.userName,
        first_name: props.firstName,
        last_name: props.lastName,
        airline_name: props.airlineName,
      },
      useCredentials
    )
    .then((res) => {
      data = res.data;
      if (data.result === "error") {
        return data;
      }
      data.userData = {
        userType: props.registerType,
        agentId: data.user_data?.agent_id,
        ...props,
      } as UserProp;
      data.user_data = undefined;
    }, handleError);
  return data ?? { result: "error", message: "Invalid registration method" };
}

export async function logout(): Promise<ResponseProp> {
  return axios.post(getLogoutURL(), {}, useCredentials).then((res) => {
    const data = res.data;
    if (data.result === "error") {
      return data;
    } else {
      return { result: "success" };
    }
  }, handleError);
}

export async function fetchSession(): Promise<ResponseProp> {
  // If there is a session cookie presented in this session, we will login directly.
  return axios.post(getFetchSessionURL(), {}, useCredentials).then((res) => {
    const data = res.data;
    if (data.result === "error") {
      return data;
    }
    if (data !== undefined) {
      try {
        let userType = UserType.PUBLIC;
        switch (data.user_data.user_type) {
          case "cust":
            userType = UserType.CUST;
            break;
          case "agent":
            userType = UserType.AGENT;
            break;
          case "staff":
            userType = UserType.STAFF;
            break;
        }
        const userData = parseUserData(userType, data);
        return { result: "success", userData: userData };
      } catch {
        return {
          result: "error",
          message: "Failed to parse the user data!",
        };
      }
    }
    return { result: "error", message: "Recieved empty user data." };
  }, handleError);
}
