import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email already taken"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password length should be greater than 6"],
    },
    phone: {
      type: String,
      required: [true, "Phone no. is required"],
    },
    verificationToken: {
      type: String
    },
    verified: {
      type: Boolean
    }
  },
  { timestamps: true }
);

//function
//hash func
userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 10);
});

//compare password
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//JWT TOKEN
userSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

const userModel = mongoose.model("User", userSchema);
export default userModel;
