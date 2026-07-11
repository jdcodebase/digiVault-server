import argon2 from "argon2";

export const hashRefreshToken = (refreshToken) =>
    argon2.hash(refreshToken, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 5,
        parallelism: 1,
    });

export const verifyRefreshTokenHash = (
  refreshToken,
  hashedRefreshToken
) => {
  if (!hashedRefreshToken) return false;

  return argon2.verify(hashedRefreshToken, refreshToken);
};