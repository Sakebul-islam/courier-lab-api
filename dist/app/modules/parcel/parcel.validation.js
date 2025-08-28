"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockParcelValidation = exports.assignDeliveryPersonnelValidation = exports.parcelIdValidation = exports.trackParcelValidation = exports.getParcelQueryValidation = exports.confirmDeliveryValidation = exports.updateParcelStatusValidation = exports.updateParcelValidation = exports.createParcelValidation = void 0;
const zod_1 = require("zod");
const parcel_interface_1 = require("./parcel.interface");
// Address validation schema
const addressSchema = zod_1.z.object({
    street: zod_1.z.string().trim().min(1, "Street is required"),
    city: zod_1.z.string().trim().min(1, "City is required"),
    state: zod_1.z.string().trim().min(1, "State is required"),
    zipCode: zod_1.z.string().trim().min(1, "Zip code is required"),
    country: zod_1.z.string().trim().min(1, "Country is required"),
});
// Receiver validation schema
const receiverSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Receiver name must be at least 2 characters")
        .max(50, "Name cannot exceed 50 characters"),
    email: zod_1.z.string().email("Invalid email format").toLowerCase(),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number format"),
    address: addressSchema,
});
// Dimensions validation schema
const dimensionsSchema = zod_1.z
    .object({
    length: zod_1.z.number().min(0.1, "Length must be greater than 0"),
    width: zod_1.z.number().min(0.1, "Width must be greater than 0"),
    height: zod_1.z.number().min(0.1, "Height must be greater than 0"),
})
    .optional();
// Parcel details validation schema
const parcelDetailsSchema = zod_1.z.object({
    type: zod_1.z.enum(["document", "package", "fragile", "electronics", "other"], {
        message: "Type must be document, package, fragile, electronics, or other",
    }),
    weight: zod_1.z
        .number()
        .min(0.1, "Weight must be at least 0.1 kg")
        .max(50, "Weight cannot exceed 50 kg"),
    dimensions: dimensionsSchema,
    description: zod_1.z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(500, "Description cannot exceed 500 characters"),
    value: zod_1.z.number().min(0, "Value cannot be negative").optional(),
});
// Delivery info validation schema
const deliveryInfoSchema = zod_1.z.object({
    preferredDeliveryDate: zod_1.z.coerce
        .date()
        .refine((date) => date > new Date(), {
        message: "Preferred delivery date must be in the future",
    })
        .optional(),
    deliveryInstructions: zod_1.z
        .string()
        .trim()
        .max(1000, "Delivery instructions cannot exceed 1000 characters")
        .optional(),
    urgency: zod_1.z
        .enum(["standard", "express", "urgent"], {
        message: "Urgency must be standard, express, or urgent",
    })
        .default("standard"),
});
// Create parcel validation
exports.createParcelValidation = zod_1.z.object({
    body: zod_1.z.object({
        receiver: receiverSchema,
        parcelDetails: parcelDetailsSchema,
        deliveryInfo: deliveryInfoSchema,
    }),
});
// Update parcel validation (partial updates allowed)
exports.updateParcelValidation = zod_1.z.object({
    body: zod_1.z.object({
        receiver: receiverSchema.partial().optional(),
        parcelDetails: parcelDetailsSchema.partial().optional(),
        deliveryInfo: deliveryInfoSchema.partial().optional(),
    }),
});
// Update parcel status validation
exports.updateParcelStatusValidation = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(parcel_interface_1.ParcelStatus, {
            message: "Invalid parcel status",
        }),
        location: zod_1.z.string().trim().optional(),
        note: zod_1.z
            .string()
            .trim()
            .max(500, "Note cannot exceed 500 characters")
            .optional(),
    }),
});
// Confirm delivery validation
exports.confirmDeliveryValidation = zod_1.z.object({
    body: zod_1.z.object({
        note: zod_1.z
            .string()
            .trim()
            .max(500, "Note cannot exceed 500 characters")
            .optional(),
    }),
});
// Query parameters validation for get parcels
exports.getParcelQueryValidation = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        sort: zod_1.z.string().optional(),
        fields: zod_1.z.string().optional(),
        searchTerm: zod_1.z.string().trim().optional(),
        status: zod_1.z.nativeEnum(parcel_interface_1.ParcelStatus).optional(),
        sender: zod_1.z.string().trim().optional(),
        receiverEmail: zod_1.z.string().email().optional(),
        trackingId: zod_1.z.string().trim().optional(),
        urgency: zod_1.z.enum(["standard", "express", "urgent"]).optional(),
        startDate: zod_1.z.string().pipe(zod_1.z.coerce.date()).optional(),
        endDate: zod_1.z.string().pipe(zod_1.z.coerce.date()).optional(),
    }),
});
// Track parcel validation (by tracking ID)
exports.trackParcelValidation = zod_1.z.object({
    params: zod_1.z.object({
        trackingId: zod_1.z
            .string()
            .trim()
            .regex(/^TRK-\d{8}-\d{6}$/, "Invalid tracking ID format"),
    }),
});
// Parcel ID validation
exports.parcelIdValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid parcel ID format"),
    }),
});
// Assign delivery personnel validation
exports.assignDeliveryPersonnelValidation = zod_1.z.object({
    body: zod_1.z.object({
        deliveryPersonnel: zod_1.z.object({
            name: zod_1.z
                .string()
                .trim()
                .min(2, "Name must be at least 2 characters long"),
            email: zod_1.z
                .string()
                .trim()
                .email("Please enter a valid email address")
                .toLowerCase(),
            phone: zod_1.z
                .string()
                .trim()
                .regex(/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"),
            employeeId: zod_1.z.string().trim().optional(),
            vehicleInfo: zod_1.z.object({
                type: zod_1.z.string().trim().min(1, "Vehicle type is required"),
                plateNumber: zod_1.z.string().trim().min(1, "Plate number is required"),
            }).optional(),
        }),
        note: zod_1.z
            .string()
            .trim()
            .max(500, "Note cannot exceed 500 characters")
            .optional(),
    }),
});
// Block/unblock parcel validation
exports.blockParcelValidation = zod_1.z.object({
    body: zod_1.z.object({
        isBlocked: zod_1.z.boolean(),
        reason: zod_1.z
            .string()
            .trim()
            .max(500, "Reason cannot exceed 500 characters")
            .optional(),
    }),
});
