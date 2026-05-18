import { useContext, createContext, type PropsWithChildren, useEffect, useState } from 'react';
import { useStorageState } from './useStorageState';
import { confirmLogin } from './utils';

export const defaultAuthState = {
  signIn: (jwtToken: string, username: string) => null,
  signOut: () => null,
  jwt_token: null,
  username: null,
  isLoading: false,
};

const AuthContext = createContext<{
  signIn: (jwtToken: string, username: string) => void;
  signOut: () => void;
  jwt_token?: string | null;
  username?: string | null;
  isLoading: boolean;
}>(defaultAuthState);

const LoginConfirmation = createContext('not-logged-in');

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

function LoginConfirmationWrapper({ children }: PropsWithChildren) {
  const session = useSession();
  const [lastChecked, setLastChecked] = useState(new Date().getTime());
  const [failedAttempts, setFailedAttempts] = useState(0);


  const ensureServerRecognizesSession = async () => {
    const now = new Date().getTime();
    const timeSinceLastCheck = now - lastChecked;
    if (timeSinceLastCheck < 2*60*1000) {
      return;
    }
    setLastChecked(now);

    if (session
      && session.jwt_token
      && session.jwt_token.length > 0) {
      const status = await confirmLogin(session);
      if (status === 'logged-in') {
        setFailedAttempts(0);
        return;
      }
    }
    if (failedAttempts < 3) {
      setFailedAttempts(failedAttempts + 1);
      setTimeout(ensureServerRecognizesSession, 1000);
    } else {
      console.log('Signing out.... ' + session.jwt_token);
      session.signOut();
    }
  }

  useEffect(() => {
    ensureServerRecognizesSession();
  });


  return (
    <LoginConfirmation.Provider value={'aString'}>
      { children }
    </LoginConfirmation.Provider>
  );
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, jwt_token], setSession] = useStorageState('jwt_token');
  const [[emailLoading, username], setEmail] = useStorageState('username');

  return (
    <AuthContext.Provider
      value={{
        signIn: (jwtToken: string, username: string) => {
          // Perform sign-in logic here
          setSession(jwtToken);
          setEmail(username);
        },
        signOut: () => {
          setSession(null);
          setEmail(null);
        },
        jwt_token,
        username,
        isLoading,
      }}>
      <LoginConfirmationWrapper>
        {children}
      </LoginConfirmationWrapper>
    </AuthContext.Provider>
  );
}
