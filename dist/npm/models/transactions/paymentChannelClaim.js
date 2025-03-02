"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaymentChannelClaim = exports.PaymentChannelClaimFlags = void 0;
const errors_1 = require("../../errors");
const common_1 = require("./common");
var PaymentChannelClaimFlags;
(function (PaymentChannelClaimFlags) {
    PaymentChannelClaimFlags[PaymentChannelClaimFlags["tfRenew"] = 65536] = "tfRenew";
    PaymentChannelClaimFlags[PaymentChannelClaimFlags["tfClose"] = 131072] = "tfClose";
})(PaymentChannelClaimFlags || (exports.PaymentChannelClaimFlags = PaymentChannelClaimFlags = {}));
function validatePaymentChannelClaim(tx) {
    (0, common_1.validateBaseTransaction)(tx);
    (0, common_1.validateCredentialsList)(tx.CredentialIDs, tx.TransactionType, true, common_1.MAX_AUTHORIZED_CREDENTIALS);
    if (tx.Channel === undefined) {
        throw new errors_1.ValidationError('PaymentChannelClaim: missing Channel');
    }
    if (typeof tx.Channel !== 'string') {
        throw new errors_1.ValidationError('PaymentChannelClaim: Channel must be a string');
    }
    if (tx.Balance !== undefined && typeof tx.Balance !== 'string') {
        throw new errors_1.ValidationError('PaymentChannelClaim: Balance must be a string');
    }
    if (tx.Amount !== undefined && typeof tx.Amount !== 'string') {
        throw new errors_1.ValidationError('PaymentChannelClaim: Amount must be a string');
    }
    if (tx.Signature !== undefined && typeof tx.Signature !== 'string') {
        throw new errors_1.ValidationError('PaymentChannelClaim: Signature must be a string');
    }
    if (tx.PublicKey !== undefined && typeof tx.PublicKey !== 'string') {
        throw new errors_1.ValidationError('PaymentChannelClaim: PublicKey must be a string');
    }
}
exports.validatePaymentChannelClaim = validatePaymentChannelClaim;
//# sourceMappingURL=paymentChannelClaim.js.map