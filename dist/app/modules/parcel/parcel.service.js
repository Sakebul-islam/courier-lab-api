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
exports.ParcelService = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const feeCalculator_1 = require("../../utils/feeCalculator");
const QueryBuilder_1 = require("../../utils/QueryBuilder");
const tracking_1 = require("../../utils/tracking");
const user_model_1 = require("../user/user.model");
const parcel_interface_1 = require("./parcel.interface");
const parcel_model_1 = require("./parcel.model");
// Status transition rules as defined in SRS
const allowedTransitions = {
    [parcel_interface_1.ParcelStatus.REQUESTED]: [parcel_interface_1.ParcelStatus.APPROVED, parcel_interface_1.ParcelStatus.CANCELLED],
    [parcel_interface_1.ParcelStatus.APPROVED]: [parcel_interface_1.ParcelStatus.PICKED_UP, parcel_interface_1.ParcelStatus.CANCELLED],
    [parcel_interface_1.ParcelStatus.PICKED_UP]: [parcel_interface_1.ParcelStatus.IN_TRANSIT, parcel_interface_1.ParcelStatus.RETURNED],
    [parcel_interface_1.ParcelStatus.IN_TRANSIT]: [
        parcel_interface_1.ParcelStatus.OUT_FOR_DELIVERY,
        parcel_interface_1.ParcelStatus.FAILED_DELIVERY,
    ],
    [parcel_interface_1.ParcelStatus.OUT_FOR_DELIVERY]: [
        parcel_interface_1.ParcelStatus.DELIVERED,
        parcel_interface_1.ParcelStatus.FAILED_DELIVERY,
    ],
    [parcel_interface_1.ParcelStatus.DELIVERED]: [], // Terminal state
    [parcel_interface_1.ParcelStatus.CANCELLED]: [], // Terminal state
    [parcel_interface_1.ParcelStatus.RETURNED]: [parcel_interface_1.ParcelStatus.REQUESTED], // Can be re-requested
    [parcel_interface_1.ParcelStatus.FAILED_DELIVERY]: [
        parcel_interface_1.ParcelStatus.OUT_FOR_DELIVERY,
        parcel_interface_1.ParcelStatus.RETURNED,
    ],
};
// Create a new parcel (Sender only)
const createParcel = (senderId, parcelData) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify sender exists and has sender role
    const sender = yield user_model_1.User.findById(senderId);
    if (!sender) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Sender not found");
    }
    if (sender.role !== "sender") {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Only users with sender role can create parcels");
    }
    if (sender.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Your account is blocked");
    }
    // Validate fee calculation input
    const feeValidation = (0, feeCalculator_1.validateFeeCalculationInput)(parcelData.parcelDetails, parcelData.deliveryInfo);
    if (!feeValidation.isValid) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, feeValidation.errors.join(", "));
    }
    // Calculate pricing
    const pricing = (0, feeCalculator_1.calculateParcelFee)({
        parcelDetails: parcelData.parcelDetails,
        deliveryInfo: parcelData.deliveryInfo,
    });
    // Generate unique tracking ID
    let trackingId = (0, tracking_1.generateTrackingId)();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
        const existingParcel = yield parcel_model_1.Parcel.findOne({ trackingId });
        if (!existingParcel) {
            isUnique = true;
        }
        else {
            trackingId = (0, tracking_1.generateTrackingId)();
        }
        attempts++;
    }
    if (!isUnique) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to generate unique tracking ID");
    }
    // Create parcel
    const newParcel = yield parcel_model_1.Parcel.create({
        trackingId,
        sender: senderId,
        receiver: parcelData.receiver,
        parcelDetails: parcelData.parcelDetails,
        deliveryInfo: parcelData.deliveryInfo,
        pricing,
        currentStatus: parcel_interface_1.ParcelStatus.REQUESTED,
    });
    return (yield parcel_model_1.Parcel.findById(newParcel._id).populate("sender", "name email phone"));
});
// Get parcel by ID (Owner or Admin only)
const getParcelById = (parcelId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const parcel = yield parcel_model_1.Parcel.findById(parcelId).populate("sender", "name email phone");
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found");
    }
    // Check access permissions
    const isSender = parcel.sender.toString() === userId;
    const isReceiver = parcel.receiver.email === ((_a = (yield user_model_1.User.findById(userId))) === null || _a === void 0 ? void 0 : _a.email);
    const isAdmin = userRole === "admin";
    if (!isSender && !isReceiver && !isAdmin) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You do not have permission to view this parcel");
    }
    return parcel;
});
// Track parcel by tracking ID (Public)
const trackParcelByTrackingId = (trackingId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findOne({ trackingId }).populate("sender", "name email phone");
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found with this tracking ID");
    }
    return parcel;
});
// Get all parcels with filters (Admin only)
const getAllParcels = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchableFields = [
        "trackingId",
        "receiver.name",
        "receiver.email",
        "parcelDetails.description",
    ];
    const parcelQuery = new QueryBuilder_1.QueryBuilder(parcel_model_1.Parcel.find().populate("sender", "name email phone"), query)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const parcels = (yield parcelQuery.build());
    const meta = yield parcelQuery.getMeta();
    return { parcels, meta };
});
// Get sender's parcels
const getSenderParcels = (senderId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchableFields = [
        "trackingId",
        "receiver.name",
        "receiver.email",
        "parcelDetails.description",
    ];
    const parcelQuery = new QueryBuilder_1.QueryBuilder(parcel_model_1.Parcel.find({ sender: senderId }).populate("sender", "name email phone"), query)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const parcels = (yield parcelQuery.build());
    const meta = yield parcelQuery.getMeta();
    return { parcels, meta };
});
// Get receiver's parcels
const getReceiverParcels = (receiverEmail, query) => __awaiter(void 0, void 0, void 0, function* () {
    const searchableFields = ["trackingId", "parcelDetails.description"];
    const parcelQuery = new QueryBuilder_1.QueryBuilder(parcel_model_1.Parcel.find({ "receiver.email": receiverEmail }).populate("sender", "name email phone"), query)
        .search(searchableFields)
        .filter()
        .sort()
        .paginate()
        .fields();
    const parcels = (yield parcelQuery.build());
    const meta = yield parcelQuery.getMeta();
    return { parcels, meta };
});
// Update parcel details (Sender only, before dispatch)
const updateParcel = (parcelId, senderId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found");
    }
    // Check if user is the sender
    if (parcel.sender.toString() !== senderId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You can only update your own parcels");
    }
    // Check if parcel can be updated (only before dispatch)
    if (![parcel_interface_1.ParcelStatus.REQUESTED, parcel_interface_1.ParcelStatus.APPROVED].includes(parcel.currentStatus)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot update parcel after it has been dispatched");
    }
    if (parcel.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot update blocked parcel");
    }
    if (parcel.isCancelled) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot update cancelled parcel");
    }
    // Recalculate pricing only if fields that affect pricing changed
    let newPricing = parcel.pricing;
    const needsPricingRecalculation = updateData.parcelDetails ||
        (updateData.deliveryInfo && updateData.deliveryInfo.urgency);
    if (needsPricingRecalculation) {
        const updatedParcelDetails = parcel.parcelDetails;
        const updatedDeliveryInfo = Object.assign(Object.assign({}, parcel.deliveryInfo), (updateData.deliveryInfo || {}));
        const feeValidation = (0, feeCalculator_1.validateFeeCalculationInput)(updatedParcelDetails, updatedDeliveryInfo);
        if (!feeValidation.isValid) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, feeValidation.errors.join(", "));
        }
        newPricing = (0, feeCalculator_1.calculateParcelFee)({
            parcelDetails: updatedParcelDetails,
            deliveryInfo: updatedDeliveryInfo,
            discount: parcel.pricing.discount,
            couponCode: parcel.pricing.couponCode,
        });
    }
    // Helper function to flatten nested objects for MongoDB updates
    const flattenObject = (obj, prefix = "") => {
        const flattened = {};
        for (const key in obj) {
            if (obj[key] !== null &&
                typeof obj[key] === "object" &&
                !Array.isArray(obj[key])) {
                Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`));
            }
            else {
                flattened[`${prefix}${key}`] = obj[key];
            }
        }
        return flattened;
    };
    // Flatten nested updates for proper partial updates
    const updateFields = {
        pricing: newPricing,
        updatedAt: new Date(),
    };
    // Handle receiver partial updates
    if (updateData.receiver) {
        Object.assign(updateFields, flattenObject(updateData.receiver, "receiver."));
    }
    // Handle parcelDetails partial updates
    if (updateData.parcelDetails) {
        Object.assign(updateFields, flattenObject(updateData.parcelDetails, "parcelDetails."));
    }
    // Handle deliveryInfo partial updates
    if (updateData.deliveryInfo) {
        Object.assign(updateFields, flattenObject(updateData.deliveryInfo, "deliveryInfo."));
    }
    const updatedParcel = yield parcel_model_1.Parcel.findByIdAndUpdate(parcelId, { $set: updateFields }, { new: true, runValidators: false }).populate("sender", "name email phone");
    return updatedParcel;
});
// Update parcel status (Admin only)
const updateParcelStatus = (parcelId, adminId, statusUpdate) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found");
    }
    if (parcel.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot update status of blocked parcel");
    }
    // Validate status transition
    const allowedNextStatuses = allowedTransitions[parcel.currentStatus];
    if (!allowedNextStatuses.includes(statusUpdate.status)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, `Cannot transition from ${parcel.currentStatus} to ${statusUpdate.status}`);
    }
    // Add status log entry
    const statusLogEntry = {
        status: statusUpdate.status,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        location: statusUpdate.location,
        note: statusUpdate.note,
    };
    const updatedParcel = yield parcel_model_1.Parcel.findByIdAndUpdate(parcelId, Object.assign({ currentStatus: statusUpdate.status, $push: { statusHistory: statusLogEntry }, updatedAt: new Date() }, (statusUpdate.status === parcel_interface_1.ParcelStatus.CANCELLED && {
        isCancelled: true,
    })), { new: true, runValidators: true }).populate("sender", "name email phone");
    return updatedParcel;
});
// Cancel parcel (Sender only, if not dispatched)
const cancelParcel = (parcelId, senderId, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found");
    }
    // Check if user is the sender
    if (parcel.sender.toString() !== senderId) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You can only cancel your own parcels");
    }
    // Check if parcel can be cancelled
    if (![parcel_interface_1.ParcelStatus.REQUESTED, parcel_interface_1.ParcelStatus.APPROVED].includes(parcel.currentStatus)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot cancel parcel after it has been dispatched");
    }
    if (parcel.isCancelled) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Parcel is already cancelled");
    }
    // Add cancellation status log
    const statusLogEntry = {
        status: parcel_interface_1.ParcelStatus.CANCELLED,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(senderId),
        note: reason || "Cancelled by sender",
    };
    const updatedParcel = yield parcel_model_1.Parcel.findByIdAndUpdate(parcelId, {
        currentStatus: parcel_interface_1.ParcelStatus.CANCELLED,
        isCancelled: true,
        $push: { statusHistory: statusLogEntry },
        updatedAt: new Date(),
    }, { new: true, runValidators: true }).populate("sender", "name email phone");
    return updatedParcel;
});
// Confirm delivery (Receiver only)
const confirmDelivery = (parcelId, receiverEmail, note) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found");
    }
    // Check if user is the receiver
    if (parcel.receiver.email !== receiverEmail) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You can only confirm delivery for parcels addressed to you");
    }
    if (parcel.currentStatus !== parcel_interface_1.ParcelStatus.OUT_FOR_DELIVERY) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Parcel must be out for delivery to confirm delivery");
    }
    // Find if receiver is a registered user, otherwise use a placeholder ObjectId
    let updatedById;
    const receiverUser = yield user_model_1.User.findOne({ email: receiverEmail });
    if (receiverUser) {
        updatedById = new mongoose_1.Types.ObjectId(receiverUser._id);
    }
    else {
        // Use a default ObjectId for non-registered receivers (we'll create a note to identify)
        // This represents the system handling delivery confirmation for non-registered users
        updatedById = new mongoose_1.Types.ObjectId("000000000000000000000000"); // System placeholder
    }
    // Add delivery confirmation status log
    const statusLogEntry = {
        status: parcel_interface_1.ParcelStatus.DELIVERED,
        timestamp: new Date(),
        updatedBy: updatedById,
        note: receiverUser
            ? note || "Delivery confirmed by receiver"
            : `Delivery confirmed by non-registered receiver: ${receiverEmail}${note ? ` - ${note}` : ""}`,
    };
    const updatedParcel = yield parcel_model_1.Parcel.findByIdAndUpdate(parcelId, {
        currentStatus: parcel_interface_1.ParcelStatus.DELIVERED,
        $push: { statusHistory: statusLogEntry },
        updatedAt: new Date(),
    }, { new: true, runValidators: true }).populate("sender", "name email phone");
    return updatedParcel;
});
// Block/unblock parcel (Admin only)
const blockParcel = (parcelId, adminId, isBlocked, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found");
    }
    const action = isBlocked ? "blocked" : "unblocked";
    const statusLogEntry = {
        status: parcel.currentStatus,
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: `Parcel ${action} by admin${reason ? `: ${reason}` : ""}`,
    };
    const updatedParcel = yield parcel_model_1.Parcel.findByIdAndUpdate(parcelId, {
        isBlocked,
        $push: { statusHistory: statusLogEntry },
        updatedAt: new Date(),
    }, { new: true, runValidators: true }).populate("sender", "name email phone");
    return updatedParcel;
});
// Assign delivery personnel (Admin only)
const assignDeliveryPersonnel = (parcelId, deliveryPersonnelInfo, note, adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found");
    }
    // Check if parcel is already assigned to delivery personnel
    if (parcel.deliveryPersonnel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Parcel is already assigned to delivery personnel");
    }
    // Check if parcel can be assigned (not delivered, cancelled, or returned)
    if ([parcel_interface_1.ParcelStatus.DELIVERED, parcel_interface_1.ParcelStatus.CANCELLED, parcel_interface_1.ParcelStatus.RETURNED].includes(parcel.currentStatus)) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Cannot assign delivery personnel to parcels that are delivered, cancelled, or returned");
    }
    // Create status log entry for assignment
    const statusLogEntry = {
        status: parcel.currentStatus, // Keep current status
        timestamp: new Date(),
        updatedBy: new mongoose_1.Types.ObjectId(adminId),
        note: note || "Delivery personnel assigned",
    };
    // Update parcel with delivery personnel and status history
    const updatedParcel = yield parcel_model_1.Parcel.findByIdAndUpdate(parcelId, {
        deliveryPersonnel: deliveryPersonnelInfo,
        $push: { statusHistory: statusLogEntry },
        updatedAt: new Date(),
    }, { new: true, runValidators: true }).populate("sender", "name email phone");
    return updatedParcel;
});
// Delete parcel (Admin only)
const deleteParcel = (parcelId) => __awaiter(void 0, void 0, void 0, function* () {
    const parcel = yield parcel_model_1.Parcel.findById(parcelId);
    if (!parcel) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Parcel not found");
    }
    yield parcel_model_1.Parcel.findByIdAndDelete(parcelId);
});
// Get parcel statistics (Admin only)
const getParcelStats = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    // Get status breakdown
    const statusStats = yield parcel_model_1.Parcel.aggregate([
        {
            $group: {
                _id: "$currentStatus",
                count: { $sum: 1 },
            },
        },
    ]);
    // Initialize status breakdown with all statuses
    const statusBreakdown = {
        requested: 0,
        approved: 0,
        picked_up: 0,
        in_transit: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0,
        returned: 0,
        failed_delivery: 0,
    };
    // Populate status breakdown from database results
    statusStats.forEach((stat) => {
        if (stat._id in statusBreakdown) {
            statusBreakdown[stat._id] = stat.count;
        }
    });
    // Calculate derived counts
    const totalParcels = Object.values(statusBreakdown).reduce((sum, count) => sum + count, 0);
    const deliveredParcels = statusBreakdown.delivered;
    const inTransitParcels = statusBreakdown.in_transit + statusBreakdown.out_for_delivery + statusBreakdown.picked_up;
    const pendingParcels = statusBreakdown.requested + statusBreakdown.approved;
    const cancelledParcels = statusBreakdown.cancelled + statusBreakdown.returned + statusBreakdown.failed_delivery;
    // Calculate revenue for current month
    const monthlyRevenue = yield parcel_model_1.Parcel.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: currentMonthStart,
                    $lte: currentMonthEnd,
                },
                currentStatus: { $ne: parcel_interface_1.ParcelStatus.CANCELLED },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$pricing.totalFee" },
            },
        },
    ]);
    const revenueThisMonth = ((_a = monthlyRevenue[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
    // Calculate average delivery time
    const deliveryTimeStats = yield parcel_model_1.Parcel.aggregate([
        {
            $match: {
                currentStatus: parcel_interface_1.ParcelStatus.DELIVERED,
            },
        },
        {
            $addFields: {
                deliveryTime: {
                    $divide: [
                        { $subtract: ["$updatedAt", "$createdAt"] },
                        1000 * 60 * 60 * 24, // Convert milliseconds to days
                    ],
                },
            },
        },
        {
            $group: {
                _id: null,
                averageDeliveryDays: { $avg: "$deliveryTime" },
            },
        },
    ]);
    const avgDeliveryDays = ((_b = deliveryTimeStats[0]) === null || _b === void 0 ? void 0 : _b.averageDeliveryDays) || 0;
    const averageDeliveryTime = avgDeliveryDays > 0 ? `${avgDeliveryDays.toFixed(1)} days` : "N/A";
    return {
        totalParcels,
        deliveredParcels,
        inTransitParcels,
        pendingParcels,
        cancelledParcels,
        averageDeliveryTime,
        revenueThisMonth,
        statusBreakdown,
    };
});
// Get user notifications from parcel status updates
const getUserNotifications = (userId, userRole, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    let parcels = [];
    // Get parcels based on user role
    if (userRole === "sender") {
        // For senders, get their sent parcels
        parcels = yield parcel_model_1.Parcel.find({ sender: userId })
            .sort({ updatedAt: -1 })
            .limit(50);
    }
    else if (userRole === "receiver") {
        // For receivers, get parcels sent to their email
        parcels = yield parcel_model_1.Parcel.find({ "receiver.email": userEmail })
            .sort({ updatedAt: -1 })
            .limit(50);
    }
    else if (userRole === "admin") {
        // For admins, get recent parcels
        parcels = yield parcel_model_1.Parcel.find()
            .sort({ updatedAt: -1 })
            .limit(50);
    }
    // Transform parcels into notifications
    const notifications = parcels.map((parcel) => {
        const latestStatus = parcel.statusHistory[parcel.statusHistory.length - 1];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const previousStatus = parcel.statusHistory[parcel.statusHistory.length - 2];
        // Determine notification type based on status change
        let notificationType = "info";
        let title = `Parcel ${parcel.trackingId}`;
        let message = `Status updated to ${parcel.currentStatus}`;
        if (parcel.currentStatus === parcel_interface_1.ParcelStatus.DELIVERED) {
            notificationType = "success";
            title = "Parcel Delivered";
            message = `Your parcel ${parcel.trackingId} has been successfully delivered`;
        }
        else if (parcel.currentStatus === parcel_interface_1.ParcelStatus.CANCELLED) {
            notificationType = "error";
            title = "Parcel Cancelled";
            message = `Your parcel ${parcel.trackingId} has been cancelled`;
        }
        else if (parcel.currentStatus === parcel_interface_1.ParcelStatus.FAILED_DELIVERY) {
            notificationType = "warning";
            title = "Delivery Failed";
            message = `Delivery of parcel ${parcel.trackingId} has failed`;
        }
        else if (parcel.currentStatus === parcel_interface_1.ParcelStatus.IN_TRANSIT) {
            notificationType = "info";
            title = "Parcel In Transit";
            message = `Your parcel ${parcel.trackingId} is now in transit`;
        }
        else if (parcel.currentStatus === parcel_interface_1.ParcelStatus.OUT_FOR_DELIVERY) {
            notificationType = "info";
            title = "Out for Delivery";
            message = `Your parcel ${parcel.trackingId} is out for delivery`;
        }
        // Add location and note if available
        if (latestStatus === null || latestStatus === void 0 ? void 0 : latestStatus.location) {
            message += ` at ${latestStatus.location}`;
        }
        if (latestStatus === null || latestStatus === void 0 ? void 0 : latestStatus.note) {
            message += `. Note: ${latestStatus.note}`;
        }
        return {
            id: parcel._id.toString(),
            parcelId: parcel._id.toString(),
            trackingId: parcel.trackingId,
            type: notificationType,
            title,
            message,
            status: parcel.currentStatus,
            timestamp: (latestStatus === null || latestStatus === void 0 ? void 0 : latestStatus.timestamp) || parcel.updatedAt,
            read: false, // Default to unread
            location: latestStatus === null || latestStatus === void 0 ? void 0 : latestStatus.location,
            note: latestStatus === null || latestStatus === void 0 ? void 0 : latestStatus.note,
            updatedBy: latestStatus === null || latestStatus === void 0 ? void 0 : latestStatus.updatedBy,
        };
    });
    // Sort by timestamp (most recent first)
    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
});
exports.ParcelService = {
    createParcel,
    getParcelById,
    trackParcelByTrackingId,
    getAllParcels,
    getSenderParcels,
    getReceiverParcels,
    updateParcel,
    updateParcelStatus,
    cancelParcel,
    confirmDelivery,
    blockParcel,
    assignDeliveryPersonnel,
    deleteParcel,
    getParcelStats,
    getUserNotifications,
};
