import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
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

const Room = mongoose.model<IRoom>('Room', roomSchema);

export default Room;
