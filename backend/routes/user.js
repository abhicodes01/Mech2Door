import { Router } from "express";
import { User } from "../models/User.js";

const router = Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered." });

    const user = new User({ firstName, lastName, email, password });
    await user.save();

    res.status(201).json({ message: "User registration successful!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User sign-in
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password }); // For demo, use plain password; HASH in production!
    if (!user) {
      return res.status(401).json({ error: "Wrong username or password" });
    }
    res.json({ message: "Sign-in successful!", user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const { email, firstName, lastName, image, vehicle, phone, dob } = req.body;
    // Find the user by email and update extra fields
    const user = await User.findOneAndUpdate(
      { email },
      { firstName, lastName, image, vehicle, phone, dob },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated successfully!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

  router.post("/logout", (req,res)=> {
    res.clearCookie("connect.sid")
    res.json({message: "Logout Successful"})
  })
});


export default router;
