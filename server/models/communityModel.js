import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
    {
      communityName: {
        type: String,
        required: [true, "name is required"],
      },
      pincode: {
        type: String,
        required: [true, "email is required"],
        unique: [true, "email already taken"],
      },
      leaderId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the ID of a user
        ref: 'users', 
      }
    }
  );

  export const communityModel = mongoose.model("Community", communitySchema);
  