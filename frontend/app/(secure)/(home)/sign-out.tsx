import { useSession } from '@/common/ctx';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { forget } from '@/common/utils';
import { FACE_ID_USERNAME, FACE_ID_PASSWORD } from '@/common/constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';

export default function SignOut() {
  const session = useSession();
  const queryClient = useQueryClient();

  const signOut = () => {
    forget(FACE_ID_USERNAME);
    forget(FACE_ID_PASSWORD);
    forget('ff.deeplink');
    forget('ff.deeplinkParams');
    session.signOut();
    router.replace('/sign-in');
  }

  useEffect(() => {
    try {
      signOut();
      queryClient.clear();
    } catch (error) {
      console.log('error during logout: ', error);
    }
  });

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Signing out...</Text>
    </SafeAreaView>
  );
}