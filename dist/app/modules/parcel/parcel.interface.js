"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelStatus = void 0;
var ParcelStatus;
(function (ParcelStatus) {
    ParcelStatus["REQUESTED"] = "requested";
    ParcelStatus["APPROVED"] = "approved";
    ParcelStatus["PICKED_UP"] = "picked_up";
    ParcelStatus["IN_TRANSIT"] = "in_transit";
    ParcelStatus["OUT_FOR_DELIVERY"] = "out_for_delivery";
    ParcelStatus["DELIVERED"] = "delivered";
    ParcelStatus["CANCELLED"] = "cancelled";
    ParcelStatus["RETURNED"] = "returned";
    ParcelStatus["FAILED_DELIVERY"] = "failed_delivery";
})(ParcelStatus || (exports.ParcelStatus = ParcelStatus = {}));
