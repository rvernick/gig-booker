import AppContext from "@/common/app-context";
import AppController from "@/common/AppController";
import { post } from "@/common/http-utils";

class WaitForVerificationController extends AppController {
  constructor(context: AppContext) {
    super(context);
  }

  async submitCode(code: string, session: any): Promise<boolean> {
    const args = {code: code,};
    const response = post('/auth/verify-email-code', args, session.jwt_token);
    return response
      .then(resp => {
        if (resp.ok) {
          console.log('Code Verified: ' + code);
          return true;
        } else {
          console.log('Failed to verify ' + code);
          return false;
        }
      })
      .catch(error => {
        console.log('Failed to reset ' + error.message);
        return false;
      });
  };
}

export default WaitForVerificationController;
