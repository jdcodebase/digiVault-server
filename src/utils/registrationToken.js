import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateRegistrationToken = (payload) => {
    return jwt.sign(payload, env.REGISTRATION_TOKEN_SECRET, {
        expiresIn: "10m",
    });
};

export const verifyRegistrationToken = (token) => {
    return jwt.verify(token, env.REGISTRATION_TOKEN_SECRET);
};