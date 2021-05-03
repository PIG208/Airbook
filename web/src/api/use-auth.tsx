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
import useIncrement from "./use-increment";

export interface AuthContext {
  userProp: UserProp;
  authPending: boolean;
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
  const [authPending, setAuthPending] = useState(false);
  const { count, increment, reset } = useIncrement();

  const login = (props: LoginProp) => {
    increment();
    const current = count;
    setAuthPending(true);
    return doLogin(props)
      .then((response) => {
        if (response.result !== "error" && response.userData) {
          setUserProp(response.userData);
        }
        return response;
      })
      .finally(() => {
        if (current === count) {
          setAuthPending(false);
        }
      });
  };

  const register = (props: RegisterProp) => {
    increment();
    const current = count;
    setAuthPending(true);
    return doRegister(props)
      .then((response) => {
        if (response.result !== "error" && response.userData) {
          setUserProp(response.userData);
        }
        return response;
      })
      .finally(() => {
        if (current === count) {
          setAuthPending(false);
        }
      });
  };

  const fetchSession = () => {
    increment();
    const current = count;
    setAuthPending(true);
    return doFetchSession()
      .then((response) => {
        if (response.result !== "error" && response.userData) {
          setUserProp(response.userData);
        }
        return response;
      })
      .finally(() => {
        if (current === count) {
          setAuthPending(false);
        }
      });
  };

  const logout = (cb?: (data: ResponseProp) => void) => {
    reset();
    const current = count;
    setAuthPending(true);
    return doLogout()
      .then((data) => {
        if (userProp !== PublicUser) {
          setUserProp(PublicUser);
        }
        if (cb) cb(data);
        return data;
      })
      .finally(() => {
        if (current === count) {
          setAuthPending(false);
        }
      });
  };

  return {
    userProp,
    login,
    register,
    fetchSession,
    authPending,
    logout,
  } as AuthContext;
};
