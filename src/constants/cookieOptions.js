import env from "../config/env.js";

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
};

export const accessCookieOptions = {
  ...baseCookieOptions,
  sameSite: "strict",
  maxAge: 15 * 60 * 1000,
};

export const refreshCookieOptions = {
  ...baseCookieOptions,
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registrationCookieOptions = {
  ...baseCookieOptions,
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
};

// For clearCookie()
export const clearAccessCookieOptions = {
  ...baseCookieOptions,
  sameSite: "strict",
};

export const clearRefreshCookieOptions = {
  ...baseCookieOptions,
  sameSite: "strict",
};

export const clearRegistrationCookieOptions = {
  ...baseCookieOptions,
  sameSite: "lax",
};