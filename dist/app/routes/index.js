"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const parcel_route_1 = require("../modules/parcel/parcel.route");
const user_route_1 = require("../modules/user/user.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes,
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/parcel",
        route: parcel_route_1.ParcelRoutes,
    },
];
router.get("/health", (req, res) => {
    res.status(200).json({
        message: "Server is running",
    });
});
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
