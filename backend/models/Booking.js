import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userEmail: String,          // Optionally set from logged-in user
  name: String,               // User name
  vehicle: String,
  location: String,
  userLat: Number,
  userLng: Number,
  shopLat: Number,
  shopLng: Number,
  mechanicName: String,
  mechanicImage: String,
  problemDescription: String,
  date: String,
  time: String,
  price: String,
  paymentStatus: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.model("Booking", bookingSchema);
