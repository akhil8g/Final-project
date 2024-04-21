import mongoose from "mongoose";
import {userModel} from './userModel.js';
const requestSchema = new mongoose.Schema({
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
  photoUrl: {
    type: String,
    
  },
  communityId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community"
  },
},
{ timestamps: true }
);

export const requestModel = mongoose.model("Requests", requestSchema);


