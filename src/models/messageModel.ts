import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomMessage extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  roomId: mongoose.Schema.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const RoomMessageSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true
    },
    message: {
      type: String,
      required: [true, 'Please provide a message.']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

const RoomMessage = mongoose.model<IRoomMessage>(
  'RoomMessage',
  RoomMessageSchema
);

export default RoomMessage;
