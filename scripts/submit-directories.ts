import { getAllPosts, getPostBySlug } from '../src/lib/blog';
import { notifyTelegram } from '../src/lib/chatbot/telegram';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DEV_TO_API_KEY = process.env.DEV_TO_API_KEY;
const HASHNODE_TOKEN = process.env.HASHNODE_TOKEN;
const HASHNODE_PUBLICATION_ID = process.env.HASHNODE_PUBLICATION_ID;
const BASE_URL = 'https://omarhernandezrey.com';

async function postToDevTo(post: any) {
  if (!DEV_TO_API_KEY) {
    console.warn('⚠️ DEV_TO_API_KEY no encontrada, saltando DEV.to');
    return null;
  }

  const response = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': DEV_TO_API_KEY,
    },
    body: JSON.stringify({
      article: {
        title: post.title,
        body_markdown: post.content,
        published: true,
        canonical_url: `${BASE_URL}/blog/${post.slug}`,
        description: post.description,
        tags: post.tags,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('❌ Error DEV.to:', data);
    return null;
  }
  return data.url;
}

async function postToHashnode(post: any) {
  if (!HASHNODE_TOKEN || !HASHNODE_PUBLICATION_ID) {
    console.warn('⚠️ HASHNODE_TOKEN o PUBLICATION_ID no encontradas, saltando Hashnode');
    return null;
  }

  const query = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          url
        }
      }
    }
  `;

  const response = await fetch('https://gql.hashnode.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': HASHNODE_TOKEN,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          title: post.title,
          contentMarkdown: post.content,
          publicationId: HASHNODE_PUBLICATION_ID,
          originalArticleURL: `${BASE_URL}/blog/${post.slug}`,
          tags: post.tags.map((tag: string) => ({ name: tag, slug: tag.toLowerCase().replace(/ /g, '-') })),
        },
      },
    }),
  });

  const data = await response.json();
  if (data.errors) {
    console.error('❌ Error Hashnode:', data.errors);
    return null;
  }
  return data.data.publishPost.post.url;
}

async function main() {
  console.log('🚀 Iniciando auto-submit de contenidos...');
  
  const posts = await getAllPosts();
  if (posts.length === 0) {
    console.log('📭 No hay posts para procesar.');
    return;
  }

  // Tomamos el post más reciente
  const latestPostMeta = posts[0];
  const post = await getPostBySlug(latestPostMeta.slug);

  if (!post) {
    console.error('❌ No se pudo cargar el contenido del post:', latestPostMeta.slug);
    return;
  }

  // Verificar si es reciente (últimos 30 días) para evitar spam de posts viejos en cada corrida
  const postDate = new Date(post.date);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  if (postDate < thirtyDaysAgo) {
    console.log(`⏭️ Post "${post.title}" es antiguo (${post.date}), saltando.`);
    return;
  }

  console.log(`📝 Procesando post: "${post.title}"`);

  const results = [];

  // Cross-post a DEV.to
  const devToUrl = await postToDevTo(post);
  if (devToUrl) {
    results.push(`DEV.to: ${devToUrl}`);
    console.log('✅ Publicado en DEV.to');
  }

  // Cross-post a Hashnode
  const hashnodeUrl = await postToHashnode(post);
  if (hashnodeUrl) {
    results.push(`Hashnode: ${hashnodeUrl}`);
    console.log('✅ Publicado en Hashnode');
  }

  if (results.length > 0) {
    const message = `📢 *Auto-submit completado*\n\nPost: "${post.title}"\n\n${results.join('\n')}`;
    await notifyTelegram(message);
  } else {
    console.log('ℹ️ No se realizaron publicaciones nuevas.');
  }
}

main().catch(console.error);
