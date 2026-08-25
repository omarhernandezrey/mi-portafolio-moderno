import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const blogDirectory = path.join(process.cwd(), 'content/blog');

export interface PostMetadata {
  title: string;
  /** Título corto (≤60 chars) para <title> y OG/Twitter; si falta, se usa `title`. */
  seoTitle?: string;
  slug: string;
  date: string;
  /** Fecha de última edición sustancial (ISO). Si falta, se asume igual a `date`. */
  updated?: string;
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

export interface FaqItem {
  question: string;
  answer: string;
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [texto](url) -> texto
    .replace(/\*\*([^*]+)\*\*/g, '$1') // **bold**
    .replace(/\*([^*]+)\*/g, '$1') // *italic*
    .replace(/`([^`]+)`/g, '$1') // `code`
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrae pares pregunta/respuesta de la sección "## Preguntas Frecuentes" / "## FAQ"
 * del MDX crudo del post, si existe, para generar structured data FAQPage.
 * No confía en que exista: si no hay sección FAQ reconocible, retorna null.
 */
export function getFaqSection(content: string): FaqItem[] | null {
  const sectionMatch = content.match(/(?:^|\n)##\s+.*(?:FAQ|Frecuentes|Frequently\s+Asked\s+Questions)[^\n]*\n([\s\S]*?)(?=\n##\s|\n---\s*\n|$)/i);
  if (!sectionMatch) return null;

  const body = sectionMatch[1];
  const items: FaqItem[] = [];

  // Formato principal: "### Pregunta" seguido de uno o más párrafos de respuesta.
  const questionBlocks = body.split(/\n###\s+/).slice(1); // el primer trozo es texto previo al primer ###
  for (const block of questionBlocks) {
    const newlineIdx = block.indexOf('\n');
    if (newlineIdx === -1) continue;
    const question = cleanMarkdown(block.slice(0, newlineIdx));
    const answer = cleanMarkdown(block.slice(newlineIdx + 1));
    if (question && answer) items.push({ question, answer });
  }
  if (items.length > 0) return items;

  // Formato alterno: "**Q: Pregunta**" en una línea, "A: Respuesta" en la siguiente.
  const boldPairs = body.matchAll(/\*\*Q:\s*([^*]+?)\*\*\s*\n\s*A:\s*(.+)/gi);
  for (const match of boldPairs) {
    const question = cleanMarkdown(match[1]);
    const answer = cleanMarkdown(match[2]);
    if (question && answer) items.push({ question, answer });
  }

  return items.length > 0 ? items : null;
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
