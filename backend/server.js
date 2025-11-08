import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import shopOwnerRoutes from "./routes/shopOwner.js";
import userRoutes from "./routes/user.js";
import bookingRoutes from "./routes/booking.js"; // fixed name
import chatRouter from "./routes/chat.js";
import paymentsRouter from "./routes/payments.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json());  // you can remove bodyParser.json if using this
// app.use(bodyParser.json()); // optional, but not necessary with express.json()

mongoose.connect("mongodb://localhost:27017/garageapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/api/shop-owners", shopOwnerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chat", chatRouter);
app.use("/api/payments", paymentsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
