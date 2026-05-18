
import AppController from "@/common/AppController";
import { devLog, strippedPhone } from "../../common/utils";
import { post, postForm } from "../../common/http-utils";
import { CoSLocation } from "@/models/CoSLocation";

class ProfileController extends AppController {

  public updateAccount(
      session: any,
      username: string,
      firstName: string,
      lastName: string,
      mobile: string,
      homeLocation: CoSLocation | null,
      entering: string | null) {
    return this.callUpdateAccount(
      session,
      username,
      firstName,
      lastName,
      strippedPhone(mobile),
      homeLocation,
      entering,
    );
  }

  async callUpdateAccount(
    session: any,
    username: string,
    firstName: string,
    lastName: string,
    mobile: string,
    homeLocation: CoSLocation | null,
    entering: string | null,) {

    try {
      const body = {
        username: username,
        firstName: firstName,
        lastName: lastName,
        mobile: mobile,
        homeLocation: homeLocation,
        entering_instructions: entering,
      };

      devLog('body'+ JSON.stringify(body));
      const response = await post('/auth/update-user', body, session.jwt_token);
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

  async deleteAccount(session: any, username: string) {
    try {
      const body = {
        username: username,
      };

      const response = await post('/auth/delete-user', body, session.jwt_token);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      devLog('json'+ result);
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to Delete Account';
    }
  }

  updateUserPhoto = async (session: any, username: string, file: File): Promise<string>  => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', username);

      const response = await postForm('/user/upload-user-photo', formData, session.jwt_token);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to update photo';
    }
  };

  updateSocials = async (session: any, username: string, strava: string, linkedIn: string, instagram: string): Promise<string> => {
    try {
      const body = {
        username: username,
        strava_link: strava,
        linkedIn_link: linkedIn,
        instagram_link: instagram,
      };
      const response = await post('/user/update-socials', body, session.jwt_token);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to Update Account';
    }
  }

};

export default ProfileController;