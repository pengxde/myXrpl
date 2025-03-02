import { BaseLedgerEntry, HasOptionalPreviousTxnID } from './BaseLedgerEntry';
export declare const NEGATIVE_UNL_ID = "2E8A59AA9D3B5B186B0B9E0F62E6C02587CA74A4D778938E957B6357D364B244";
export default interface NegativeUNL extends BaseLedgerEntry, HasOptionalPreviousTxnID {
    LedgerEntryType: 'NegativeUNL';
    DisabledValidators?: Array<{
        FirstLedgerSequence: number;
        PublicKey: string;
    }>;
    ValidatorToDisable?: string;
    ValidatorToReEnable?: string;
}
//# sourceMappingURL=NegativeUNL.d.ts.map