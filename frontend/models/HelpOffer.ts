import { HelpRequest } from "./HelpRequest";
import { TimeOfDay } from "./time-of-day.enum";
import { User } from "./User";

export enum HelpOfferState {
  SCHEDULED = "Scheduled",
  REJECTED = "Rejected",
  STARTED = "Started",
  DONE = "Done",
}

export interface HelpOffer {
  id: number;
  userId: number;
  user: User;
  helpRequest: HelpRequest;
  startDate: Date;
  timeOfDay: TimeOfDay;
  state: HelpOfferState;
  createdOn: Date;
  updatedOn: Date;
}
