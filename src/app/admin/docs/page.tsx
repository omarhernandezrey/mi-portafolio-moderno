import React from 'react';
import { getAllDocs } from '@/lib/docs';
import Link from 'next/link';
import { Book, ChevronRight, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDocsPage() {
  const docs = await getAllDocs();

  return (
    <div className="p-0">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Book className="text-[var(--primary-color)]" size={32} />
            Documentación Interna
          </h1>
          <p className="text-[var(--muted-color)] mt-2">
            Procesos repetibles y guías para el equipo y subcontratistas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <Link 
              key={doc.slug} 
              href={`/admin/docs/${doc.slug}`}
              className="group bg-[var(--card-bg-color)] p-6 rounded-2xl border border-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/30 transition-all shadow-lg hover:shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <ChevronRight className="text-[var(--muted-color)] group-hover:text-[var(--primary-color)] transition-colors" size={20} />
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--primary-color)] transition-colors">
                {doc.title}
              </h2>
              <p className="text-sm text-[var(--muted-color)] line-clamp-2">
                {doc.description}
              </p>
            </Link>
          ))}
        </div>

        {docs.length === 0 && (
          <div className="text-center py-20 bg-[var(--card-bg-color)] rounded-2xl border border-dashed border-[var(--primary-color)]/20">
            <Book className="mx-auto text-[var(--muted-color)] mb-4 opacity-20" size={64} />
            <p className="text-[var(--muted-color)]">No se encontraron documentos de procesos.</p>
          </div>
        )}
      </main>
    </div>
  );
}
