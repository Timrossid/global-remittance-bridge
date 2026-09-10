import { StructuredLogger } from '../../src/common/utils/structured-logger.util';

describe('StructuredLogger', () => {
  let logs: string[];
  let originalLog: typeof console.log;
  let originalWarn: typeof console.warn;
  let originalError: typeof console.error;

  beforeEach(() => {
    logs = [];
    originalLog = console.log;
    originalWarn = console.warn;
    originalError = console.error;
    console.log = (...args) => logs.push(args.join(' '));
    console.warn = (...args) => logs.push(args.join(' '));
    console.error = (...args) => logs.push(args.join(' '));
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  it('logs info as JSON with context', () => {
    const logger = new StructuredLogger('TestCtx');
    logger.info('hello', { key: 'value' });
    const parsed = JSON.parse(logs[0]);
    expect(parsed.context).toBe('TestCtx');
    expect(parsed.message).toBe('hello');
    expect(parsed.key).toBe('value');
  });

  it('logs warn and error', () => {
    const logger = new StructuredLogger('WarnCtx');
    logger.warn('warn msg');
    logger.error('err msg');
    expect(logs[1]).toContain('"level":"warn"');
    expect(logs[2]).toContain('"level":"error"');
  });

  it('suppresses debug in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const logger = new StructuredLogger('DebugCtx');
    logger.debug('should not appear');
    expect(logs).toHaveLength(0);
    process.env.NODE_ENV = prev;
  });
});
