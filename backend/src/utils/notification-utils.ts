import { ExpoPushMessage } from 'expo-server-sdk';
import { User } from '../auth/user.entity';

export interface PushNotification {
  user: User;
  title: string;
  subtitle: string;
  body: string;
}

export const sendPushNotification = async (user: User, title: string, subtitle: string, body: string) => {
  const notification: PushNotification = {
    user,
    title,
    subtitle,
    body,
  };

  return sendPushNotifications([notification]);
};

export const sendPushNotifications = async (notifications: PushNotification[]) => {
  const { Expo } = await import('expo-server-sdk');

  const expo = new Expo({
    accessToken: process.env.EXPO_ACCESS_TOKEN,
  });

  const messages: ExpoPushMessage[] = [];
  for (const notification of notifications) {
    console.log('Sending push notification: ', notification);
    const pushToken = notification.user.pushToken;
    if (Expo.isExpoPushToken(pushToken)) {
      messages.push({
        to: pushToken,
        sound: 'default',
        title: notification.title,
        subtitle: notification.subtitle,
        body: notification.body,
      });
    } else {
      console.log(`Push token ${pushToken} is invalid.`);
    }
  }

  // The Expo push notification service accepts batches of notifications so
  // that you don't need to send 1000 requests to send 1000 notifications. We
  // recommend you batch your notifications to reduce the number of requests
  // and to compress them (notifications with similar content will get
  // compressed).
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // NOTE: If a ticket contains an error code in ticket.details.error, you
      // must handle it appropriately. The error codes are listed in the Expo
      // documentation:
      // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error) {
      console.error(error);
    }
  }
};
