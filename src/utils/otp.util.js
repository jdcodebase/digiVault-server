import crypto from "crypto";
import argon2 from "argon2";

export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashOtp = async (otp) => {
  return await argon2.hash(otp, {
    type: argon2.argon2id,
    memoryCost: 16384,
    timeCost: 2,
    parallelism: 1,
  });
};

export const verifyOtp = async (otp, hashedOtp) => {
  return await argon2.verify(hashedOtp, otp);
};