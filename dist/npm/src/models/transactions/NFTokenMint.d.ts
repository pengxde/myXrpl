import { Account, BaseTransaction, GlobalFlags } from './common';
import type { TransactionMetadataBase } from './metadata';
export declare enum NFTokenMintFlags {
    tfBurnable = 1,
    tfOnlyXRP = 2,
    tfTrustLine = 4,
    tfTransferable = 8,
    tfMutable = 16
}
export interface NFTokenMintFlagsInterface extends GlobalFlags {
    tfBurnable?: boolean;
    tfOnlyXRP?: boolean;
    tfTrustLine?: boolean;
    tfTransferable?: boolean;
    tfMutable?: boolean;
}
export interface NFTokenMint extends BaseTransaction {
    TransactionType: 'NFTokenMint';
    NFTokenTaxon: number;
    Issuer?: Account;
    TransferFee?: number;
    URI?: string | null;
    Flags?: number | NFTokenMintFlagsInterface;
}
export interface NFTokenMintMetadata extends TransactionMetadataBase {
    nftoken_id?: string;
}
export declare function validateNFTokenMint(tx: Record<string, unknown>): void;
//# sourceMappingURL=NFTokenMint.d.ts.map