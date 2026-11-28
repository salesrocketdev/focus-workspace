import { describe, expect, it } from 'vitest';
import { PRODUCT_VERSION } from './index';

describe('core package entry point', () => {
  it('exposes the current development version', () => {
    expect(PRODUCT_VERSION).toBe('0.1.0');
  });
});
