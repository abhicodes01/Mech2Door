import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hash in production!
  image: { type: String, default: "" }, // base64 or image URL
  vehicle: { type: String, default: "" },
  phone: { type: String, default: "" },
  dob: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model("User", userSchema);
