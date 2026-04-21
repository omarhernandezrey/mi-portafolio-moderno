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
