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
const src_1 = require("../../src");
const client = new src_1.Client('wss://s.altnet.rippletest.net:51233');
function createTxWithPaths() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        const { wallet } = yield client.fundWallet(null, {
            usageContext: 'code snippets',
        });
        const destination_account = 'rJPeZVPty1bXXbDR9oKscg2irqABr7sP3t';
        const destination_amount = {
            value: '0.001',
            currency: 'TST',
            issuer: 'rP9jPyP5kyvFRb6ZiRghAGw5u8SGAmU4bd',
        };
        const resp = yield client.request({
            command: 'path_find',
            subcommand: 'create',
            source_account: wallet.classicAddress,
            destination_account,
            destination_amount,
        });
        console.log(resp);
        const paths = resp.result.alternatives[0].paths_computed;
        console.log(paths);
        const tx = {
            TransactionType: 'Payment',
            Account: wallet.classicAddress,
            Amount: destination_amount,
            Destination: destination_account,
            Paths: paths,
        };
        yield client.autofill(tx);
        const signed = wallet.sign(tx);
        console.log('signed:', signed);
        yield client.disconnect();
    });
}
void createTxWithPaths();
//# sourceMappingURL=paths.js.map