import { Router } from "express";
import { Booking } from "../models/Booking.js";

const router = Router();

// Create new booking (POST /api/bookings)
router.post("/", async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "Booking added!", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a booking by its MongoDB _id
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking cancelled successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all bookings for current user (GET /api/bookings?userEmail=...)
router.get("/", async (req, res) => {
  try {
    const { userEmail } = req.query;
    let bookings;
    if (userEmail) {
      bookings = await Booking.find({ userEmail });
    } else {
      bookings = await Booking.find();
    }
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
