import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, "Product name is required"],
  },
  productDetails: {
    type: [String],
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Now userModel is accessible
    required: true,
  },
  bookedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  photoUrl: {
    type: String,
    required: true
  },
  givenTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" 
  },
  isRented: {
    type: Boolean,
    default: false
  }
});

export const productModel = mongoose.model("Products", productSchema);

