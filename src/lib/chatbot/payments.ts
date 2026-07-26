import { clientEnv } from "@/config/env";

export interface PaymentMethod {
  id: string;
  name: string;
  url?: string;
  qrImage?: string;
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

  // PayPal — Disponible para todos (internacional, USD/EUR vía tarjeta o saldo PayPal)
  if (clientEnv.NEXT_PUBLIC_PAYMENT_PAYPAL_URL) {
    options.push({
      id: "paypal",
      name: "PayPal (USD/EUR)",
      url: clientEnv.NEXT_PUBLIC_PAYMENT_PAYPAL_URL,
      instructions: {
        es: "Paga de forma segura con PayPal (ideal para tarjetas internacionales).",
        en: "Pay securely with PayPal (ideal for international cards).",
      },
      currencies: ["USD", "EUR"],
      fee: "5.4% + 0.30 USD",
    });
  }

  // Lógica específica por país
  if (normalizedCountry === "CO") {
    // Wompi — checkout Colombia (acepta tarjeta, PSE, Nequi y Bancolombia)
    if (clientEnv.NEXT_PUBLIC_PAYMENT_WOMPI_URL) {
      options.push({
        id: "wompi",
        name: "Wompi (tarjeta · PSE · Nequi · Bancolombia)",
        url: clientEnv.NEXT_PUBLIC_PAYMENT_WOMPI_URL,
        instructions: {
          es: "Paga con tarjeta crédito/débito, PSE, Nequi o Bancolombia desde el checkout seguro de Wompi.",
          en: "Pay with credit/debit card, PSE, Nequi or Bancolombia via Wompi's secure checkout.",
        },
        currencies: ["COP"],
        fee: "~3% según método",
      });
    }

    // Nequi — QR Bre-B (sirve para Nequi, Bancolombia, Davivienda y demás apps colombianas)
    const nequiQr = clientEnv.NEXT_PUBLIC_PAYMENT_NEQUI_QR || undefined;
    if (nequiQr) {
      options.push({
        id: "nequi",
        name: "Nequi / QR Bre-B (Colombia)",
        url: nequiQr,
        qrImage: nequiQr,
        instructions: {
          es: "Escanea el QR Bre-B desde tu app de Nequi, Bancolombia, Davivienda u otras apps colombianas. Comisión $0 entre Nequis.",
          en: "Scan the Bre-B QR from your Nequi, Bancolombia, Davivienda or other Colombian banking app. Zero fee between Nequi accounts.",
        },
        currencies: ["COP"],
        fee: "$0 entre Nequis",
      });
    }

    // Bancolombia — transferencia directa (datos bajo solicitud)
    options.push({
      id: "bancolombia",
      name: "Bancolombia (Transferencia)",
      instructions: {
        es: "Solicita mis datos de cuenta para transferencia directa o corresponsal bancario.",
        en: "Request my account details for direct transfer or banking correspondent.",
      },
      currencies: ["COP"],
    });
  }

  return options;
}
