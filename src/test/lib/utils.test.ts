import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatNumber,
  maskMobile,
  isValidMobile,
  getInitials,
  truncate,
  capitalize,
} from '@/lib/utils';

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('handles Tailwind conflicts via tailwind-merge', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
});

describe('formatCurrency()', () => {
  it('formats number as INR', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('₹');
    expect(result).toContain('1,000');
  });

  it('returns ₹0.00 for NaN', () => {
    expect(formatCurrency('not-a-number')).toBe('₹0.00');
  });
});

describe('formatNumber()', () => {
  it('formats with Indian commas', () => {
    expect(formatNumber(100000)).toBe('1,00,000');
  });
});

describe('maskMobile()', () => {
  it('masks a valid 10-digit number', () => {
    expect(maskMobile('9876543210')).toBe('+91 98XXXXXX10');
  });
});

describe('isValidMobile()', () => {
  it('accepts valid Indian numbers', () => {
    expect(isValidMobile('9876543210')).toBe(true);
    expect(isValidMobile('6000000000')).toBe(true);
  });

  it('rejects invalid numbers', () => {
    expect(isValidMobile('1234567890')).toBe(false);
    expect(isValidMobile('98765')).toBe(false);
    expect(isValidMobile('')).toBe(false);
  });
});

describe('getInitials()', () => {
  it('returns first letters of first two words', () => {
    expect(getInitials('Rahul Sharma')).toBe('RS');
    expect(getInitials('Kumar')).toBe('K');
  });
});

describe('truncate()', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello…');
    expect(truncate('Hi', 10)).toBe('Hi');
  });
});

describe('capitalize()', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
  });
});
