import express from "express";
import Wishlist from "../Model/Wishlist.js";


const router = express.Router();

// Add item to wishlist
router.post("/add", async (req, res) => {
  const { Email, product } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ Email });

    if (!wishlist) {
      wishlist = new Wishlist({ Email, items: [product] });
    } else {
      // Check if item already exists
      const exists = wishlist.items.some(
        (item) => item._id.toString() === product._id
      );
      if (exists) {
        return res.status(409).json({ message: "Item already in wishlist" });
      }
      wishlist.items.push(product);
    }

    await wishlist.save();
    res.status(200).json({ message: "Added to wishlist", wishlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's wishlist
router.get("/:Email", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ Email: req.params.Email });
    res.status(200).json(wishlist ? wishlist.items : []);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Remove item from wishlist
router.delete("/remove", async (req, res) => {
  const { Email, productId } = req.body;

  try {
    const wishlist = await Wishlist.findOne({ Email });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(
        (item) => item._id.toString() !== productId
      );
      await wishlist.save();
    }
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;