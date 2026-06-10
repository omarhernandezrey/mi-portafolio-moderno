export interface Ciudad {
  id: string;
  name: string;
  country: string;
}

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
