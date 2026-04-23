import React from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const metadata = {
  title: 'Blog | Omar Hernández Rey',
  description: 'Artículos sobre desarrollo web, inteligencia artificial y tecnología.',
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4 text-[var(--primary-color)]">Blog</h1>
        <p className="text-lg text-[var(--muted-color)]">
          Explora mis últimos artículos sobre tecnología, desarrollo y productividad.
        </p>
      </header>

      <div className="grid gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article key={post.slug} className="group border-b border-[var(--muted-color)]/20 pb-8 last:border-0">
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted-color)]">
                    {new Date(post.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <h2 className="text-2xl font-bold group-hover:text-[var(--primary-color)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-[var(--muted-color)] line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-[var(--muted-color)]/10 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </article>
          ))
        ) : (
          <p className="text-center py-20 text-[var(--muted-color)]">
            Próximamente más artículos. ¡Vuelve pronto!
          </p>
        )}
      </div>
    </div>
  );
}
