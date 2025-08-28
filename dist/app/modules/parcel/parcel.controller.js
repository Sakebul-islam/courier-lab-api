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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelController = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const parcel_service_1 = require("./parcel.service");
// Create new parcel (Sender only)
const createParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const parcelData = req.body;
    if (!senderId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.createParcel(senderId, parcelData);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: "Parcel created successfully",
        data: result,
    });
}));
// Get parcel by ID (Owner or Admin only)
const getParcelById = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!userId || !userRole) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.getParcelById(id, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcel retrieved successfully",
        data: result,
    });
}));
// Track parcel by tracking ID (Public)
const trackParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackingId } = req.params;
    const result = yield parcel_service_1.ParcelService.trackParcelByTrackingId(trackingId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcel tracked successfully",
        data: result,
    });
}));
// Get all parcels with filters (Admin only)
const getAllParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_service_1.ParcelService.getAllParcels(req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcels retrieved successfully",
        data: result.parcels,
        meta: result.meta,
    });
}));
// Get sender's parcels (Sender only)
const getMySentParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!senderId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.getSenderParcels(senderId, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Sent parcels retrieved successfully",
        data: result.parcels,
        meta: result.meta,
    });
}));
// Get receiver's parcels (Receiver only)
const getMyReceivedParcels = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    if (!userEmail) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.getReceiverParcels(userEmail, req.query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Received parcels retrieved successfully",
        data: result.parcels,
        meta: result.meta,
    });
}));
// Update parcel details (Sender only, before dispatch)
const updateParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const updateData = req.body;
    if (!senderId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.updateParcel(id, senderId, updateData);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcel updated successfully",
        data: result,
    });
}));
// Update parcel status (Admin only)
const updateParcelStatus = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const statusUpdate = req.body;
    if (!adminId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.updateParcelStatus(id, adminId, statusUpdate);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcel status updated successfully",
        data: result,
    });
}));
// Cancel parcel (Sender only, if not dispatched)
const cancelParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { reason } = req.body;
    if (!senderId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.cancelParcel(id, senderId, reason);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcel cancelled successfully",
        data: result,
    });
}));
// Confirm delivery (Receiver only)
const confirmDelivery = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const receiverEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const { note } = req.body;
    if (!receiverEmail) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.confirmDelivery(id, receiverEmail, note);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Delivery confirmed successfully",
        data: result,
    });
}));
// Block/unblock parcel (Admin only)
const blockParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { isBlocked, reason } = req.body;
    if (!adminId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.blockParcel(id, adminId, isBlocked, reason);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: `Parcel ${isBlocked ? "blocked" : "unblocked"} successfully`,
        data: result,
    });
}));
// Assign delivery personnel (Admin only)
const assignDeliveryPersonnel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { deliveryPersonnel, note } = req.body;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!adminId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Admin not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.assignDeliveryPersonnel(id, deliveryPersonnel, note, adminId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Delivery personnel assigned successfully",
        data: result,
    });
}));
// Delete parcel (Admin only)
const deleteParcel = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    yield parcel_service_1.ParcelService.deleteParcel(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcel deleted successfully",
        data: null,
    });
}));
// Get parcel statistics (Admin only)
const getParcelStats = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield parcel_service_1.ParcelService.getParcelStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcel statistics retrieved successfully",
        data: result,
    });
}));
// Get parcel status history (Owner or Admin only)
const getParcelStatusHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    if (!userId || !userRole) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const parcel = yield parcel_service_1.ParcelService.getParcelById(id, userId, userRole);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Parcel status history retrieved successfully",
        data: parcel.statusHistory,
    });
}));
// Get delivery history for receiver
const getDeliveryHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const receiverEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    if (!receiverEmail) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    // Filter for delivered parcels only
    const queryWithDeliveredFilter = Object.assign(Object.assign({}, req.query), { status: "delivered" });
    const result = yield parcel_service_1.ParcelService.getReceiverParcels(receiverEmail, queryWithDeliveredFilter);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Delivery history retrieved successfully",
        data: result.parcels,
        meta: result.meta,
    });
}));
// Get user notifications from parcel status updates
const getUserNotifications = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
    const userEmail = (_c = req.user) === null || _c === void 0 ? void 0 : _c.email;
    if (!userId || !userRole || !userEmail) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "User not authenticated");
    }
    const result = yield parcel_service_1.ParcelService.getUserNotifications(userId, userRole, userEmail);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "User notifications retrieved successfully",
        data: result,
    });
}));
exports.ParcelController = {
    createParcel,
    getParcelById,
    trackParcel,
    getAllParcels,
    getMySentParcels,
    getMyReceivedParcels,
    updateParcel,
    updateParcelStatus,
    cancelParcel,
    confirmDelivery,
    blockParcel,
    assignDeliveryPersonnel,
    deleteParcel,
    getParcelStats,
    getParcelStatusHistory,
    getDeliveryHistory,
    getUserNotifications,
};
