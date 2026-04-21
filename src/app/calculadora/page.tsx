import React from 'react';
import BudgetCalculator from '@/components/calculator/BudgetCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Presupuesto | Omar Hernández',
  description: 'Calcula cuánto cuesta tu sitio web o aplicación en 2 minutos. Gratis, sin compromiso y con entrega de propuesta en PDF.',
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
