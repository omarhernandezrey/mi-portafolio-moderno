import { clientEnv } from "@/config/env";

export interface PaymentMethod {
  id: string;
  name: string;
  url?: string;
  instructions: { es: string; en: string };
  currencies: string[];
  fee?: string;
}

/**
 * Retorna métodos de pago disponibles según la moneda solicitada y el país del cliente.
 * 
 * @param currency - Moneda en la que se desea realizar el pago (USD, COP, etc.)
 * @param countryCode - Código de país ISO de 2 letras (CO, US, ES, etc.)
 */
export function getPaymentOptions(currency: string, countryCode: string): PaymentMethod[] {
  const options: PaymentMethod[] = [];
  const normalizedCountry = countryCode.toUpperCase();

  // USDT / Crypto (Binance Pay) - Disponible para todos
  options.push({
    id: "binance",
    name: "Binance Pay (USDT)",
    url: clientEnv.NEXT_PUBLIC_PAYMENT_BINANCE_ID ? `https://pay.binance.com/en/checkout/${clientEnv.NEXT_PUBLIC_PAYMENT_BINANCE_ID}` : undefined,
    instructions: {
      es: `Usa mi Binance Pay ID: ${clientEnv.NEXT_PUBLIC_PAYMENT_BINANCE_ID || "Disponible al solicitarlo"}`,
      en: `Use my Binance Pay ID: ${clientEnv.NEXT_PUBLIC_PAYMENT_BINANCE_ID || "Available upon request"}`
    },
    currencies: ["USDT"],
  });

  // PayPal - Disponible para todos (Internacional)
  options.push({
    id: "paypal",
    name: "PayPal (USD/EUR)",
    url: clientEnv.NEXT_PUBLIC_PAYMENT_PAYPAL_URL || undefined,
    instructions: {
      es: "Paga de forma segura con PayPal (ideal para tarjetas internacionales).",
      en: "Pay securely with PayPal (ideal for international cards)."
    },
    currencies: ["USD", "EUR"],
    fee: "5.4% + 0.30 USD"
  });

  // Lógica específica por país
  if (normalizedCountry === "CO") {
    // Nequi
    options.push({
      id: "nequi",
      name: "Nequi (Colombia)",
      url: clientEnv.NEXT_PUBLIC_PAYMENT_NEQUI_URL || undefined,
      instructions: {
        es: "Paga desde tu app Nequi mediante link o número celular.",
        en: "Pay from your Nequi app via link or phone number."
      },
      currencies: ["COP"],
    });

    // Bancolombia
    options.push({
      id: "bancolombia",
      name: "Bancolombia (Transferencia)",
      instructions: {
        es: "Solicita mis datos de cuenta para transferencia directa o corresponsal.",
        en: "Request my account details for direct transfer or correspondent."
      },
      currencies: ["COP"],
    });
  } else if (["AR", "CL", "MX", "PE", "UY"].includes(normalizedCountry)) {
    // Mercado Pago
    options.push({
      id: "mercadopago",
      name: "Mercado Pago",
      url: clientEnv.NEXT_PUBLIC_PAYMENT_MP_URL || undefined,
      instructions: {
        es: "Usa Mercado Pago para pagar cómodamente en tu moneda local.",
        en: "Use Mercado Pago to pay easily in your local currency."
      },
      currencies: ["ARS", "CLP", "MXN", "PEN", "UYU"],
    });
  }

  // Wise - Para USA / Europa / Internacional (Comisiones bajas)
  if (["US", "ES", "UK", "DE", "FR", "IT", "GB"].includes(normalizedCountry) || currency === "USD" || currency === "EUR") {
    options.push({
      id: "wise",
      name: "Wise (Transferencia)",
      instructions: {
        es: "Paga mediante Wise para obtener las comisiones más bajas en transferencias bancarias internacionales.",
        en: "Pay via Wise to get the lowest fees on international bank transfers."
      },
      currencies: ["USD", "EUR", "GBP"],
      fee: "~1%"
    });
  }

  return options;
}
