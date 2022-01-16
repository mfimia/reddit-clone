import session from "express-session";

// Declaration merging. Add property to SessionData interface object
declare module "express-session" {
  export interface SessionData {
    userId: number;
  }
}

export default session;
