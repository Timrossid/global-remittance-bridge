import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class SanitizationPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.trim().replace(/[<>]/g, '');
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        if (typeof val === 'string') {
          sanitized[key] = val.trim().replace(/[<>]/g, '');
        } else {
          sanitized[key] = val;
        }
      }
      return sanitized;
    }
    return value;
  }
}
