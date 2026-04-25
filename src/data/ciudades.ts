export interface Ciudad {
  id: string;
  name: string;
  country: string;
}

export const ciudades: Ciudad[] = [
  { id: 'bogota', name: 'Bogotá', country: 'Colombia' },
  { id: 'medellin', name: 'Medellín', country: 'Colombia' },
  { id: 'cali', name: 'Cali', country: 'Colombia' },
  { id: 'barranquilla', name: 'Barranquilla', country: 'Colombia' },
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
];
