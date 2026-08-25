export interface Ciudad {
  id: string;
  name: string;
  country: string;
}

export interface CiudadContexto {
  marketContext: { es: string; en: string };
  paymentFaq: {
    es: { q: string; a: string };
    en: { q: string; a: string };
  };
}

// Contenido local REAL (no plantilla) para las ciudades indexables — hechos
// generales y verificables sobre cada mercado, no afirmaciones de clientes o
// casos concretos que no existen. Reduce el % de contenido idéntico entre
// páginas de ciudad, que es la señal que Google usa para tratarlas como
// doorway pages (ver auditoría GSC ago-2026: 116 páginas "descubierta, sin
// indexar" — la mayoría eran servicio×ciudad).
export const CIUDAD_CONTEXTO: Record<string, CiudadContexto> = {
  bogota: {
    marketContext: {
      es: 'Bogotá es la capital económica de Colombia: aquí operan la mayoría de bancos, aseguradoras, multinacionales y entidades de gobierno del país, lo que la convierte en el mercado digital más grande y exigente de Colombia.',
      en: "Bogotá is Colombia's economic capital — home to most of the country's banks, insurers, multinationals, and government entities, making it Colombia's largest and most demanding digital market.",
    },
    paymentFaq: {
      es: {
        q: '¿Puedo pagar en pesos colombianos y con factura electrónica?',
        a: 'Sí. Facturo en COP vía Nequi, Wompi o transferencia bancaria, y emito factura electrónica ante la DIAN si tu empresa la requiere para efectos contables.',
      },
      en: {
        q: 'Can I pay in Colombian pesos with an official invoice?',
        a: 'Yes. I invoice in COP via Nequi, Wompi, or bank transfer, and issue a DIAN-compliant electronic invoice if your company needs it for accounting.',
      },
    },
  },
  medellin: {
    marketContext: {
      es: 'Medellín se consolidó como el principal polo de innovación y startups tecnológicas de Colombia, con un ecosistema de coworkings, aceleradoras y talento tech que sigue creciendo cada año.',
      en: "Medellín has become Colombia's leading tech and startup hub, with a growing ecosystem of coworking spaces, accelerators, and tech talent.",
    },
    paymentFaq: {
      es: {
        q: '¿Puedo pagar en pesos colombianos y con factura electrónica?',
        a: 'Sí. Facturo en COP vía Nequi, Wompi o transferencia bancaria, y emito factura electrónica ante la DIAN si tu empresa la requiere para efectos contables.',
      },
      en: {
        q: 'Can I pay in Colombian pesos with an official invoice?',
        a: 'Yes. I invoice in COP via Nequi, Wompi, or bank transfer, and issue a DIAN-compliant electronic invoice if your company needs it for accounting.',
      },
    },
  },
  cali: {
    marketContext: {
      es: 'Cali es el centro industrial y agroindustrial del suroccidente colombiano, con fuerte presencia de manufactura, salud y centros de servicios (BPO) — sectores donde una presencia digital sólida marca la diferencia frente a la competencia regional.',
      en: 'Cali is the industrial and agribusiness hub of southwestern Colombia, with a strong presence of manufacturing, healthcare, and BPO/service centers.',
    },
    paymentFaq: {
      es: {
        q: '¿Puedo pagar en pesos colombianos y con factura electrónica?',
        a: 'Sí. Facturo en COP vía Nequi, Wompi o transferencia bancaria, y emito factura electrónica ante la DIAN si tu empresa la requiere para efectos contables.',
      },
      en: {
        q: 'Can I pay in Colombian pesos with an official invoice?',
        a: 'Yes. I invoice in COP via Nequi, Wompi, or bank transfer, and issue a DIAN-compliant electronic invoice if your company needs it for accounting.',
      },
    },
  },
  barranquilla: {
    marketContext: {
      es: 'Barranquilla es el principal puerto y centro logístico del Caribe colombiano, con una economía impulsada por el comercio exterior, la zona franca y un sector empresarial en plena expansión.',
      en: 'Barranquilla is the leading port and logistics hub of the Colombian Caribbean, with an economy driven by foreign trade, its free trade zone, and a fast-growing business sector.',
    },
    paymentFaq: {
      es: {
        q: '¿Puedo pagar en pesos colombianos y con factura electrónica?',
        a: 'Sí. Facturo en COP vía Nequi, Wompi o transferencia bancaria, y emito factura electrónica ante la DIAN si tu empresa la requiere para efectos contables.',
      },
      en: {
        q: 'Can I pay in Colombian pesos with an official invoice?',
        a: 'Yes. I invoice in COP via Nequi, Wompi, or bank transfer, and issue a DIAN-compliant electronic invoice if your company needs it for accounting.',
      },
    },
  },
  bucaramanga: {
    marketContext: {
      es: 'Bucaramanga combina una fuerte tradición universitaria (UIS, UNAB, entre otras) con un ecosistema emprendedor creciente, lo que la ha posicionado como una de las ciudades intermedias con más dinamismo tech de Colombia.',
      en: "Bucaramanga combines a strong university tradition (UIS, UNAB, among others) with a growing entrepreneurial ecosystem, positioning it as one of Colombia's most dynamic mid-size tech cities.",
    },
    paymentFaq: {
      es: {
        q: '¿Puedo pagar en pesos colombianos y con factura electrónica?',
        a: 'Sí. Facturo en COP vía Nequi, Wompi o transferencia bancaria, y emito factura electrónica ante la DIAN si tu empresa la requiere para efectos contables.',
      },
      en: {
        q: 'Can I pay in Colombian pesos with an official invoice?',
        a: 'Yes. I invoice in COP via Nequi, Wompi, or bank transfer, and issue a DIAN-compliant electronic invoice if your company needs it for accounting.',
      },
    },
  },
  miami: {
    marketContext: {
      es: 'Miami funciona como la puerta de entrada de negocios entre Estados Unidos y Latinoamérica, con una alta concentración de startups, empresas bilingües y operaciones regionales que necesitan desarrollo ágil y confiable.',
      en: 'Miami serves as the business gateway between the US and Latin America, with a high concentration of startups, bilingual companies, and regional operations that need agile, reliable development.',
    },
    paymentFaq: {
      es: {
        q: '¿Cómo se maneja el pago desde Estados Unidos?',
        a: 'Transferencia en USD, PayPal o Wise, facturado por hitos del proyecto. Es una relación de contratista independiente, sin nómina ni retenciones de empleado.',
      },
      en: {
        q: 'How do I pay for the project from the US?',
        a: 'Standard USD wire transfer, PayPal, or Wise — invoiced per milestone. This is an independent contractor engagement, with no payroll or employee tax involved.',
      },
    },
  },
  'new-york': {
    marketContext: {
      es: 'Nueva York es el centro financiero y corporativo más grande de Estados Unidos, con alta demanda de desarrollo a medida en sectores como fintech, medios y empresas enterprise.',
      en: 'New York is the largest financial and corporate hub in the US, with strong demand for custom development in fintech, media, and enterprise companies.',
    },
    paymentFaq: {
      es: {
        q: '¿Cómo se maneja el pago desde Estados Unidos?',
        a: 'Transferencia en USD, PayPal o Wise, facturado por hitos del proyecto. Es una relación de contratista independiente, sin nómina ni retenciones de empleado.',
      },
      en: {
        q: 'How do I pay for the project from the US?',
        a: 'Standard USD wire transfer, PayPal, or Wise — invoiced per milestone. This is an independent contractor engagement, with no payroll or employee tax involved.',
      },
    },
  },
};

