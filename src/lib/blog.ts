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
    ...(data as Omit<PostMetadata, 'slug' | 'readingTime' | 'wordCount'>),
  };
}

export function getRelatedPosts(currentSlug: string, currentTags: string[], allPosts: PostMetadata[], limit = 3): PostMetadata[] {
  const tagsLower = currentTags.map(t => t.toLowerCase());
  return allPosts
    .filter(p => p.slug !== currentSlug)
    .map(p => ({
      post: p,
      score: p.tags.filter(t => tagsLower.includes(t.toLowerCase())).length,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ post }) => post);
}
