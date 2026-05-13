import React from 'react';
import BudgetCalculator from '@/components/calculator/BudgetCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Presupuesto | Omar Hernández',
  description: 'Calcula el precio de tu sitio web o app en 2 minutos. Sin compromiso. Estimado real con desglose por funcionalidad. ¡Empieza ahora!',
  alternates: {
    canonical: 'https://omarhernandezrey.com/calculadora',
  },
  openGraph: {
    title: 'Calculadora de Presupuesto Web & App',
    description: 'Obtén un estimado real para tu proyecto digital en segundos.',
    type: 'website',
  }
};

export default function CalculadoraPage() {
  return (
    <main className="min-h-screen bg-[var(--background-color)] pt-24 pb-12">
      <BudgetCalculator />
    </main>
  );
}
