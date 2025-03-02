import { APIVersion, DEFAULT_API_VERSION, RIPPLED_API_V1 } from '../common';
import { AccountRoot, SignerList } from '../ledger';
import { BaseRequest, BaseResponse, LookupByLedgerRequest } from './baseMethod';
export interface AccountInfoRequest extends BaseRequest, LookupByLedgerRequest {
    command: 'account_info';
    account: string;
    queue?: boolean;
    signer_lists?: boolean;
    strict?: boolean;
}
export interface AccountQueueTransaction {
    auth_change: boolean;
    fee: string;
    fee_level: string;
    max_spend_drops: string;
    seq: number;
}
export interface AccountQueueData {
    txn_count: number;
    auth_change_queued?: boolean;
    lowest_sequence?: number;
    highest_sequence?: number;
    max_spend_drops_total?: string;
    transactions?: AccountQueueTransaction[];
}
export interface AccountInfoAccountFlags {
    defaultRipple: boolean;
    depositAuth: boolean;
    disableMasterKey: boolean;
    disallowIncomingCheck?: boolean;
    disallowIncomingNFTokenOffer?: boolean;
    disallowIncomingPayChan?: boolean;
    disallowIncomingTrustline?: boolean;
    disallowIncomingXRP: boolean;
    globalFreeze: boolean;
    noFreeze: boolean;
    passwordSpent: boolean;
    requireAuthorization: boolean;
    requireDestinationTag: boolean;
    allowTrustLineClawback: boolean;
}
interface BaseAccountInfoResponse extends BaseResponse {
    result: {
        account_data: AccountRoot;
        account_flags?: AccountInfoAccountFlags;
        ledger_current_index?: number;
        ledger_index?: number;
        queue_data?: AccountQueueData;
        validated?: boolean;
    };
}
export interface AccountInfoResponse extends BaseAccountInfoResponse {
    result: BaseAccountInfoResponse['result'] & {
        signer_lists?: SignerList[];
    };
}
export interface AccountInfoV1Response extends BaseAccountInfoResponse {
    result: BaseAccountInfoResponse['result'] & {
        account_data: BaseAccountInfoResponse['result']['account_data'] & {
            signer_lists?: SignerList[];
        };
    };
}
export type AccountInfoVersionResponseMap<Version extends APIVersion = typeof DEFAULT_API_VERSION> = Version extends typeof RIPPLED_API_V1 ? AccountInfoV1Response : AccountInfoResponse;
export {};
//# sourceMappingURL=accountInfo.d.ts.map