const { Expo } = require('expo-server-sdk');

const expo = new Expo();
const guiThongBao = async (tokens, { title, body, data = {} }) => {
  const messages = tokens.filter(Expo.isExpoPushToken).map((to) => ({ to, sound: 'default', title, body, data }));
  const tickets = [];
  for (const chunk of expo.chunkPushNotifications(messages)) tickets.push(...await expo.sendPushNotificationsAsync(chunk));
  return tickets;
};
module.exports = { guiThongBao };
