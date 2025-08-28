"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const addressValidationSchema = zod_1.z.object({
    street: zod_1.z.string().min(1, "Street is required").trim(),
    city: zod_1.z.string().min(1, "City is required").trim(),
    state: zod_1.z.string().min(1, "State is required").trim(),
    zipCode: zod_1.z.string().min(1, "Zip code is required").trim(),
    country: zod_1.z.string().min(1, "Country is required").trim(),
});
const createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, "Name is required")
            .min(2, "Name must be at least 2 characters long")
            .max(50, "Name cannot exceed 50 characters")
            .trim(),
        email: zod_1.z
            .string()
            .min(1, "Email is required")
            .email("Please enter a valid email address")
            .toLowerCase(),
        password: zod_1.z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters long")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
        phone: zod_1.z
            .string()
            .min(1, "Phone number is required")
            .regex(/^\+?[\d\s\-()]+$/, "Please enter a valid phone number")
            .trim(),
        address: addressValidationSchema,
        role: zod_1.z.enum(["admin", "sender", "receiver"]).default("sender"),
    }),
});
const updateUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Name must be at least 2 characters long")
            .max(50, "Name cannot exceed 50 characters")
            .trim()
            .optional(),
        phone: zod_1.z
            .string()
            .regex(/^\+?[\d\s\-()]+$/, "Please enter a valid phone number")
            .trim()
            .optional(),
        address: addressValidationSchema.optional(),
    }),
});
const updateUserRoleValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        role: zod_1.z.enum(["admin", "sender", "receiver"]),
    }),
});
const blockUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        isBlocked: zod_1.z.boolean(),
    }),
});
const changePasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, "Current password is required"),
        newPassword: zod_1.z
            .string()
            .min(1, "New password is required")
            .min(8, "New password must be at least 8 characters long")
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "New password must contain at least one lowercase letter, one uppercase letter, and one number"),
    }),
});
exports.UserValidation = {
    createUserValidationSchema,
    updateUserValidationSchema,
    updateUserRoleValidationSchema,
    blockUserValidationSchema,
    changePasswordValidationSchema,
};
