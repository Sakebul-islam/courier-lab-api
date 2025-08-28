"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const userTokens_1 = require("../../utils/userTokens");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const registerUser = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already exists
    const existingUser = yield user_model_1.User.findOne({ email: userData.email });
    if (existingUser) {
        throw new AppError_1.default(409, "User with this email already exists");
    }
    // Set default role if not provided
    if (!userData.role) {
        userData.role = "sender";
    }
    // Create new user
    const newUser = yield user_model_1.User.create(Object.assign(Object.assign({}, userData), { isVerified: true, isActive: user_interface_1.IsActive.ACTIVE, isDeleted: false }));
    // Return user without password
    const userObject = newUser.toObject();
    // Exclude password from user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password } = userObject, userWithoutPassword = __rest(userObject, ["password"]);
    return userWithoutPassword;
});
const loginUser = (loginData) => __awaiter(void 0, void 0, void 0, function* () {
    // Find user with password
    const user = yield user_model_1.User.findOne({ email: loginData.email }).select("+password");
    if (!user) {
        throw new AppError_1.default(401, "Invalid email or password");
    }
    // Check if user is verified
    if (!user.isVerified) {
        throw new AppError_1.default(401, "Please verify your email first");
    }
    // Check if user is active
    if (user.isActive === user_interface_1.IsActive.BLOCKED) {
        throw new AppError_1.default(401, "Your account has been blocked");
    }
    if (user.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new AppError_1.default(401, "Your account is inactive");
    }
    // Check if user is deleted
    if (user.isDeleted) {
        throw new AppError_1.default(401, "This account no longer exists");
    }
    // Verify password
    const isPasswordValid = yield user.isPasswordMatched(loginData.password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.default(401, "Invalid email or password");
    }
    // Generate JWT tokens using userTokens utility
    const tokens = (0, userTokens_1.createUserTokens)(user);
    // Return user data without password and tokens
    const userObject = user.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _ } = userObject, userWithoutPassword = __rest(userObject, ["password"]);
    return {
        user: userWithoutPassword,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
    };
});
const getMyProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId).select("-password");
    if (!user) {
        throw new AppError_1.default(404, "User profile not found");
    }
    return user;
});
const updateProfile = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    }).select("-password");
    if (!updatedUser) {
        throw new AppError_1.default(404, "User not found");
    }
    return updatedUser;
});
const changePassword = (userId, passwordData) => __awaiter(void 0, void 0, void 0, function* () {
    // Get user with password
    const user = yield user_model_1.User.findById(userId).select("+password");
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    // Check if current password is correct
    const isCurrentPasswordValid = yield user.isPasswordMatched(passwordData.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new AppError_1.default(400, "Current password is incorrect");
    }
    // Check if new password is different from current password
    const isSamePassword = yield user.isPasswordMatched(passwordData.newPassword, user.password);
    if (isSamePassword) {
        throw new AppError_1.default(400, "New password must be different from current password");
    }
    // Update password (will be hashed automatically by pre-save middleware)
    user.password = passwordData.newPassword;
    yield user.save();
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = yield (0, userTokens_1.createNewAccessTokenWithRefreshToken)(token);
    return {
        accessToken,
    };
});
const logoutUser = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // For JWT logout, we would typically blacklist the token
    // For now, we'll just validate that the user exists
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    // In a real implementation, you might:
    // 1. Add the token to a blacklist/redis cache
    // 2. Update user's tokenVersion to invalidate all tokens
    // 3. Clear any stored refresh tokens
    // For now, we'll just return success
});
exports.AuthService = {
    registerUser,
    loginUser,
    getMyProfile,
    updateProfile,
    changePassword,
    refreshToken,
    logoutUser,
};
