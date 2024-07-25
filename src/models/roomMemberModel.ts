import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomMember extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  roomId: mongoose.Schema.Types.ObjectId;
  online: boolean;
}

const RoomMemberSchema: Schema = new Schema(
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
    online: {
      type: Boolean,
      default: true
    }
  },
  {
    versionKey: false
  }
);

const RoomMember = mongoose.model<IRoomMember>('RoomMember', RoomMemberSchema);

export default RoomMember;
