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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const validateRequest = (zodSchema) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body && req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        const validationData = {
            body: req.body,
            params: req.params,
            query: req.query,
        };
        const validated = (yield zodSchema.parseAsync(validationData));
        // Update request object with validated data
        if (validated.body)
            req.body = validated.body;
        if (validated.params)
            req.params = validated.params;
        if (validated.query) {
            // Cannot directly reassign req.query as it's read-only
            // Instead, merge the validated properties into the existing query object
            Object.assign(req.query, validated.query);
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.validateRequest = validateRequest;
