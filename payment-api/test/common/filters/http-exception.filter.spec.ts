import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { HttpException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ArgumentsHost, UnauthorizedException } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  const mockResponse = { status: (code: number) => ({ json: (body: any) => body }) } as any;
  const mockRequest = { url: '/test', method: 'GET' } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({ providers: [HttpExceptionFilter] }).compile();
    filter = module.get(HttpExceptionFilter);
  });

  it('formats HttpException with status code and message', () => {
    const host = { switchToHttp: () => ({ getResponse: () => mockResponse, getRequest: () => mockRequest }) } as ArgumentsHost;
    const result = (filter as any).catch(new NotFoundException('Not found'), host);
    expect(result).toEqual(expect.objectContaining({ statusCode: 404, message: 'Not found' }));
  });

  it('formats non-HTTP exceptions as 500', () => {
    const host = { switchToHttp: () => ({ getResponse: () => mockResponse, getRequest: () => mockRequest }) } as ArgumentsHost;
    const result = (filter as any).catch(new Error('raw error'), host);
    expect(result.statusCode).toBe(500);
  });
});
