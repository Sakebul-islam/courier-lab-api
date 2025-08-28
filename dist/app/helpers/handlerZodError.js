"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlerZodError = void 0;
const handlerZodError = (err) => {
    const errorSources = [];
    err.issues.forEach((issue) => {
        var _a;
        errorSources.push({
            path: (_a = issue.path[issue.path.length - 1]) === null || _a === void 0 ? void 0 : _a.toString(),
            message: issue.message,
        });
    });
    return {
        statusCode: 400,
        message: "Zod Error",
        errorSources,
    };
};
exports.handlerZodError = handlerZodError;
