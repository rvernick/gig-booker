import { createContext, useState, ReactNode, useContext, useEffect } from 'react';
import AppContext from "./app-context";
import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useSession } from '@/common/ctx';
import { isMobile, isProduction } from './utils';
import { initializeLogRocketWeb } from './logrocket';

const initialQueryClient = new QueryClient();
export const GlobalStateContext = createContext({ appContext: new AppContext(initialQueryClient, null) });

interface GlobalStateProviderProps {
  children: ReactNode;
}

export function useGlobalContext(): AppContext {
  const { appContext } = useContext(GlobalStateContext);
  return appContext;
}

export function GlobalStateProvider({ children }: GlobalStateProviderProps) {
  const session = useSession();
  const queryClient = useQueryClient()
  const [appContext, setAppContext] = useState(new AppContext(queryClient, session));
  const [logRocketInitialized, setLogRocketInitialized] = useState(false);

  const initializeLogRocket = () => {
    if (isProduction()) {
      console.log('Initializing LogRocket in GlobalContext...');
      if (isMobile()) {
        // cannot use LogRocket on mobile at this time
      } else {
        initializeLogRocketWeb();
      }
    }
    setLogRocketInitialized(true);
  };

  useEffect(() => {
    if (!logRocketInitialized) {
      try {
        initializeLogRocket();
        setLogRocketInitialized(true);
      } catch (error) {
        console.log('Error initializing LogRocket: ', error);
      }
    }
  }, [logRocketInitialized]);

  return (
    <GlobalStateContext.Provider value={{ appContext }}>
      {children}
    </GlobalStateContext.Provider>
  );
}