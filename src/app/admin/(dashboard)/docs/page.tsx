import React from 'react';
import { getAllDocs } from '@/lib/docs';
import Link from 'next/link';
import { ArrowUpRight, Book, Clock3, FileText } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';

export const dynamic = 'force-dynamic';

function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function AdminDocsPage() {
  const docs = await getAllDocs();
  const totalMinutes = docs.reduce((total, doc) => total + readingMinutes(doc.content), 0);

  return (
    <div className="space-y-6 sm:space-y-10">
      <PageHeader
        overline="Knowledge Base"
        title="Documentación Interna"
        description="Procesos repetibles y guías para el equipo y subcontratistas."
      />

      <section className="relative overflow-hidden rounded-2xl border border-admin-line bg-card-bg p-6 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-[100px]"
        />
        <div className="relative grid gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="max-w-xl">
            <p className="font-mono-label text-[10px] text-primary">Manual operativo</p>
            <h2 className="mt-3 font-display text-2xl font-semibold italic leading-tight tracking-tight text-admin-ink sm:text-3xl">
              Procesos que no dependen de la memoria.
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-text-muted">
              Guías cortas para resolver incidentes, generar propuestas y ejecutar despliegues con el mismo estándar.
            </p>
          </div>
          <div className="flex items-end gap-8 sm:gap-10">
            <div>
              <p className="text-4xl font-black tracking-tight text-admin-ink">{docs.length}</p>
              <p className="mt-1 font-mono-label text-[9px] text-text-muted/60">Guías</p>
            </div>
            <div>
              <p className="text-4xl font-black tracking-tight text-admin-ink">{totalMinutes}</p>
              <p className="mt-1 font-mono-label text-[9px] text-text-muted/60">Min lectura</p>
            </div>
          </div>
        </div>
      </section>

      {docs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {docs.map((doc, index) => (
            <Link
              key={doc.slug}
              href={`/admin/docs/${doc.slug}`}
              className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-admin-line bg-card-bg p-5 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] transition-colors hover:border-primary/35"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/0 blur-[45px] transition-colors duration-500 group-hover:bg-primary/15"
              />
              <div className="relative flex items-center justify-between gap-3">
                <span className="font-mono-label text-[10px] text-text-muted/45">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-admin-line bg-white/[0.03] px-2.5 py-1 font-mono-label text-[9px] text-text-muted/60">
                  <Clock3 size={11} />
                  {readingMinutes(doc.content)} min
                </span>
              </div>

              <div className="relative mt-6 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                <FileText size={20} />
              </div>

              <h2 className="relative mt-5 text-lg font-bold tracking-tight text-admin-ink transition-colors group-hover:text-primary">
                {doc.title}
              </h2>
              <p className="relative mt-2 line-clamp-3 text-xs font-medium leading-relaxed text-text-muted">
                {doc.description}
              </p>

              <div className="relative mt-auto flex items-center justify-between border-t border-admin-line pt-5">
                <span className="font-mono-label text-[9px] text-text-muted/50">Abrir guía</span>
                <ArrowUpRight
                  size={17}
                  className="text-text-muted/50 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-admin-line bg-card-bg py-12 sm:py-20">
          <EmptyState
            icon={<Book size={56} />}
            title="Sin documentos"
            description="No se encontraron documentos de procesos"
          />
        </div>
      )}
    </div>
  );
}
