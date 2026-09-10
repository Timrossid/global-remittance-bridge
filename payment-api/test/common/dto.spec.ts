import { IsString, IsNotEmpty, IsUUID, IsNumber, Min, IsOptional } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePaymentDto, CreateEscrowPaymentDto } from '../../src/common/dto';

describe('DTOs', () => {
  it('CreatePaymentDto accepts valid input', async () => {
    const dto = plainToClass(CreatePaymentDto, { amount: 100, currency: 'USDC', merchantId: 'uuid', customerId: 'uuid' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('CreatePaymentDto rejects amount below minimum', async () => {
    const dto = plainToClass(CreatePaymentDto, { amount: 0, currency: 'USDC', merchantId: 'uuid', customerId: 'uuid' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'amount')).toBe(true);
  });

  it('CreateEscrowPaymentDto validates amount minimum', async () => {
    const dto = plainToClass(CreateEscrowPaymentDto, { senderAddress: 'GSRC', merchantId: 'uuid', tokenAddress: 'CTOKEN', amount: 0 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'amount')).toBe(true);
  });
});
