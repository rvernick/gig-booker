import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./notification";
import { useSession } from "./ctx";
import { fetchUser, isMobile, setUserPushToken } from "./utils";
import { router } from "expo-router";
import { blankUser, User } from "@/models/User";
import { useQuery } from "@tanstack/react-query";
import { oneHourInMilliseconds } from "./constants";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
  updateInitialized: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [username, setUsername] = useState('');

  const session = useSession();

  const { data: user } = useQuery({
    queryKey: ['user', username],
    queryFn: () => retrieveUser(),
    initialData: blankUser,
    refetchInterval: oneHourInMilliseconds
  });

  const retrieveUser = (): Promise<User | null> => {
    if (!username || username === '') {
      return Promise.resolve(blankUser());
    }
    return fetchUser(session, username);
  }

  const registerPushToken = async (pushToken: string) => {
    setExpoPushToken(pushToken);
    setUserPushToken(session, pushToken);
  };

  const initializeNotifications = () => {
    if (!session.jwt_token) return;
    if (!isMobile()) {
      setInitialized(true);
      return;
    }
    if (expoPushToken && expoPushToken !== user?.pushToken) {
      setUserPushToken(session, expoPushToken);
    }
    if (initialized) return;
    if (session.username && session.username !== username) {
      setUsername(session.username);
    }

    registerForPushNotificationsAsync().then(
      (token) => registerPushToken(token),
      (error) => setError(error)
    );

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(
        "🔔 Notification Response: ",
        JSON.stringify(response, null, 2),
        JSON.stringify(response.notification.request.content.data, null, 2)
      );
      if (response.notification.request.content.data) {
        router.push('/(secure)/(home)/(settings)/profile');
      }
      // Handle the notification response here
    });

    setInitialized(true);
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }

  const updateInitialized = () => {
    console.log("NotificationProvider updateInitialized");
    setInitialized(!initialized);
  }

  useEffect(() => {
    console.log("NotificationProvider useEffect");
    initializeNotifications();
  }, []);

  useEffect(() => {
    console.log("NotificationProvider useEffect - session updated");
    initializeNotifications();
  }, [session, user]);


  return (
    <NotificationContext.Provider
      value={{ expoPushToken, notification, error, updateInitialized }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
