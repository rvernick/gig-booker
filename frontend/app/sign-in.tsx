// import { LoginComponent } from '@/components/ui/account/LoginComponent';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native'

export default function SignIn() {

  const goToSignIn = () => {
    router.replace('/(sign-in-sign-up)/(sign-in)/sign-in');
  };

  useEffect(() => {
    goToSignIn();
  }, []);

  return (
    <Text>LoginComponent</Text>
  );
}
