import argon2 from "argon2";

export const hashRefreshToken = async (refreshToken) => {
    return await argon2.hash(refreshToken, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16,
        timeCost: 5,
        parallelism: 1,
    });
};

export const verifyRefreshToken = async (
    refreshToken,
    hashedRefreshToken
) => {
    return await argon2.verify(hashedRefreshToken, refreshToken);
};