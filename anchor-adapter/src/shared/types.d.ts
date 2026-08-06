export interface AnchorQuote {
    quoteId: string;
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
    toAmount: number;
    fee: number;
    expiresAt: Date;
}
export interface AnchorKycStatus {
    isVerified: boolean;
    level: 'BASIC' | 'FULL' | 'NONE';
    expiryDate?: Date;
}
export interface IAnchorAdapter {
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
