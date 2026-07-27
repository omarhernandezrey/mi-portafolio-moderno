import { parseBudgetAmount } from '@/lib/budget';

describe('parseBudgetAmount', () => {
  it('formatos simples', () => {
    expect(parseBudgetAmount('$500')).toBe(500);
    expect(parseBudgetAmount('$500 USD')).toBe(500);
    expect(parseBudgetAmount('500')).toBe(500);
    expect(parseBudgetAmount('$0')).toBe(0);
  });

  it('rangos devuelven el punto medio', () => {
    expect(parseBudgetAmount('$800-1200 USD')).toBe(1000);
    expect(parseBudgetAmount('1000-3000 USD')).toBe(2000);
    expect(parseBudgetAmount('$500 – $700')).toBe(600);
  });

  it('separadores de miles', () => {
    expect(parseBudgetAmount('$1.500')).toBe(1500);   // LATAM
    expect(parseBudgetAmount('$1,500')).toBe(1500);   // US
    expect(parseBudgetAmount('1.500.000')).toBe(1500000);
  });

  it('decimales', () => {
    expect(parseBudgetAmount('1.5')).toBe(1.5);
    expect(parseBudgetAmount('$1,234.56')).toBe(1234.56);
  });

  it('entradas inválidas', () => {
    expect(parseBudgetAmount(null)).toBe(0);
    expect(parseBudgetAmount(undefined)).toBe(0);
    expect(parseBudgetAmount('')).toBe(0);
    expect(parseBudgetAmount('por definir')).toBe(0);
  });

  it('no infla rangos como concatenación', () => {
    // El bug original: "$800-1200 USD" → 8001200
    const amount = parseBudgetAmount('$800-1200 USD');
    expect(amount).toBeLessThan(5000);
    expect(amount).toBeGreaterThan(0);
  });
});
