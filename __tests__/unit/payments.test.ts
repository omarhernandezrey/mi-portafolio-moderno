// Mockeamos clientEnv para no depender de process.env en tests
jest.mock('@/config/env', () => ({
  clientEnv: {
    NEXT_PUBLIC_PAYMENT_PAYPAL_URL: 'https://paypal.me/test',
    NEXT_PUBLIC_PAYMENT_WOMPI_URL: 'https://checkout.wompi.co/l/test',
    NEXT_PUBLIC_PAYMENT_NEQUI_URL: '',
    NEXT_PUBLIC_PAYMENT_NEQUI_QR: '/payments/nequi-qr.png',
    NEXT_PUBLIC_PAYMENT_MP_URL: 'https://mp.com/test',
    NEXT_PUBLIC_PAYMENT_BINANCE_ID: '',
  },
  serverEnv: {},
}));

import { getPaymentOptions } from '@/lib/chatbot/payments';

describe('getPaymentOptions', () => {
  describe('Colombia (CO)', () => {
    it('incluye PayPal, Wompi, Nequi y Bancolombia', () => {
      const opts = getPaymentOptions('COP', 'CO');
      const ids = opts.map(o => o.id);
      expect(ids).toContain('paypal');
      expect(ids).toContain('wompi');
      expect(ids).toContain('nequi');
      expect(ids).toContain('bancolombia');
    });

    it('retorna Wompi solo para COP', () => {
      const opts = getPaymentOptions('COP', 'CO');
      const wompi = opts.find(o => o.id === 'wompi');
      expect(wompi).toBeDefined();
      expect(wompi?.currencies).toContain('COP');
    });

    it('incluye QR de Nequi cuando hay qrImage configurado', () => {
      const opts = getPaymentOptions('COP', 'CO');
      const nequi = opts.find(o => o.id === 'nequi');
      expect(nequi?.qrImage).toBe('/payments/nequi-qr.png');
    });

    it('case-insensitive: "co" == "CO"', () => {
      const upper = getPaymentOptions('COP', 'CO').map(o => o.id);
      const lower = getPaymentOptions('COP', 'co').map(o => o.id);
      expect(upper).toEqual(lower);
    });
  });

  describe('LATAM (AR, CL, MX, PE, UY)', () => {
    for (const country of ['AR', 'CL', 'MX', 'PE', 'UY']) {
      it(`incluye Mercado Pago para ${country}`, () => {
        const opts = getPaymentOptions('USD', country);
        expect(opts.map(o => o.id)).toContain('mercadopago');
      });
    }

    it('no incluye Wompi para México', () => {
      const opts = getPaymentOptions('USD', 'MX');
      expect(opts.map(o => o.id)).not.toContain('wompi');
    });
  });

  describe('Internacional (US, ES, DE)', () => {
    it('solo incluye PayPal para países no-CO no-LATAM', () => {
      const opts = getPaymentOptions('USD', 'US');
      expect(opts.map(o => o.id)).toContain('paypal');
      expect(opts.map(o => o.id)).not.toContain('wompi');
      expect(opts.map(o => o.id)).not.toContain('bancolombia');
    });

    it('no incluye Mercado Pago para España', () => {
      const opts = getPaymentOptions('EUR', 'ES');
      expect(opts.map(o => o.id)).not.toContain('mercadopago');
    });
  });

  describe('Binance Pay', () => {
    it('no incluye Binance si NEXT_PUBLIC_PAYMENT_BINANCE_ID está vacío', () => {
      const opts = getPaymentOptions('USD', 'US');
      expect(opts.map(o => o.id)).not.toContain('binance');
    });
  });

  describe('Instrucciones multiidioma', () => {
    it('PayPal tiene instrucciones en es y en', () => {
      const opts = getPaymentOptions('USD', 'US');
      const paypal = opts.find(o => o.id === 'paypal');
      expect(paypal?.instructions.es).toBeTruthy();
      expect(paypal?.instructions.en).toBeTruthy();
    });
  });

  describe('Array vacío sin configuración', () => {
    it('retorna al menos PayPal si la URL está configurada', () => {
      const opts = getPaymentOptions('USD', 'JP');
      expect(opts.length).toBeGreaterThan(0);
    });
  });
});
