// eslint-disable-next-line import/no-unresolved
import AppController from "@/common/AppController";
import { post } from "../../common/http-utils";
import { CoSLocation } from "@/models/CoSLocation";
import { devLog } from "@/common/utils";

class OnboardingController extends AppController {

  public async acceptTerms(
      session: any,
      username: string,
  ) {
    try {
      const body = {
        username: username,
      };

      devLog('body'+ JSON.stringify(body));
      const response = await post('/user/accept-terms', body, session.jwt_token);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      devLog('json ' + result);
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to Update Account';
    }
  }

  public async updateHomeAddress(
      session: any,
      username: string,
      address: CoSLocation,
      enteringInstructions: string | null,
  ) {
    try {
      const body = {
        username: username,
        address: address,
        entering_instructions: enteringInstructions,
      };

      devLog('body'+ JSON.stringify(body));
      const response = await post('/user/update-home-address', body, session.jwt_token);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      devLog('json ' + result);
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to Update Account';
    }
  }

  public updateEmail(
      session: any,
      username: string,
      email: string,
  ) {
    return this.callUpdateEmail(
      session,
      username,
      email
    );
  }

  async callUpdateEmail(
    session: any,
    username: string,
    email: string,
  ) {

    try {
      const body = {
        username: username,
        email: email,
      };

      devLog('body'+ JSON.stringify(body));
      const response = await post('/user/update-email', body, session.jwt_token);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      devLog('json ' + result);
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to Update Account';
    }
  }

  // TODO: need to implement these on the server
  public async setType(
      session: any,
      username: string,
      path: string,
  ) {
    try {
      const body = {
        username: username,
      };

      devLog('body'+ JSON.stringify(body));
      const response = await post(path, body, session.jwt_token);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      devLog('json ' + result);
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to Update Account';
    }
  }

};

export default OnboardingController;