"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
// Admin-only routes
router.get("/", (0, checkAuth_1.checkAuth)("admin"), user_controller_1.UserController.getAllUsers); // Get all users (admin only)
router.get("/stats", (0, checkAuth_1.checkAuth)("admin"), user_controller_1.UserController.getUserStats); // Get user statistics (admin only)
router.get("/:id", (0, checkAuth_1.checkAuth)("admin"), user_controller_1.UserController.getUserById); // Get user by ID (admin only)
router.put("/:id/role", (0, checkAuth_1.checkAuth)("admin"), (0, validateRequest_1.validateRequest)(user_validation_1.UserValidation.updateUserRoleValidationSchema), user_controller_1.UserController.updateUserRole); // Update user role (admin only)
router.put("/:id/block", (0, checkAuth_1.checkAuth)("admin"), (0, validateRequest_1.validateRequest)(user_validation_1.UserValidation.blockUserValidationSchema), user_controller_1.UserController.blockUnblockUser); // Block/unblock user (admin only)
router.delete("/:id", (0, checkAuth_1.checkAuth)("admin"), user_controller_1.UserController.deleteUser); // Delete user (admin only)
// User profile routes (authenticated users)
router.get("/profile/me", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), user_controller_1.UserController.getMyProfile); // Get current user profile
router.put("/profile/update", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), (0, validateRequest_1.validateRequest)(user_validation_1.UserValidation.updateUserValidationSchema), user_controller_1.UserController.updateProfile); // Update user profile
router.put("/profile/change-password", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), (0, validateRequest_1.validateRequest)(user_validation_1.UserValidation.changePasswordValidationSchema), user_controller_1.UserController.changePassword); // Change password
exports.UserRoutes = router;
