import { Router } from "express";
import { ShopOwner } from "../models/ShopOwner.js";

const router = Router();

// Register shop owner (public)
router.post("/register", async (req, res) => {
  try {
    const { shopName, ownerName, gstNumber, mobile, email, address, password } = req.body;

    const exists = await ShopOwner.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered as shop owner" });

    const shopOwner = new ShopOwner({
      shopName, ownerName, gstNumber, mobile, email, address, password
    });
    await shopOwner.save();

    res.status(201).json({ message: "Registration submitted. Pending admin approval." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET pending shop owners (for admin dashboard)
router.get("/pending", async (req, res) => {
  // Add authentication for admin in production!
  try {
    const pendingOwners = await ShopOwner.find({ status: "pending" });
    res.json(pendingOwners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
