"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const checkAuth_1 = require("../../middlewares/checkAuth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const parcel_controller_1 = require("./parcel.controller");
const parcel_validation_1 = require("./parcel.validation");
const router = (0, express_1.Router)();
// Public Routes
router.get("/track/:trackingId", (0, validateRequest_1.validateRequest)(parcel_validation_1.trackParcelValidation), parcel_controller_1.ParcelController.trackParcel);
// Sender Routes
router.post("/", (0, checkAuth_1.checkAuth)("sender"), (0, validateRequest_1.validateRequest)(parcel_validation_1.createParcelValidation), parcel_controller_1.ParcelController.createParcel);
router.get("/my-sent", (0, checkAuth_1.checkAuth)("sender"), (0, validateRequest_1.validateRequest)(parcel_validation_1.getParcelQueryValidation), parcel_controller_1.ParcelController.getMySentParcels);
router.put("/:id", (0, checkAuth_1.checkAuth)("sender"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), (0, validateRequest_1.validateRequest)(parcel_validation_1.updateParcelValidation), parcel_controller_1.ParcelController.updateParcel);
router.delete("/:id/cancel", (0, checkAuth_1.checkAuth)("sender"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), parcel_controller_1.ParcelController.cancelParcel);
// Receiver Routes
router.get("/my-received", (0, checkAuth_1.checkAuth)("receiver"), (0, validateRequest_1.validateRequest)(parcel_validation_1.getParcelQueryValidation), parcel_controller_1.ParcelController.getMyReceivedParcels);
router.put("/:id/confirm-delivery", (0, checkAuth_1.checkAuth)("receiver"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), (0, validateRequest_1.validateRequest)(parcel_validation_1.confirmDeliveryValidation), parcel_controller_1.ParcelController.confirmDelivery);
router.get("/delivery-history", (0, checkAuth_1.checkAuth)("receiver"), (0, validateRequest_1.validateRequest)(parcel_validation_1.getParcelQueryValidation), parcel_controller_1.ParcelController.getDeliveryHistory);
// Admin Routes
router.get("/", (0, checkAuth_1.checkAuth)("admin"), (0, validateRequest_1.validateRequest)(parcel_validation_1.getParcelQueryValidation), parcel_controller_1.ParcelController.getAllParcels);
router.put("/:id/status", (0, checkAuth_1.checkAuth)("admin"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), (0, validateRequest_1.validateRequest)(parcel_validation_1.updateParcelStatusValidation), parcel_controller_1.ParcelController.updateParcelStatus);
router.put("/:id/block", (0, checkAuth_1.checkAuth)("admin"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), (0, validateRequest_1.validateRequest)(parcel_validation_1.blockParcelValidation), parcel_controller_1.ParcelController.blockParcel);
router.put("/:id/assign", (0, checkAuth_1.checkAuth)("admin"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), (0, validateRequest_1.validateRequest)(parcel_validation_1.assignDeliveryPersonnelValidation), parcel_controller_1.ParcelController.assignDeliveryPersonnel);
router.get("/stats", (0, checkAuth_1.checkAuth)("admin"), parcel_controller_1.ParcelController.getParcelStats);
// Get user notifications (status updates from parcels) - Must come before :id routes
router.get("/notifications", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), parcel_controller_1.ParcelController.getUserNotifications);
router.delete("/:id", (0, checkAuth_1.checkAuth)("admin"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), parcel_controller_1.ParcelController.deleteParcel);
// Shared Routes (Role-based access)
router.get("/:id", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), parcel_controller_1.ParcelController.getParcelById);
router.get("/:id/status-history", (0, checkAuth_1.checkAuth)("admin", "sender", "receiver"), (0, validateRequest_1.validateRequest)(parcel_validation_1.parcelIdValidation), parcel_controller_1.ParcelController.getParcelStatusHistory);
exports.ParcelRoutes = router;
