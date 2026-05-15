import React from 'react';
import { getAllDocs } from '@/lib/docs';
import Link from 'next/link';
import { Book, ChevronRight, FileText } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';

export const dynamic = 'force-dynamic';

export default async function AdminDocsPage() {
  const docs = await getAllDocs();

  return (
    <div className="space-y-6 sm:space-y-10">
      <PageHeader
        overline="Knowledge Base"
        title="Documentación Interna"
        description="Procesos repetibles y guías para el equipo y subcontratistas."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {docs.map((doc) => (
          <Link 
            key={doc.slug} 
            href={`/admin/docs/${doc.slug}`}
            className="group bg-card-bg p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-white/5 hover:border-primary/30 transition-all shadow-xl hover:shadow-2xl"
          >
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <FileText size={22} />
              </div>
              <ChevronRight className="text-text-muted group-hover:text-primary transition-colors" size={19} />
            </div>
            <h2 className="text-lg sm:text-xl font-bold mb-2 text-white-custom group-hover:text-primary transition-colors">
              {doc.title}
            </h2>
            <p className="text-xs sm:text-sm text-text-muted line-clamp-2">
              {doc.description}
            </p>
          </Link>
        ))}
      </div>

      {docs.length === 0 && (
        <div className="text-center py-12 sm:py-20 bg-card-bg rounded-[24px] sm:rounded-[32px] border border-dashed border-white/10">
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
