import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { SorobanService } from './soroban.service';

describe('SorobanService', () => {
  let service: SorobanService;
  let httpService: { post: jest.Mock };

  beforeEach(async () => {
    httpService = { post: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SorobanService,
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = module.get<SorobanService>(SorobanService);
  });

  it('submits an XDR and returns the RPC hash and status', async () => {
    httpService.post.mockReturnValue(
      of({ data: { result: { hash: 'abc123', status: 'PENDING' } } }),
    );

    await expect(service.submitTransaction('https://rpc.test', 'signed-xdr')).resolves.toEqual({
      hash: 'abc123',
      status: 'PENDING',
    });
    expect(httpService.post).toHaveBeenCalledWith(
      'https://rpc.test',
      expect.objectContaining({ method: 'sendTransaction' }),
      expect.any(Object),
    );
  });

  it('polls through NOT_FOUND and returns the confirmed transaction', async () => {
    httpService.post
      .mockReturnValueOnce(of({ data: { result: { status: 'NOT_FOUND' } } }))
      .mockReturnValueOnce(
        of({
          data: {
            result: { status: 'SUCCESS', resultXdr: 'result-xdr' },
          },
        }),
      );

    await expect(
      service.getTransactionStatus('https://rpc.test', 'abc123', 2, 0),
    ).resolves.toEqual({ status: 'SUCCESS', resultXdr: 'result-xdr' });
    expect(httpService.post).toHaveBeenCalledTimes(2);
  });

  it('surfaces Soroban RPC errors', async () => {
    httpService.post.mockReturnValue(
      of({ data: { error: { code: -32600, message: 'invalid request' } } }),
    );

    await expect(service.callRPC('https://rpc.test', 'simulateTransaction', {})).rejects.toThrow(
      'Soroban RPC error [simulateTransaction]',
    );
  });
});
