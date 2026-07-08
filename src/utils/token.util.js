import jwt from "jsonwebtoken";
import env from "../config/env.js";
import ApiError from "./apiError.js";

export const generateRegistrationToken = (payload) => {
    return jwt.sign(payload, env.REGISTRATION_TOKEN_SECRET, {
        expiresIn: "10m",
    });
};

export const verifyRegistrationToken = (token) => {
    try {
        return jwt.verify(token, env.REGISTRATION_TOKEN_SECRET);
    } catch {
        throw new ApiError(401, "Registration session expired.");
    }
};

export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};