import React from 'react';
import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';

// Componentes personalizados para MDX
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4 leading-relaxed" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code className="bg-[var(--muted-color)]/10 px-1 rounded text-sm" {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto mb-4 text-sm" {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-[var(--primary-color)] pl-4 italic my-6 text-[var(--muted-color)]" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-[var(--primary-color)] hover:underline" {...props} />,
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Post no encontrado' };

  const title = `${post.title} | Blog Omar Hernández`;

  return {
    title,
    description: post.description,
    alternates: {
      canonical: `https://omarhernandezrey.com/blog/${slug}`,
    },
    openGraph: {
      title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [
        {
          url: `https://omarhernandezrey.com/api/og?title=${encodeURIComponent(post.title)}&subtitle=Blog+Omar+Hernández+Rey`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
      images: [`https://omarhernandezrey.com/api/og?title=${encodeURIComponent(post.title)}&subtitle=Blog+Omar+Hernández+Rey`],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Schema Article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `https://omarhernandezrey.com/blog/${slug}`,
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "@id": "https://omarhernandezrey.com/#person",
      "name": post.author || "Omar Hernández Rey"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Omar Hernández Rey",
      "logo": {
        "@type": "ImageObject",
        "url": "https://omarhernandezrey.com/favicon.png"
      }
    },
    "image": {
      "@type": "ImageObject",
      "url": post.image
        ? `https://omarhernandezrey.com${post.image}`
        : `https://omarhernandezrey.com/api/og?title=${encodeURIComponent(post.title)}&subtitle=Blog+Omar+Hernández+Rey`,
      "width": 1200,
      "height": 630
    },
    "url": `https://omarhernandezrey.com/blog/${slug}`,
    "inLanguage": "es",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://omarhernandezrey.com/blog/${slug}`
    }
  };

  // Schema BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://omarhernandezrey.com" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://omarhernandezrey.com/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://omarhernandezrey.com/blog/${slug}` }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Link href="/blog" className="text-sm text-[var(--primary-color)] hover:underline mb-8 block">
        ← Volver al blog
      </Link>
      
      <article>
        <header className="mb-8">
          <span className="text-sm text-[var(--muted-color)] block mb-2">
            {new Date(post.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-[var(--muted-color)]">
            <span>Por {post.author}</span>
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none">
          <MDXRemote source={post.content} components={components} />
        </div>

        <footer className="mt-12 pt-8 border-t border-[var(--muted-color)]/20">
          <div className="bg-[var(--muted-color)]/5 p-8 rounded-2xl text-center">
            <h3 className="text-xl font-bold mb-2">¿Te gustó el artículo?</h3>
            <p className="text-[var(--muted-color)] mb-6">
              Hablemos sobre cómo puedo aplicar estos conceptos en tu próximo proyecto.
            </p>
            <Link 
              href="/#contact" 
              className="inline-block bg-[var(--primary-color)] text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all"
            >
              Contactar ahora
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}
