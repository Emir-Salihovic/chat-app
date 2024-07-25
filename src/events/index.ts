export enum COMMON_EVENTS {
  CONNECT = 'connection',
  DISCONNECT = 'disconnect'
}

export enum ROOM_EVENTS {
  CREATE_ROOM = 'createRoom',
  ROOM_ADDED = 'roomAdded',
  ROOM_CHANGED = 'roomChanged',
  LEFT_ROOM = 'leftRoom',

  DELETE_ROOM = 'deleteRoom',
  ROOM_DELETED = 'roomDeleted',

  JOIN_ROOM = 'joinRoom',

  USER_CHANGED_ROOM = 'userChangedRoom',
  USER_LEFT_ROOM = 'userLeftRoom',
  USER_LOGOUT = 'userLogout',
  USER_LOGED_OUT = 'userLogedOut',

  USER_STARTED_TYPING = 'userStartedTyping',
  USER_IS_TYPING = 'userIsTyping',
  USER_STOPPED_TYPING = 'userStoppedTyping',
  USER_IS_NOT_TYPING = 'userIsNotTyping',

  JOINED_MESSAGE = 'message',

  MESSAGE_SENT = 'messageSent',
  MESSAGE_RECEIVED = 'messageReceived'
}

export enum ERROR_EVENTS {
  ERROR = 'error'
}

export type CommonRoomCredentials = {
  userId: string;
  roomId: string;
  message?: string;
};
