import AppController from "../../common/AppController";
import { isValidPassword, invalidPasswordMessage, isValidEmail, devLog } from "../../common/utils";
import { post } from '../../common/http-utils';

class CreateAccountController extends AppController {

  public createAccount(username: string, password: string) {
    this.verifyEmail(username);
    this.verifyPassword(password);
    return this.callCreateAccount(username, password);
  }

  verifyEmail(email: string) {
    if (!isValidEmail(email)) {
      return 'Please enter valid email';
    }
    return '';
  }

  verifyPassword(password: string) {
    if (!isValidPassword(password)) {
      return invalidPasswordMessage;
    }
    return '';
  }

  verifyPasswords(password: string, confirmPassword: string) {
    if (password!== confirmPassword || !isValidPassword(password)) {
      return invalidPasswordMessage;
    }
    return '';
  }

  headingText() {
    return 'Create Account';
  }

  buttonText() {
    return 'Create Account';
  }

  apply(username: string, password: string): Promise<string> {
    return this.callCreateAccount(username, password);
  }

  async callCreateAccount(username: string, password: string): Promise<string> {
    try {
      const body = {
        username: username,
        password: password,
      };

      const response = await post('/auth/create', body, null);
      if (response.ok) {
        return '';
      }
      const result = await response.json();
      devLog('json ' + result);
      return result.message;
    } catch(e: any) {
      console.log(e.message);
      return 'Unable to Create Account';
    }
  }
};

export default CreateAccountController;