import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    lastLogin: {
      type: Date,
    },

    loginAttempts: {
        type: Number,
        default: 0,
    },

    lockUntil: {
        type: Date,
        default: null,
    },

    passwordChangedAt: {
        type: Date,
        default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();

    try {
        const hashedPassword = await argon2.hash(this.password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16, // 64 MB
            timeCost: 5, // Number of iterations
            parallelism: 1, // Number of threads
        });
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    return argon2.verify(this.password, candidatePassword);
};

const User = mongoose.model("User", userSchema);

export default User;