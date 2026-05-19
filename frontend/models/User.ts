import { Photo } from "./Photo";
import { CoSLocation } from "./CoSLocation";

export interface User {
  scheduledServices: number;
  unscheduledRequests: number;
  id: number;
  username: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string;
  pushToken: string;
  source: string;
  homeLocation: CoSLocation | null;
  photo: Photo | null;
  entryInstructions: string | null;
  agreedToTermsAndConditions: boolean;
  distance?: any;
  household: Household | null;
};

export interface Household {
  id: number;
  enteringInstructions: string | null;
}

export const blankUser = (): User => {
  return {
    id: 0,
    username: '',
    emailVerified: false,
    firstName: '',
    lastName: '',
    email: null,
    mobile: '',
    pushToken: '',
    source: 'gig_booker',
    homeLocation: null,
    photo: null,
    entryInstructions: '',
    agreedToTermsAndConditions: false,
    distance: null,
    household: null,
    unscheduledRequests: 0,
    scheduledServices: 0,
  };
};
