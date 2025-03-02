"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOracleSet = void 0;
const errors_1 = require("../../errors");
const common_1 = require("./common");
const PRICE_DATA_SERIES_MAX_LENGTH = 10;
const SCALE_MAX = 10;
function validateOracleSet(tx) {
    (0, common_1.validateBaseTransaction)(tx);
    (0, common_1.validateRequiredField)(tx, 'OracleDocumentID', common_1.isNumber);
    (0, common_1.validateRequiredField)(tx, 'LastUpdateTime', common_1.isNumber);
    (0, common_1.validateOptionalField)(tx, 'Provider', common_1.isString);
    (0, common_1.validateOptionalField)(tx, 'URI', common_1.isString);
    (0, common_1.validateOptionalField)(tx, 'AssetClass', common_1.isString);
    (0, common_1.validateRequiredField)(tx, 'PriceDataSeries', (value) => {
        if (!Array.isArray(value)) {
            throw new errors_1.ValidationError('OracleSet: PriceDataSeries must be an array');
        }
        if (value.length > PRICE_DATA_SERIES_MAX_LENGTH) {
            throw new errors_1.ValidationError(`OracleSet: PriceDataSeries must have at most ${PRICE_DATA_SERIES_MAX_LENGTH} PriceData objects`);
        }
        for (const priceData of value) {
            if (typeof priceData !== 'object') {
                throw new errors_1.ValidationError('OracleSet: PriceDataSeries must be an array of objects');
            }
            if (priceData.PriceData == null) {
                throw new errors_1.ValidationError('OracleSet: PriceDataSeries must have a `PriceData` object');
            }
            if (Object.keys(priceData).length !== 1) {
                throw new errors_1.ValidationError('OracleSet: PriceDataSeries must only have a single PriceData object');
            }
            if (typeof priceData.PriceData.BaseAsset !== 'string') {
                throw new errors_1.ValidationError('OracleSet: PriceDataSeries must have a `BaseAsset` string');
            }
            if (typeof priceData.PriceData.QuoteAsset !== 'string') {
                throw new errors_1.ValidationError('OracleSet: PriceDataSeries must have a `QuoteAsset` string');
            }
            if ((priceData.PriceData.AssetPrice == null) !==
                (priceData.PriceData.Scale == null)) {
                throw new errors_1.ValidationError('OracleSet: PriceDataSeries must have both `AssetPrice` and `Scale` if any are present');
            }
            if ('AssetPrice' in priceData.PriceData &&
                !(0, common_1.isNumber)(priceData.PriceData.AssetPrice)) {
                throw new errors_1.ValidationError('OracleSet: invalid field AssetPrice');
            }
            if ('Scale' in priceData.PriceData &&
                !(0, common_1.isNumber)(priceData.PriceData.Scale)) {
                throw new errors_1.ValidationError('OracleSet: invalid field Scale');
            }
            if (priceData.PriceData.Scale < 0 ||
                priceData.PriceData.Scale > SCALE_MAX) {
                throw new errors_1.ValidationError(`OracleSet: Scale must be in range 0-${SCALE_MAX}`);
            }
        }
        return true;
    });
}
exports.validateOracleSet = validateOracleSet;
//# sourceMappingURL=oracleSet.js.map