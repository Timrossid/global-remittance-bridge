import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SorobanService {
  constructor(private readonly httpService: HttpService) {}

  async submitTransaction(rpcUrl: string, transactionXdr: string) {
    const response = await firstValueFrom(
      this.httpService.post(rpcUrl, {
        method: 'submit_transaction',
        params: {
          xdr: transactionXdr,
        },
      }),
    );
    return response.data;
  }

  async callRPC(rpcUrl: string, method: string, params: any) {
    const response = await firstValueFrom(
      this.httpService.post(rpcUrl, {
        method,
        params,
      }),
    );
    return response.data;
  }
}
