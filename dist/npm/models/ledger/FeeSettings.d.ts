import { BaseLedgerEntry, HasOptionalPreviousTxnID } from './BaseLedgerEntry';
export declare const FEE_SETTINGS_ID = "4BC50C9B0D8515D3EAAE1E74B29A95804346C491EE1A95BF25E4AAB854A6A651";
export interface FeeSettingsPreAmendmentFields {
    BaseFee: string;
    ReferenceFeeUnits: number;
    ReserveBase: number;
    ReserveIncrement: number;
}
export interface FeeSettingsPostAmendmentFields {
    BaseFeeDrops: string;
    ReserveBaseDrops: string;
    ReserveIncrementDrops: string;
}
export interface FeeSettingsBase extends BaseLedgerEntry, HasOptionalPreviousTxnID {
    LedgerEntryType: 'FeeSettings';
    Flags: 0;
}
type FeeSettings = FeeSettingsBase & (FeeSettingsPreAmendmentFields | FeeSettingsPostAmendmentFields);
export default FeeSettings;
//# sourceMappingURL=FeeSettings.d.ts.map