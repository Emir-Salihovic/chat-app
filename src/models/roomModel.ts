import mongoose, { Schema, Document } from 'mongoose';

export interface Room extends Document {
  name: string;
}

const roomSchema: Schema = new Schema(
  {
    name: { type: String, required: [true, 'Please provide room name.'] },
    creator: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
  },
  {
    versionKey: false
  }
);

const RoomModel = mongoose.model<Room>('Room', roomSchema);

export default RoomModel;
