import express from "express";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";

const router = express.Router();

// Helper: Basic intent detection
function detectIntent(text = "") {
  const t = text.toLowerCase();
  if (t.includes("booking") || t.includes("appointment") || t.includes("reservation")) {
    return "BOOKINGS";
  }
  if (t.includes("profile") || t.includes("account") || t.includes("user") || t.includes("details")) {
    return "USER";
  }
  return "GEMINI";
}

// Get user data by email
async function getUserData(email) {
  try {
    const user = await User.findOne({ email }).lean();
    return user;
  } catch (err) {
    return null;
  }
}

// Get all bookings for a user
async function getUserBookings(email) {
  try {
    const bookings = await Booking.find({ userEmail: email })
      .sort({ createdAt: -1 })
      .lean();
    return bookings;
  } catch (err) {
    return [];
  }
}

// POST /api/chat/chat - Main chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, email } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const intent = detectIntent(message);

    // Handle app-specific queries
    if (intent !== "GEMINI") {
      if (!email) {
        return res.status(400).json({ 
          error: "Email required for account queries" 
        });
      }

      // USER PROFILE QUERY
      if (intent === "USER") {
        const user = await getUserData(email);
        if (!user) {
          return res.json({
            type: "APP_DATA",
            reply: "No user profile found for this email.",
            data: null,
          });
        }
        return res.json({
          type: "APP_DATA",
          reply: "Here are your profile details:",
          data: {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
            vehicle: user.vehicle || "",
            dob: user.dob || "",
          },
        });
      }

      // BOOKINGS QUERY
      if (intent === "BOOKINGS") {
        const bookings = await getUserBookings(email);
        if (!bookings || bookings.length === 0) {
          return res.json({
            type: "APP_DATA",
            reply: "You have no bookings yet.",
            data: [],
          });
        }
        return res.json({
          type: "APP_DATA",
          reply: `You have ${bookings.length} booking(s):`,
          data: bookings.map((b) => ({
            id: b._id,
            name: b.name,
            vehicle: b.vehicle,
            mechanicName: b.mechanicName,
            location: b.location,
            date: b.date,
            time: b.time,
            price: b.price,
            problemDescription: b.problemDescription,
          })),
        });
      }
    }

    // GEMINI AI QUERY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "Gemini API key not configured" 
      });
    }

    const geminiUrl = 
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    
    const geminiBody = {
      contents: [
        {
          parts: [{ text: message }],
        },
      ],
    };

    const response = await fetch(`${geminiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    const geminiData = await response.json();

    // Extract text from Gemini response
    const text =
      geminiData?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        .join("\n") ||
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    return res.json({
      type: "GEMINI",
      reply: text,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ 
      error: "Something went wrong: " + err.message 
    });
  }
});

export default router;
