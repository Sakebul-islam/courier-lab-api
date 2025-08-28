"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const env_1 = require("../../config/env");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const router = express_1.default.Router();
// Public routes (no authentication required)
router.post("/register", (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.registerValidationSchema), auth_controller_1.AuthController.register);
router.post("/login", (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.loginValidationSchema), auth_controller_1.AuthController.login);
router.post("/refresh-token", auth_controller_1.AuthController.refreshToken);
// Protected routes (authentication required)
router.get("/me", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), auth_controller_1.AuthController.getMe);
router.put("/profile", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.updateProfileValidationSchema), auth_controller_1.AuthController.updateProfile);
router.put("/change-password", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), (0, validateRequest_1.validateRequest)(auth_validation_1.AuthValidation.changePasswordValidationSchema), auth_controller_1.AuthController.changePassword);
router.post("/logout", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), auth_controller_1.AuthController.logout);
router.get("/google", (req, res, next) => {
    const redirect = req.query.redirect || "/";
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state: redirect,
    })(req, res, next);
});
// api/v1/auth/google/callback?state=/parcel
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: `${env_1.envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!`,
}), auth_controller_1.AuthController.googleCallbackController);
exports.AuthRoutes = router;
