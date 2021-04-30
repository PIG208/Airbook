import {UserType} from './authentication';

export type ResponseProp = {
    result: string,
    message?: string,
    data?: any
}

const host = "http://localhost:5000";
export const getLoginURL = (method: UserType) => `${host}/login/${method}`;
export const getRegisterURL = (method: UserType) => `${host}/register/${method}`;
export const getPublicSearchURL = (filter: string) => `${host}/search-public/${filter}`;