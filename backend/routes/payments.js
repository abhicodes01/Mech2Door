import dotenv from "dotenv";
dotenv.config();


import express from "express";
import Stripe from "stripe";
import { Booking } from "../models/Booking.js";

const router = express.Router();
console.log("Stripe secret present?", !!process.env.STRIPE_SECRET_KEY);
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) {
  throw new Error("STRIPE_SECRET_KEY is not set. Check backend/.env and dotenv.config()");
}
const stripe = new Stripe(secret);

// Create checkout session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const {
      userEmail,
      name,
      vehicle,
      location,
      lat,
      lng,
      mechanicName,
      mechanicImage,
      problemDescription,
      date,
      time,
      priceInINR,
    } = req.body;

    // Create pending booking in DB so you have an id to attach in metadata
    const pending = await Booking.create({
      userEmail,
      name,
      vehicle,
      location,
      lat,
      lng,
      mechanicName,
      mechanicImage,
      problemDescription,
      date,
      time,
      price: `₹${priceInINR}`,
      paymentStatus: "pending", // add field in schema if not present
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Service: ${mechanicName}`,
              images: mechanicImage ? [mechanicImage] : undefined,
            },
            unit_amount: priceInINR * 100, // paise
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: pending._id.toString(),
        userEmail,
      },
      success_url: `${process.env.FRONTEND_URL}/bookings?status=success`,
      cancel_url: `${process.env.FRONTEND_URL}/bookings?status=cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stripe webhook to mark booking paid
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // set from Stripe dashboard
    let event = req.body;

    if (endpointSecret) {
      const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: "completed",
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
