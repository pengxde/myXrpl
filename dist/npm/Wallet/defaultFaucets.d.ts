import type { Client } from '../client';
export interface FaucetWallet {
    account: {
        xAddress: string;
        classicAddress?: string;
        secret: string;
    };
    amount: number;
    balance: number;
}
export declare enum FaucetNetwork {
    Testnet = "faucet.altnet.rippletest.net",
    Devnet = "faucet.devnet.rippletest.net"
}
export declare const FaucetNetworkPaths: Record<string, string>;
export declare function getFaucetHost(client: Client): FaucetNetwork | undefined;
export declare function getDefaultFaucetPath(hostname: string | undefined): string;
//# sourceMappingURL=defaultFaucets.d.ts.map