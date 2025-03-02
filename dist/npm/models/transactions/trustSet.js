"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTrustSet = exports.TrustSetFlags = void 0;
const errors_1 = require("../../errors");
const common_1 = require("./common");
var TrustSetFlags;
(function (TrustSetFlags) {
    TrustSetFlags[TrustSetFlags["tfSetfAuth"] = 65536] = "tfSetfAuth";
    TrustSetFlags[TrustSetFlags["tfSetNoRipple"] = 131072] = "tfSetNoRipple";
    TrustSetFlags[TrustSetFlags["tfClearNoRipple"] = 262144] = "tfClearNoRipple";
    TrustSetFlags[TrustSetFlags["tfSetFreeze"] = 1048576] = "tfSetFreeze";
    TrustSetFlags[TrustSetFlags["tfClearFreeze"] = 2097152] = "tfClearFreeze";
    TrustSetFlags[TrustSetFlags["tfSetDeepFreeze"] = 4194304] = "tfSetDeepFreeze";
    TrustSetFlags[TrustSetFlags["tfClearDeepFreeze"] = 8388608] = "tfClearDeepFreeze";
})(TrustSetFlags || (exports.TrustSetFlags = TrustSetFlags = {}));
function validateTrustSet(tx) {
    (0, common_1.validateBaseTransaction)(tx);
    const { LimitAmount, QualityIn, QualityOut } = tx;
    if (LimitAmount === undefined) {
        throw new errors_1.ValidationError('TrustSet: missing field LimitAmount');
    }
    if (!(0, common_1.isAmount)(LimitAmount)) {
        throw new errors_1.ValidationError('TrustSet: invalid LimitAmount');
    }
    if (QualityIn !== undefined && typeof QualityIn !== 'number') {
        throw new errors_1.ValidationError('TrustSet: QualityIn must be a number');
    }
    if (QualityOut !== undefined && typeof QualityOut !== 'number') {
        throw new errors_1.ValidationError('TrustSet: QualityOut must be a number');
    }
}
exports.validateTrustSet = validateTrustSet;
//# sourceMappingURL=trustSet.js.map