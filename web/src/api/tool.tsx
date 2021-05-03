import { UserType } from "./authentication";

// Specifies the functionalities

export const PublicTools = {
  HOME: "home",
  VIEW_FLIGHTS: "view-flights",
  SEARCH_FLIGHTS: "search-flights",
  LOGOUT: "logout",
} as const;
export type IPublicTools = typeof PublicTools[keyof typeof PublicTools];

export const CustomerTools = {
  ...PublicTools,
  PURCHASE: "purchase",
  COMMENT: "comment",
  VIEW_SPENDINGS: "view-spendings",
} as const;
export type ICustomerTools = typeof CustomerTools[keyof typeof CustomerTools];

export const AgentTools = {
  ...PublicTools,
  PURCHASE: "purchase",
  VIEW_COMMISSION: "view-commission",
  TOP_CUST: "top-customer",
} as const;
export type IAgentTools = typeof AgentTools[keyof typeof AgentTools];

export const StaffTools = {
  ...PublicTools,
  CREATE_FLIGHTS: "create-flights",
  EDIT_FLIGHTS: "edit-flights",
  ADD_AIRPLANE: "add-airplane",
  ADD_AIRPORT: "add-airport",
  VIEW_RATINGS: "view-ratings",
  VIEW_AGENTS: "view-agents",
  VIEW_CUST: "view-customers",
  VIEW_REPORT: "view-report",
  VIEW_REVENUE: "view-revenue",
  VIEW_TOP_DEST: "view-top-destination",
} as const;
export type IStaffTools = typeof StaffTools[keyof typeof StaffTools];
export const Tools = {
  ...PublicTools,
  ...CustomerTools,
  ...AgentTools,
  ...StaffTools,
};
export type ITools = typeof Tools[keyof typeof Tools];
export function getTools(userType: UserType) {
  if (userType === UserType.CUST) {
    return CustomerTools;
  } else if (userType === UserType.AGENT) {
    return AgentTools;
  } else if (userType === UserType.STAFF) {
    return StaffTools;
  } else {
    return PublicTools;
  }
}
export function inUserTools(tool: ITools, userType: UserType): boolean {
  return (Object as any).values(getTools(userType)).includes(tool);
}
export type UserTools<T extends UserType> = T extends UserType.CUST
  ? ICustomerTools
  : T extends UserType.AGENT
  ? IAgentTools
  : T extends UserType.STAFF
  ? IStaffTools
  : IPublicTools;
