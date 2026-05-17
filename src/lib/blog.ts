import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogDirectory = path.join(process.cwd(), 'content/blog');

export interface PostMetadata {
  title: string;
  slug: string;
  date: string;
  description: string;
  tags: string[];
  image?: string;
  author: string;
  lang?: 'es' | 'en';
  readingTime?: number;
  wordCount?: number;
}

export interface Post extends PostMetadata {
  content: string;
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

function countWords(content: string): number {
  return content.trim().split(/\s+/).length;
}

export async function getAllPosts(): Promise<PostMetadata[]> {
  if (!fs.existsSync(blogDirectory)) return [];

  const fileNames = fs.readdirSync(blogDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.mdx'))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, '');
      const fullPath = path.join(blogDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        readingTime: estimateReadingTime(content),
        wordCount: countWords(content),
        lang: (data as PostMetadata).lang || 'es',
        ...(data as Omit<PostMetadata, 'slug' | 'readingTime' | 'wordCount'>),
      };
    });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(blogDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    content,
    readingTime: estimateReadingTime(content),
    wordCount: countWords(content),
    lang: (data as PostMetadata).lang || 'es',
    ...(data as Omit<PostMetadata, 'slug' | 'readingTime' | 'wordCount'>),
  };
}

export function getRelatedPosts(currentSlug: string, currentTags: string[], allPosts: PostMetadata[], limit = 3): PostMetadata[] {
  const currentLang = allPosts.find(p => p.slug === currentSlug)?.lang;
  const tagsLower = currentTags.map(t => t.toLowerCase());
  
  const scored = allPosts
    .filter(p => p.slug !== currentSlug)
    .map(p => {
      const tagScore = p.tags.filter(t => tagsLower.includes(t.toLowerCase())).length;
      const langBonus = (currentLang && p.lang === currentLang) ? 1 : 0;
      return { post: p, score: tagScore + langBonus };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);

  if (scored.length < limit) {
    const existingSlugs = new Set(scored.map(p => p.slug));
    const fallback = allPosts
      .filter(p => p.slug !== currentSlug && !existingSlugs.has(p.slug))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, limit - scored.length);
    return [...scored, ...fallback];
  }

  return scored;
}
