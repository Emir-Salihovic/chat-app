import { Document, Schema, Model, model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define an interface representing a document in MongoDB.
export interface IUser extends Document {
  username: string;
  password: string;
  correctPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
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

UserSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Create a Model.
const User: Model<IUser> = model<IUser>('User', UserSchema);

export default User;
