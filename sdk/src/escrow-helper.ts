export interface EscrowInput {
  sender: string;
  receiver: string;
  token: string;
  amountStroops: string;
}

export class EscrowHelper {
  constructor(private readonly contractId: string, private readonly rpcUrl: string) {}

  buildCreateEscrowTx(input: EscrowInput): Record<string, unknown> {
    return {
      contractId: this.contractId,
      sender: input.sender,
      receiver: input.receiver,
      token: input.token,
      amountStroops: input.amountStroops,
      rpcUrl: this.rpcUrl,
    };
  }
}
