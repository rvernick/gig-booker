import { TimeOfDay } from "./time-of-day.enum";
import { User } from "./User";

export enum HelpRequestState {
  CREATED = "Created",
  CLAIMED = "Claimed",
  MISSED = "Missed",
  DONE = "Done",
}
export enum HelpRequestType {
  PACKAGE = "Package",
}

export interface HelpRequest {
  id: number;
  userId: number;
  user: User;
  startDate: Date;
  timeOfDay: TimeOfDay;
  type: HelpRequestType;
  state: HelpRequestState;
  createdOn: Date;
  updatedOn: Date;
}
