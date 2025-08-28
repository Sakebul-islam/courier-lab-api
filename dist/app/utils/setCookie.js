"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookie = void 0;
const env_1 = require("../config/env");
const setAuthCookie = (res, tokenInfo) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: env_1.envVars.NODE_ENV === "production",
            sameSite: "none",
        });
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: env_1.envVars.NODE_ENV === "production",
            sameSite: "none",
        });
    }
};
exports.setAuthCookie = setAuthCookie;
const clearAuthCookies = (res) => {
    // Clear cookies with the same options used when setting them
    const cookieOptions = {
        httpOnly: true,
        secure: env_1.envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
    };
    // Clear with path
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);
    // Clear without path for broader coverage
    const cookieOptionsNoPath = {
        httpOnly: true,
        secure: env_1.envVars.NODE_ENV === "production",
        sameSite: "none",
    };
    res.clearCookie("accessToken", cookieOptionsNoPath);
    res.clearCookie("refreshToken", cookieOptionsNoPath);
    // Clear with different domain options for production
    if (env_1.envVars.NODE_ENV === "production") {
        const cookieOptionsWithDomain = Object.assign(Object.assign({}, cookieOptions), { domain: undefined });
        res.clearCookie("accessToken", cookieOptionsWithDomain);
        res.clearCookie("refreshToken", cookieOptionsWithDomain);
    }
    // Force expire cookies by setting them to past date
    const pastDate = new Date(0);
    res.cookie("accessToken", "", {
        expires: pastDate,
        httpOnly: true,
        secure: env_1.envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
    });
    res.cookie("refreshToken", "", {
        expires: pastDate,
        httpOnly: true,
        secure: env_1.envVars.NODE_ENV === "production",
        sameSite: "none",
        path: "/",
    });
    // Add cache control headers to prevent caching
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
};
exports.clearAuthCookies = clearAuthCookies;
