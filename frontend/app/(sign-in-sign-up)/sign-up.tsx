import { useGlobalContext } from '@/common/GlobalContext';
import CreateAccountController from '@/components/account/CreateAccountController';
import { CreateAccountComponent } from '@/components/account/CreateAccountComponent';

export default function SignUp() {
  const appContext = useGlobalContext();

  return (
    <CreateAccountComponent controller={new CreateAccountController(appContext)}/>
  );
}
