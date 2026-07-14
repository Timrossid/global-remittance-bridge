import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

/**
 * SorobanService provides a thin wrapper around the Stellar Soroban JSON-RPC API.
 * See: https://developers.stellar.org/docs/data/rpc/api-reference
 */
@Injectable()
export class SorobanService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Submits a base64-encoded XDR transaction envelope to the Soroban RPC.
   * Uses the correct method name `sendTransaction`.
   */
  async submitTransaction(rpcUrl: string, transactionXdr: string): Promise<{ hash: string; status: string }> {
    const response = await firstValueFrom(
      this.httpService.post(
        rpcUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'sendTransaction',
          params: {
            transaction: transactionXdr,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );

    const data = response.data;
    if (data.error) {
      throw new Error(`Soroban RPC error: ${JSON.stringify(data.error)}`);
    }

    return {
      hash: data.result?.hash ?? '',
      status: data.result?.status ?? 'UNKNOWN',
    };
  }

  /**
   * Polls transaction status by hash until it is CONFIRMED, FAILED, or timeout.
   */
  async getTransactionStatus(
    rpcUrl: string,
    hash: string,
    maxAttempts = 10,
    intervalMs = 2000,
  ): Promise<{ status: string; resultXdr?: string }> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await firstValueFrom(
        this.httpService.post(
          rpcUrl,
          {
            jsonrpc: '2.0',
            id: 1,
            method: 'getTransaction',
            params: { hash },
          },
          { headers: { 'Content-Type': 'application/json' } },
        ),
      );

      const result = response.data?.result;
      if (result && result.status !== 'NOT_FOUND') {
        return { status: result.status, resultXdr: result.resultXdr };
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return { status: 'TIMEOUT' };
  }

  /**
   * Generic JSON-RPC call to Soroban (e.g. simulateTransaction, getLedgerEntries).
   */
  async callRPC(rpcUrl: string, method: string, params: Record<string, unknown>): Promise<unknown> {
    const response = await firstValueFrom(
      this.httpService.post(
        rpcUrl,
        {
          jsonrpc: '2.0',
          id: 1,
          method,
          params,
        },
        { headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const data = response.data;
    if (data.error) {
      throw new Error(`Soroban RPC error [${method}]: ${JSON.stringify(data.error)}`);
    }

    return data.result;
  }
}
