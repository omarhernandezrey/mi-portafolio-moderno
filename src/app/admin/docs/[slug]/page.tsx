import React from 'react';
import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocs } from '@/lib/docs';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Componentes personalizados para MDX (estilo similar al blog pero para admin)
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl font-bold mt-8 mb-4 text-[var(--white-color)]" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl font-bold mt-8 mb-4 text-[var(--white-color)]" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-bold mt-6 mb-3 text-[var(--primary-color)]" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4 leading-relaxed text-[var(--muted-color)]" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc pl-6 mb-4 space-y-2 text-[var(--muted-color)]" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-[var(--muted-color)]" {...props} />,
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-bold text-[var(--white-color)]" {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code className="bg-[var(--primary-color)]/10 px-1.5 py-0.5 rounded text-sm text-[var(--primary-color)] font-mono" {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre className="bg-black/40 border border-[var(--primary-color)]/10 text-[var(--text-color)] p-6 rounded-2xl overflow-x-auto mb-6 text-sm" {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-[var(--primary-color)] pl-6 italic my-8 text-[var(--muted-color)] bg-[var(--primary-color)]/5 py-4 rounded-r-2xl" {...props} />
  ),
};

export async function generateStaticParams() {
  const docs = await getAllDocs();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

export default async function AdminDocDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="p-0">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/admin/docs" 
          className="flex items-center gap-2 text-sm text-[var(--muted-color)] hover:text-[var(--primary-color)] transition-colors mb-8 group w-fit"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver a la documentación
        </Link>
        
        <article className="bg-[var(--card-bg-color)] p-8 sm:p-12 rounded-3xl border border-[var(--primary-color)]/10 shadow-2xl">
          <header className="mb-12 border-b border-[var(--primary-color)]/10 pb-8">
            <h1 className="text-4xl font-black text-[var(--white-color)] mb-4 tracking-tight">
              {doc.title}
            </h1>
            <p className="text-lg text-[var(--muted-color)] leading-relaxed">
              {doc.description}
            </p>
          </header>

          <div className="prose prose-invert max-w-none">
            <MDXRemote source={doc.content} components={components} />
          </div>
        </article>
      </main>
    </div>
  );
}
