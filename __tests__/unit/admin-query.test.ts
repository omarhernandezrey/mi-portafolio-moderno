import { pageRange, parsePage, sanitizeSearchTerm } from '@/lib/admin/query';
import { isLeadStatus, LEAD_STATUSES } from '@/lib/admin/types';

describe('admin query helpers', () => {
  it('sanitizeSearchTerm elimina metacaracteres de filtro', () => {
    expect(sanitizeSearchTerm('  foo%bar_baz  ')).toBe('foo bar baz');
    expect(sanitizeSearchTerm(`a(b).c,"d"'e\\f`)).toBe('a b c d e f');
    expect(sanitizeSearchTerm('x'.repeat(200)).length).toBe(120);
  });

  it('parsePage valida enteros positivos', () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage('0')).toBe(1);
    expect(parsePage('-2')).toBe(1);
    expect(parsePage('abc')).toBe(1);
    expect(parsePage('3')).toBe(3);
  });

  it('pageRange calcula from/to inclusivos', () => {
    expect(pageRange(1, 20)).toEqual({ from: 0, to: 19 });
    expect(pageRange(2, 20)).toEqual({ from: 20, to: 39 });
    expect(pageRange(3, 10)).toEqual({ from: 20, to: 29 });
  });
});

describe('lead statuses', () => {
  it('reconoce estados canónicos', () => {
    for (const s of LEAD_STATUSES) {
      expect(isLeadStatus(s)).toBe(true);
    }
    expect(isLeadStatus('pendiente')).toBe(false);
    expect(isLeadStatus('')).toBe(false);
  });
});
