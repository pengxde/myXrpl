"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePayment = exports.PaymentFlags = void 0;
const errors_1 = require("../../errors");
const utils_1 = require("../utils");
const common_1 = require("./common");
var PaymentFlags;
(function (PaymentFlags) {
    PaymentFlags[PaymentFlags["tfNoRippleDirect"] = 65536] = "tfNoRippleDirect";
    PaymentFlags[PaymentFlags["tfPartialPayment"] = 131072] = "tfPartialPayment";
    PaymentFlags[PaymentFlags["tfLimitQuality"] = 262144] = "tfLimitQuality";
})(PaymentFlags || (exports.PaymentFlags = PaymentFlags = {}));
function validatePayment(tx) {
    (0, common_1.validateBaseTransaction)(tx);
    if (tx.Amount === undefined) {
        throw new errors_1.ValidationError('PaymentTransaction: missing field Amount');
    }
    if (!(0, common_1.isAmount)(tx.Amount)) {
        throw new errors_1.ValidationError('PaymentTransaction: invalid Amount');
    }
    (0, common_1.validateRequiredField)(tx, 'Destination', common_1.isAccount);
    (0, common_1.validateOptionalField)(tx, 'DestinationTag', common_1.isNumber);
    (0, common_1.validateCredentialsList)(tx.CredentialIDs, tx.TransactionType, true, common_1.MAX_AUTHORIZED_CREDENTIALS);
    if (tx.InvoiceID !== undefined && typeof tx.InvoiceID !== 'string') {
        throw new errors_1.ValidationError('PaymentTransaction: InvoiceID must be a string');
    }
    if (tx.Paths !== undefined &&
        !isPaths(tx.Paths)) {
        throw new errors_1.ValidationError('PaymentTransaction: invalid Paths');
    }
    if (tx.SendMax !== undefined && !(0, common_1.isAmount)(tx.SendMax)) {
        throw new errors_1.ValidationError('PaymentTransaction: invalid SendMax');
    }
    checkPartialPayment(tx);
}
exports.validatePayment = validatePayment;
function checkPartialPayment(tx) {
    var _a;
    if (tx.DeliverMin != null) {
        if (tx.Flags == null) {
            throw new errors_1.ValidationError('PaymentTransaction: tfPartialPayment flag required with DeliverMin');
        }
        const flags = tx.Flags;
        const isTfPartialPayment = typeof flags === 'number'
            ? (0, utils_1.isFlagEnabled)(flags, PaymentFlags.tfPartialPayment)
            : (_a = flags.tfPartialPayment) !== null && _a !== void 0 ? _a : false;
        if (!isTfPartialPayment) {
            throw new errors_1.ValidationError('PaymentTransaction: tfPartialPayment flag required with DeliverMin');
        }
        if (!(0, common_1.isAmount)(tx.DeliverMin)) {
            throw new errors_1.ValidationError('PaymentTransaction: invalid DeliverMin');
        }
    }
}
function isPathStep(pathStep) {
    if (pathStep.account !== undefined && typeof pathStep.account !== 'string') {
        return false;
    }
    if (pathStep.currency !== undefined &&
        typeof pathStep.currency !== 'string') {
        return false;
    }
    if (pathStep.issuer !== undefined && typeof pathStep.issuer !== 'string') {
        return false;
    }
    if (pathStep.account !== undefined &&
        pathStep.currency === undefined &&
        pathStep.issuer === undefined) {
        return true;
    }
    if (pathStep.currency !== undefined || pathStep.issuer !== undefined) {
        return true;
    }
    return false;
}
function isPath(path) {
    for (const pathStep of path) {
        if (!isPathStep(pathStep)) {
            return false;
        }
    }
    return true;
}
function isPaths(paths) {
    if (!Array.isArray(paths) || paths.length === 0) {
        return false;
    }
    for (const path of paths) {
        if (!Array.isArray(path) || path.length === 0) {
            return false;
        }
        if (!isPath(path)) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=payment.js.map