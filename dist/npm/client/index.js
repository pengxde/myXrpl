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
exports.Client = void 0;
const eventemitter3_1 = require("eventemitter3");
const errors_1 = require("../errors");
const common_1 = require("../models/common");
const flags_1 = require("../models/utils/flags");
const sugar_1 = require("../sugar");
const autofill_1 = require("../sugar/autofill");
const balances_1 = require("../sugar/balances");
const getOrderbook_1 = require("../sugar/getOrderbook");
const utils_1 = require("../utils");
const Wallet_1 = require("../Wallet");
const fundWallet_1 = require("../Wallet/fundWallet");
const connection_1 = require("./connection");
const partialPayment_1 = require("./partialPayment");
function getCollectKeyFromCommand(command) {
    switch (command) {
        case 'account_channels':
            return 'channels';
        case 'account_lines':
            return 'lines';
        case 'account_objects':
            return 'account_objects';
        case 'account_tx':
            return 'transactions';
        case 'account_offers':
        case 'book_offers':
            return 'offers';
        case 'ledger_data':
            return 'state';
        default:
            return null;
    }
}
function clamp(value, min, max) {
    if (min > max) {
        throw new Error('Illegal clamp bounds');
    }
    return Math.min(Math.max(value, min), max);
}
const DEFAULT_FEE_CUSHION = 1.2;
const DEFAULT_MAX_FEE_XRP = '2';
const MIN_LIMIT = 10;
const MAX_LIMIT = 400;
const NORMAL_DISCONNECT_CODE = 1000;
class Client extends eventemitter3_1.EventEmitter {
    constructor(server, options = {}) {
        var _a, _b;
        super();
        this.apiVersion = common_1.DEFAULT_API_VERSION;
        if (typeof server !== 'string' || !/wss?(?:\+unix)?:\/\//u.exec(server)) {
            throw new errors_1.ValidationError('server URI must start with `wss://`, `ws://`, `wss+unix://`, or `ws+unix://`.');
        }
        this.feeCushion = (_a = options.feeCushion) !== null && _a !== void 0 ? _a : DEFAULT_FEE_CUSHION;
        this.maxFeeXRP = (_b = options.maxFeeXRP) !== null && _b !== void 0 ? _b : DEFAULT_MAX_FEE_XRP;
        this.connection = new connection_1.Connection(server, options);
        this.connection.on('error', (errorCode, errorMessage, data) => {
            this.emit('error', errorCode, errorMessage, data);
        });
        this.connection.on('reconnect', () => {
            this.connection.on('connected', () => this.emit('connected'));
        });
        this.connection.on('disconnected', (code) => {
            let finalCode = code;
            if (finalCode === connection_1.INTENTIONAL_DISCONNECT_CODE) {
                finalCode = NORMAL_DISCONNECT_CODE;
            }
            this.emit('disconnected', finalCode);
        });
        this.connection.on('ledgerClosed', (ledger) => {
            this.emit('ledgerClosed', ledger);
        });
        this.connection.on('transaction', (tx) => {
            (0, partialPayment_1.handleStreamPartialPayment)(tx, this.connection.trace);
            this.emit('transaction', tx);
        });
        this.connection.on('validationReceived', (validation) => {
            this.emit('validationReceived', validation);
        });
        this.connection.on('manifestReceived', (manifest) => {
            this.emit('manifestReceived', manifest);
        });
        this.connection.on('peerStatusChange', (status) => {
            this.emit('peerStatusChange', status);
        });
        this.connection.on('consensusPhase', (consensus) => {
            this.emit('consensusPhase', consensus);
        });
        this.connection.on('path_find', (path) => {
            this.emit('path_find', path);
        });
    }
    get url() {
        return this.connection.getUrl();
    }
    request(req) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const request = Object.assign(Object.assign({}, req), { account: typeof req.account === 'string'
                    ? (0, sugar_1.ensureClassicAddress)(req.account)
                    : undefined, api_version: (_a = req.api_version) !== null && _a !== void 0 ? _a : this.apiVersion });
            const response = yield this.connection.request(request);
            (0, partialPayment_1.handlePartialPayment)(req.command, response);
            return response;
        });
    }
    requestNextPage(req, resp) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resp.result.marker) {
                return Promise.reject(new errors_1.NotFoundError('response does not have a next page'));
            }
            const nextPageRequest = Object.assign(Object.assign({}, req), { marker: resp.result.marker });
            return this.request(nextPageRequest);
        });
    }
    on(eventName, listener) {
        return super.on(eventName, listener);
    }
    requestAll(request, collect) {
        return __awaiter(this, void 0, void 0, function* () {
            const collectKey = collect !== null && collect !== void 0 ? collect : getCollectKeyFromCommand(request.command);
            if (!collectKey) {
                throw new errors_1.ValidationError(`no collect key for command ${request.command}`);
            }
            const countTo = request.limit == null ? Infinity : request.limit;
            let count = 0;
            let marker = request.marker;
            const results = [];
            do {
                const countRemaining = clamp(countTo - count, MIN_LIMIT, MAX_LIMIT);
                const repeatProps = Object.assign(Object.assign({}, request), { limit: countRemaining, marker });
                const singleResponse = yield this.connection.request(repeatProps);
                const singleResult = singleResponse.result;
                if (!(collectKey in singleResult)) {
                    throw new errors_1.XrplError(`${collectKey} not in result`);
                }
                const collectedData = singleResult[collectKey];
                marker = singleResult.marker;
                results.push(singleResponse);
                if (Array.isArray(collectedData)) {
                    count += collectedData.length;
                }
            } while (Boolean(marker) && count < countTo);
            return results;
        });
    }
    getServerInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.request({
                    command: 'server_info',
                });
                this.networkID = (_a = response.result.info.network_id) !== null && _a !== void 0 ? _a : undefined;
                this.buildVersion = response.result.info.build_version;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.connection.connect().then(() => __awaiter(this, void 0, void 0, function* () {
                yield this.getServerInfo();
                this.emit('connected');
            }));
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.disconnect();
        });
    }
    isConnected() {
        return this.connection.isConnected();
    }
    autofill(transaction, signersCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = Object.assign({}, transaction);
            (0, autofill_1.setValidAddresses)(tx);
            tx.Flags = (0, flags_1.convertTxFlagsToNumber)(tx);
            const promises = [];
            if (tx.NetworkID == null) {
                tx.NetworkID = (0, autofill_1.txNeedsNetworkID)(this) ? this.networkID : undefined;
            }
            if (tx.Sequence == null) {
                promises.push((0, autofill_1.setNextValidSequenceNumber)(this, tx));
            }
            if (tx.Fee == null) {
                promises.push((0, autofill_1.calculateFeePerTransactionType)(this, tx, signersCount));
            }
            if (tx.LastLedgerSequence == null) {
                promises.push((0, autofill_1.setLatestValidatedLedgerSequence)(this, tx));
            }
            if (tx.TransactionType === 'AccountDelete') {
                promises.push((0, autofill_1.checkAccountDeleteBlockers)(this, tx));
            }
            if (tx.TransactionType === 'Payment' && tx.DeliverMax != null) {
                if (tx.Amount == null) {
                    tx.Amount = tx.DeliverMax;
                }
                if (tx.Amount != null && tx.Amount !== tx.DeliverMax) {
                    return Promise.reject(new errors_1.ValidationError('PaymentTransaction: Amount and DeliverMax fields must be identical when both are provided'));
                }
                delete tx.DeliverMax;
            }
            return Promise.all(promises).then(() => tx);
        });
    }
    submit(transaction, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const signedTx = yield (0, sugar_1.getSignedTx)(this, transaction, opts);
            return (0, sugar_1.submitRequest)(this, signedTx, opts === null || opts === void 0 ? void 0 : opts.failHard);
        });
    }
    simulate(transaction, opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const binary = (_a = opts === null || opts === void 0 ? void 0 : opts.binary) !== null && _a !== void 0 ? _a : false;
            const request = typeof transaction === 'string'
                ? { command: 'simulate', tx_blob: transaction, binary }
                : { command: 'simulate', tx_json: transaction, binary };
            return this.request(request);
        });
    }
    submitAndWait(transaction, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const signedTx = yield (0, sugar_1.getSignedTx)(this, transaction, opts);
            const lastLedger = (0, sugar_1.getLastLedgerSequence)(signedTx);
            if (lastLedger == null) {
                throw new errors_1.ValidationError('Transaction must contain a LastLedgerSequence value for reliable submission.');
            }
            const response = yield (0, sugar_1.submitRequest)(this, signedTx, opts === null || opts === void 0 ? void 0 : opts.failHard);
            const txHash = utils_1.hashes.hashSignedTx(signedTx);
            return (0, sugar_1.waitForFinalTransactionOutcome)(this, txHash, lastLedger, response.result.engine_result);
        });
    }
    prepareTransaction(transaction, signersCount) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.autofill(transaction, signersCount);
        });
    }
    getXrpBalance(address, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const xrpRequest = {
                command: 'account_info',
                account: address,
                ledger_index: (_a = options.ledger_index) !== null && _a !== void 0 ? _a : 'validated',
                ledger_hash: options.ledger_hash,
            };
            const response = yield this.request(xrpRequest);
            return (0, utils_1.dropsToXrp)(response.result.account_data.Balance);
        });
    }
    getBalances(address, options = {}) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const balances = [];
            let xrpPromise = Promise.resolve(0);
            if (!options.peer) {
                xrpPromise = this.getXrpBalance(address, {
                    ledger_hash: options.ledger_hash,
                    ledger_index: options.ledger_index,
                });
            }
            const linesRequest = {
                command: 'account_lines',
                account: address,
                ledger_index: (_a = options.ledger_index) !== null && _a !== void 0 ? _a : 'validated',
                ledger_hash: options.ledger_hash,
                peer: options.peer,
                limit: options.limit,
            };
            const linesPromise = this.requestAll(linesRequest);
            yield Promise.all([xrpPromise, linesPromise]).then(([xrpBalance, linesResponses]) => {
                const accountLinesBalance = linesResponses.flatMap((response) => (0, balances_1.formatBalances)(response.result.lines));
                if (xrpBalance !== 0) {
                    balances.push({ currency: 'XRP', value: xrpBalance.toString() });
                }
                balances.push(...accountLinesBalance);
            });
            return balances.slice(0, options.limit);
        });
    }
    getOrderbook(currency1, currency2, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, getOrderbook_1.validateOrderbookOptions)(options);
            const request = (0, getOrderbook_1.createBookOffersRequest)(currency1, currency2, options);
            const directOfferResults = yield (0, getOrderbook_1.requestAllOffers)(this, request);
            const reverseOfferResults = yield (0, getOrderbook_1.requestAllOffers)(this, (0, getOrderbook_1.reverseRequest)(request));
            const directOffers = (0, getOrderbook_1.extractOffers)(directOfferResults);
            const reverseOffers = (0, getOrderbook_1.extractOffers)(reverseOfferResults);
            const orders = (0, getOrderbook_1.combineOrders)(directOffers, reverseOffers);
            const { buy, sell } = (0, getOrderbook_1.separateBuySellOrders)(orders);
            return {
                buy: (0, getOrderbook_1.sortAndLimitOffers)(buy, options.limit),
                sell: (0, getOrderbook_1.sortAndLimitOffers)(sell, options.limit),
            };
        });
    }
    getLedgerIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            const ledgerResponse = yield this.request({
                command: 'ledger',
                ledger_index: 'validated',
            });
            return ledgerResponse.result.ledger_index;
        });
    }
    fundWallet(wallet, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected()) {
                throw new errors_1.RippledError('Client not connected, cannot call faucet');
            }
            const existingWallet = Boolean(wallet);
            const walletToFund = wallet && (0, utils_1.isValidClassicAddress)(wallet.classicAddress)
                ? wallet
                : Wallet_1.Wallet.generate();
            const postBody = {
                destination: walletToFund.classicAddress,
                xrpAmount: options.amount,
                usageContext: options.usageContext,
                userAgent: 'xrpl.js',
            };
            let startingBalance = 0;
            if (existingWallet) {
                try {
                    startingBalance = Number(yield this.getXrpBalance(walletToFund.classicAddress));
                }
                catch (_a) {
                }
            }
            return (0, fundWallet_1.requestFunding)(options, this, startingBalance, walletToFund, postBody);
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=index.js.map