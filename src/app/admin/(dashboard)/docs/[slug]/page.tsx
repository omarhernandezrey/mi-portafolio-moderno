import React from 'react';
import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocs } from '@/lib/docs';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export async function generateStaticParams() {
  const docs = await getAllDocs();
  return docs.map((doc) => ({
    slug: doc.slug,
  }));
}

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl font-bold mt-8 mb-4 text-white-custom" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl font-bold mt-8 mb-4 text-white-custom" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-bold mt-6 mb-3 text-primary" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4 leading-relaxed text-text-muted" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc pl-6 mb-4 space-y-2 text-text-muted" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-text-muted" {...props} />,
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => <strong className="font-bold text-white-custom" {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code className="bg-primary/10 px-1.5 py-0.5 rounded text-sm text-primary font-mono" {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre className="bg-black/40 border border-white/10 text-white-custom p-6 rounded-2xl overflow-x-auto mb-6 text-sm" {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-primary pl-6 italic my-8 text-text-muted bg-primary/5 py-4 rounded-r-2xl" {...props} />
  ),
};

export default async function AdminDocDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        href="/admin/docs" 
        className="flex items-center gap-2 text-xs sm:text-sm text-text-muted hover:text-primary transition-colors mb-4 sm:mb-8 group w-fit"
      >
        <ArrowLeft size={14} sm:size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver a la documentación
      </Link>
      
      <article className="bg-card-bg p-4 sm:p-8 lg:p-12 rounded-[24px] sm:rounded-[32px] border border-white/5 shadow-2xl">
        <header className="mb-6 sm:mb-12 border-b border-white/5 pb-4 sm:pb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white-custom mb-2 sm:mb-4 tracking-tight">
            {doc.title}
          </h1>
          <p className="text-sm sm:text-lg text-text-muted leading-relaxed">
            {doc.description}
          </p>
        </header>

        <div className="prose prose-invert max-w-none prose-sm sm:prose-base">
          <MDXRemote source={doc.content} components={components} />
        </div>
      </article>
    </div>
  );
}
