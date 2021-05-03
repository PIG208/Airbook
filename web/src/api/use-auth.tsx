/*
    Set of utility hooks for handling authentication.
    Reference: https://usehooks.com/useAuth/
*/
import { useContext, useState, createContext } from "react";
import { WithChildren } from "./utils";
import { PublicUser, RegisterProp, UserProp } from "./authentication";
import { ResponseProp } from "./api";
import {
  login as doLogin,
  logout as doLogout,
  register as doRegister,
  fetchSession as doFetchSession,
  LoginProp,
} from "./authentication";

export interface AuthContext {
  userProp: UserProp;
  login: (props: LoginProp) => Promise<ResponseProp>;
  logout: (cb?: (data: ResponseProp) => void) => Promise<ResponseProp>;
  register: (props: RegisterProp) => Promise<ResponseProp>;
  fetchSession: () => Promise<ResponseProp>;
}

const authContext = createContext({ userProp: PublicUser } as AuthContext);

export function ProvideAuth({ children }: WithChildren<{}>) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export function ForwardProvideAuth({
  children,
  forwardAuth,
}: WithChildren<{ forwardAuth: AuthContext }>) {
  return (
    <authContext.Provider value={forwardAuth}>{children}</authContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(authContext);
};

export const useProvideAuth = () => {
  const [userProp, setUserProp] = useState<UserProp>(PublicUser);

  const login = (props: LoginProp) => {
    return doLogin(props).then((response) => {
      if (response.result !== "error" && response.userData) {
        setUserProp(response.userData);
      }
      return response;
    });
  };

  const register = (props: RegisterProp) => {
    return doRegister(props).then((response) => {
      if (response.result !== "error" && response.userData) {
        setUserProp(response.userData);
      }
      return response;
    });
  };

  const fetchSession = () => {
    return doFetchSession().then((response) => {
      if (response.result !== "error" && response.userData) {
        setUserProp(response.userData);
      }
      return response;
    });
  };

  const logout = (cb?: (data: ResponseProp) => void) => {
    return doLogout().then((data) => {
      if (userProp !== PublicUser) {
        setUserProp(PublicUser);
      }
      if (cb) cb(data);
      return data;
    });
  };

  return { userProp, login, register, fetchSession, logout } as AuthContext;
};
