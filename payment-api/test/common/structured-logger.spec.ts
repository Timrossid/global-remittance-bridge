import { StructuredLogger } from '../../src/common/utils/structured-logger.util';

describe('StructuredLogger', () => {
  let logs: string[];
  const original = { log: console.log, warn: console.warn, error: console.error };

  beforeEach(() => {
    logs = [];
    console.log = (...args: any[]) => logs.push(JSON.stringify(args));
    console.warn = (...args: any[]) => logs.push(JSON.stringify(args));
    console.error = (...args: any[]) => logs.push(JSON.stringify(args));
  });

  afterEach(() => {
    console.log = original.log;
    console.warn = original.warn;
    console.error = original.error;
  });

  it('logs info with context', () => {
    const logger = new StructuredLogger('Test');
    logger.info('hello', { key: 1 });
    const entry = JSON.parse(logs[0]);
    expect(entry.level).toBe('info');
    expect(entry.context).toBe('Test');
    expect(entry.message).toBe('hello');
    expect(entry.key).toBe(1);
  });

  it('logs warn and error', () => {
    const logger = new StructuredLogger('Ctx');
    logger.warn('warn msg');
    logger.error('err msg');
    expect(logs[1]).toContain('"level":"warn"');
    expect(logs[2]).toContain('"level":"error"');
  });

  it('suppresses debug in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const logger = new StructuredLogger('D');
    logger.debug('secret');
    expect(logs).toHaveLength(0);
    process.env.NODE_ENV = prev;
  });
});
