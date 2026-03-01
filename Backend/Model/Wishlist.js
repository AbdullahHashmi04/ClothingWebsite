import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  Email: { type: String, required: true, unique: true },
  items: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      imageUrl: { type: String },
    },
  ],
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;