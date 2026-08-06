import { IAnchorAdapter, AnchorQuote, AnchorKycStatus } from '../shared/types';
export declare class CircleAdapter implements IAnchorAdapter {
    private readonly apiBase;
    getQuote(fromAsset: string, toAsset: string, amount: number): Promise<AnchorQuote>;
    initiateDeposit(userId: string, amount: number, asset: string): Promise<{
        depositUrl: string;
    }>;
    initiateWithdrawal(userId: string, amount: number, asset: string, destination: string): Promise<{
        txId: string;
    }>;
    checkKycStatus(userId: string): Promise<AnchorKycStatus>;
    handleWebhook(payload: any): Promise<{
        status: string;
    }>;
}
