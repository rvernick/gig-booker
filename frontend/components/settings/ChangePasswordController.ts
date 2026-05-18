import AppContext from "@/common/app-context";
import AppController from "@/common/AppController";
import { post } from "@/common/http-utils";
import { devLog } from "@/common/utils";

class ChangePasswordController extends AppController {
  constructor(appContext: AppContext) {
    super(appContext);
  }

  public changePassword(session: any, oldPassword: string, newPassword: string) {

    this.verifyPassword(newPassword);
    return this.callChangePassword(session, session.username, oldPassword, newPassword);
  }

  verifyPassword(password: string) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }

  verifyPasswords(password: string, confirmPassword: string) {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }

  async callChangePassword(session: any, username: string, oldPassword: string, newPassword: string) {
    try {
      const body = {
        username: username,
        oldPassword: oldPassword,
        newPassword: newPassword,
      };
      const jwtToken = session.jwt_token;
      const response = await post('/auth/change-password', body, jwtToken);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      devLog('json ' + result);
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to change password';
    }
  }
};

export default ChangePasswordController;
