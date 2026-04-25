import { Client } from '@notionhq/client';
import { serverEnv } from '@/config/env';
import { Lead } from './parser';

/**
 * Envía un lead a la base de datos de Notion configurada.
 */
export async function pushLeadToNotion(lead: Lead, leadId: string, siteUrl: string) {
  const { NOTION_API_KEY, NOTION_DATABASE_ID } = serverEnv;

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return; // Integración desactivada
  }

  const notion = new Client({ auth: NOTION_API_KEY });
  const conversationUrl = `${siteUrl}/admin/leads/${leadId}`;

  try {
    await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        'Nombre': {
          title: [{ text: { content: lead.name } }]
        },
        'Email': {
          email: lead.email
        },
        'Tipo': {
          select: { name: lead.type === 'client' ? 'Cliente' : lead.type === 'recruiter' ? 'Reclutador' : 'Otro' }
        },
        'Servicio': {
          rich_text: [{ text: { content: lead.service_requested || 'N/A' } }]
        },
        'Presupuesto': {
          rich_text: [{ text: { content: lead.budget || 'N/A' } }]
        },
        'Estado': {
          select: { name: 'Nuevo' }
        },
        'Conversación URL': {
          url: conversationUrl
        },
        'Fecha': {
          date: { start: new Date().toISOString() }
        },
        'Notas': {
          rich_text: [{ text: { content: lead.notes || '' } }]
        }
      }
    });
  } catch (error) {
    console.error('Error pushing lead to Notion:', error);
  }
}

/**
 * Actualiza el estado de un lead en Notion.
 */
export async function updateLeadStatusInNotion(email: string, status: string) {
  const { NOTION_API_KEY, NOTION_DATABASE_ID } = serverEnv;
  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) return;

  const notion = new Client({ auth: NOTION_API_KEY });

  try {
    // Buscar la página por email
    // @ts-expect-error: Notion type mismatch in query method
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      filter: {
        property: 'Email',
        email: { equals: email }
      }
    });

    if (response.results.length > 0) {
      const pageId = response.results[0].id;
      await notion.pages.update({
        page_id: pageId,
        properties: {
          'Estado': {
            select: { name: status }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error updating lead status in Notion:', error);
  }
}
