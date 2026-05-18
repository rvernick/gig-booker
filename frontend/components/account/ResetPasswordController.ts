import AppContext from "@/common/app-context";
import AppController from "@/common/AppController";
import { post } from "@/common/http-utils";

class ResetPasswordController extends AppController {
  constructor(context: AppContext) {
    super(context);
  }

  async resetPassword(username: string) {
    const args = {username: username,};
    const response = post('/auth/request-password-reset', args, null);
    response
      .then(resp => {
        if (resp.ok) {
          console.log('Reset password for: ' + username);
        } else {
          console.log('Failed to reset ' + username);
        }
      })
      .catch(error => {console.log('Failed to reset ' + error.message)});
  };
}

export default ResetPasswordController;