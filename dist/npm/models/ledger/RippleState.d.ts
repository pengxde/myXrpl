import { IssuedCurrencyAmount } from '../common';
import { BaseLedgerEntry, HasPreviousTxnID } from './BaseLedgerEntry';
export default interface RippleState extends BaseLedgerEntry, HasPreviousTxnID {
    LedgerEntryType: 'RippleState';
    Flags: number;
    Balance: IssuedCurrencyAmount;
    LowLimit: IssuedCurrencyAmount;
    HighLimit: IssuedCurrencyAmount;
    LowNode?: string;
    HighNode?: string;
    LowQualityIn?: number;
    LowQualityOut?: number;
    HighQualityIn?: number;
    HighQualityOut?: number;
}
export declare enum RippleStateFlags {
    lsfLowReserve = 65536,
    lsfHighReserve = 131072,
    lsfLowAuth = 262144,
    lsfHighAuth = 524288,
    lsfLowNoRipple = 1048576,
    lsfHighNoRipple = 2097152,
    lsfLowFreeze = 4194304,
    lsfHighFreeze = 8388608,
    lsfAMMNode = 16777216,
    lsfLowDeepFreeze = 33554432,
    lsfHighDeepFreeze = 67108864
}
//# sourceMappingURL=RippleState.d.ts.map