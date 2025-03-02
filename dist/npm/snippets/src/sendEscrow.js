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
void sendEscrow();
function sendEscrow() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.connect();
        const { wallet: wallet1 } = yield client.fundWallet(null, {
            usageContext: 'code snippets',
        });
        const { wallet: wallet2 } = yield client.fundWallet(null, {
            usageContext: 'code snippets',
        });
        console.log('Balances of wallets before Escrow tx was created:');
        console.log(yield client.getXrpBalance(wallet1.classicAddress), yield client.getXrpBalance(wallet2.classicAddress));
        const finishAfter = (0, src_1.isoTimeToRippleTime)(Date()) + 2;
        const createTx = {
            TransactionType: 'EscrowCreate',
            Account: wallet1.address,
            Destination: wallet2.address,
            Amount: '1000000',
            FinishAfter: finishAfter,
        };
        const createEscrowResponse = yield client.submitAndWait(createTx, {
            wallet: wallet1,
        });
        console.log(createEscrowResponse);
        const accountObjectsRequest = {
            command: 'account_objects',
            account: wallet1.classicAddress,
        };
        const accountObjects = (yield client.request(accountObjectsRequest)).result
            .account_objects;
        console.log("Escrow object exists in `wallet1`'s account");
        console.log(accountObjects);
        const finishTx = {
            TransactionType: 'EscrowFinish',
            Account: wallet1.classicAddress,
            Owner: wallet1.classicAddress,
            OfferSequence: Number(createEscrowResponse.result.tx_json.Sequence),
        };
        yield client.submit(finishTx, {
            wallet: wallet1,
        });
        console.log('Balances of wallets after Escrow was sent');
        console.log(yield client.getXrpBalance(wallet1.classicAddress), yield client.getXrpBalance(wallet2.classicAddress));
        yield client.disconnect();
    });
}
//# sourceMappingURL=sendEscrow.js.map