// Ciudades con página propia indexable. El resto de `ciudades` se conserva
// solo para redirigir (301) URLs antiguas hacia la página pilar del servicio.
// Criterio: búsqueda local real en español (Colombia) + 2 mercados USA con
// alta demanda nearshore. Ampliar SOLO si la página tendrá contenido local único.
export const CIUDADES_INDEXABLES = [
  'bogota',
  'medellin',
  'cali',
  'barranquilla',
  'bucaramanga',
  'miami',
  'new-york',
] as const;

export const ciudades: Ciudad[] = [
  { id: 'bogota', name: 'Bogotá', country: 'Colombia' },
  { id: 'medellin', name: 'Medellín', country: 'Colombia' },
  { id: 'cali', name: 'Cali', country: 'Colombia' },
  { id: 'barranquilla', name: 'Barranquilla', country: 'Colombia' },
  { id: 'cartagena', name: 'Cartagena', country: 'Colombia' },
  { id: 'bucaramanga', name: 'Bucaramanga', country: 'Colombia' },
  { id: 'pereira', name: 'Pereira', country: 'Colombia' },
  { id: 'manizales', name: 'Manizales', country: 'Colombia' },
  { id: 'cucuta', name: 'Cúcuta', country: 'Colombia' },
  { id: 'ibague', name: 'Ibagué', country: 'Colombia' },
  { id: 'villavicencio', name: 'Villavicencio', country: 'Colombia' },
  { id: 'santa-marta', name: 'Santa Marta', country: 'Colombia' },
  { id: 'ciudad-de-mexico', name: 'Ciudad de México', country: 'México' },
  { id: 'guadalajara', name: 'Guadalajara', country: 'México' },
  { id: 'monterrey', name: 'Monterrey', country: 'México' },
  { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina' },
  { id: 'cordoba', name: 'Córdoba', country: 'Argentina' },
  { id: 'santiago', name: 'Santiago', country: 'Chile' },
  { id: 'lima', name: 'Lima', country: 'Perú' },
  { id: 'montevideo', name: 'Montevideo', country: 'Uruguay' },
  { id: 'quito', name: 'Quito', country: 'Ecuador' },
  { id: 'guayaquil', name: 'Guayaquil', country: 'Ecuador' },
  { id: 'caracas', name: 'Caracas', country: 'Venezuela' },
  { id: 'santo-domingo', name: 'Santo Domingo', country: 'República Dominicana' },
  { id: 'panama', name: 'Panamá', country: 'Panamá' },
  { id: 'san-jose', name: 'San José', country: 'Costa Rica' },
  { id: 'asuncion', name: 'Asunción', country: 'Paraguay' },
  { id: 'la-paz', name: 'La Paz', country: 'Bolivia' },
  // United States — Northeast
  { id: 'new-york', name: 'New York', country: 'United States' },
  { id: 'boston', name: 'Boston', country: 'United States' },
  { id: 'philadelphia', name: 'Philadelphia', country: 'United States' },
  { id: 'washington-dc', name: 'Washington DC', country: 'United States' },
  { id: 'baltimore', name: 'Baltimore', country: 'United States' },
  { id: 'newark', name: 'Newark', country: 'United States' },
  { id: 'hartford', name: 'Hartford', country: 'United States' },
  { id: 'providence', name: 'Providence', country: 'United States' },
  // United States — Southeast
  { id: 'miami', name: 'Miami', country: 'United States' },
  { id: 'atlanta', name: 'Atlanta', country: 'United States' },
  { id: 'tampa', name: 'Tampa', country: 'United States' },
  { id: 'orlando', name: 'Orlando', country: 'United States' },
  { id: 'charlotte', name: 'Charlotte', country: 'United States' },
  { id: 'nashville', name: 'Nashville', country: 'United States' },
  { id: 'jacksonville', name: 'Jacksonville', country: 'United States' },
  { id: 'raleigh', name: 'Raleigh', country: 'United States' },
  { id: 'richmond', name: 'Richmond', country: 'United States' },
  { id: 'memphis', name: 'Memphis', country: 'United States' },
  { id: 'louisville', name: 'Louisville', country: 'United States' },
  { id: 'new-orleans', name: 'New Orleans', country: 'United States' },
  // United States — Midwest
  { id: 'chicago', name: 'Chicago', country: 'United States' },
  { id: 'detroit', name: 'Detroit', country: 'United States' },
  { id: 'minneapolis', name: 'Minneapolis', country: 'United States' },
  { id: 'columbus', name: 'Columbus', country: 'United States' },
  { id: 'indianapolis', name: 'Indianapolis', country: 'United States' },
  { id: 'milwaukee', name: 'Milwaukee', country: 'United States' },
  { id: 'cleveland', name: 'Cleveland', country: 'United States' },
  { id: 'kansas-city', name: 'Kansas City', country: 'United States' },
  { id: 'st-louis', name: 'St. Louis', country: 'United States' },
  { id: 'pittsburgh', name: 'Pittsburgh', country: 'United States' },
  { id: 'cincinnati', name: 'Cincinnati', country: 'United States' },
  { id: 'omaha', name: 'Omaha', country: 'United States' },
  // United States — South Central & Texas
  { id: 'houston', name: 'Houston', country: 'United States' },
  { id: 'dallas', name: 'Dallas', country: 'United States' },
  { id: 'san-antonio', name: 'San Antonio', country: 'United States' },
  { id: 'austin', name: 'Austin', country: 'United States' },
  { id: 'el-paso', name: 'El Paso', country: 'United States' },
  { id: 'oklahoma-city', name: 'Oklahoma City', country: 'United States' },
  // United States — Mountain & Southwest
  { id: 'phoenix', name: 'Phoenix', country: 'United States' },
  { id: 'las-vegas', name: 'Las Vegas', country: 'United States' },
  { id: 'denver', name: 'Denver', country: 'United States' },
  { id: 'albuquerque', name: 'Albuquerque', country: 'United States' },
  { id: 'salt-lake-city', name: 'Salt Lake City', country: 'United States' },
  { id: 'tucson', name: 'Tucson', country: 'United States' },
  // United States — West Coast
  { id: 'los-angeles', name: 'Los Angeles', country: 'United States' },
  { id: 'san-francisco', name: 'San Francisco', country: 'United States' },
  { id: 'seattle', name: 'Seattle', country: 'United States' },
  { id: 'portland', name: 'Portland', country: 'United States' },
  { id: 'san-diego', name: 'San Diego', country: 'United States' },
  { id: 'sacramento', name: 'Sacramento', country: 'United States' },
  { id: 'san-jose', name: 'San Jose', country: 'United States' },
  // United States — Other
  { id: 'boise', name: 'Boise', country: 'United States' },
  { id: 'honolulu', name: 'Honolulu', country: 'United States' },
];
