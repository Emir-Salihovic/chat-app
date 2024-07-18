import { Document, Schema, Model, model } from 'mongoose';

// Define an interface representing a document in MongoDB.
export interface IUser extends Document {
  username: string;
  password: string;
}

// Create a Schema corresponding to the document interface.
const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Please provide a username.'],
      unique: true
    },
    password: { type: String, required: [true, 'Please provide a password.'] }
  },
  {
    versionKey: false
  }
);

// Create a Model.
const User: Model<IUser> = model<IUser>('User', UserSchema);

export default User;
