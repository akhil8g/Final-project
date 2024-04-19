import mongoose from "mongoose";
import userModel from './userModel.js';
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
    ref: userModel, // Assuming your user model is named 'User'
    required: true,
  },
});

export const productModel = mongoose.model("Products", productSchema);


