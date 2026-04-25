import fs from 'fs';
import path from 'path';

export interface ProposalData {
  customer_name: string;
  project_name: string;
  industry: string;
  pain_points: string;
  price: string;
  timeline: string;
  date: string;
  calcom_url: string;
}

export function getProposalTemplate(industry: string): string {
  const templatesDir = path.join(process.cwd(), 'public/docs/templates');
  
  // Mapping industry to template filename
  const mapping: Record<string, string> = {
    'startup': 'mvp-saas.md',
    'saas': 'mvp-saas.md',
    'ecommerce': 'ecommerce.md',
    'retail': 'ecommerce.md',
    'landing': 'landing-page.md',
    'conversion': 'landing-page.md',
    'automation': 'automation.md',
    'operations': 'automation.md',
    'clinica-dental': 'clinica-dental.md',
    'health': 'clinica-dental.md',
    'medical': 'clinica-dental.md',
  };

  const filename = mapping[industry.toLowerCase()] || 'propuesta-template.md';
  const filePath = filename === 'propuesta-template.md' 
    ? path.join(process.cwd(), 'public/docs', filename)
    : path.join(templatesDir, filename);

  if (!fs.existsSync(filePath)) {
    // Fallback to generic if specific doesn't exist
    return fs.readFileSync(path.join(process.cwd(), 'public/docs/propuesta-template.md'), 'utf-8');
  }

  return fs.readFileSync(filePath, 'utf-8');
}

export function generateProposalMarkdown(data: ProposalData): string {
  let template = getProposalTemplate(data.industry);

  // Replace placeholders
  const replacements: Record<string, string> = {
    '{{customer_name}}': data.customer_name,
    '{{project_name}}': data.project_name,
    '{{industry}}': data.industry,
    '{{pain_points}}': data.pain_points,
    '{{price}}': data.price,
    '{{timeline}}': data.timeline,
    '{{date}}': data.date,
    '{{calcom_url}}': data.calcom_url,
    '{{objective}}': data.pain_points, // For generic template
    '{{scope_items}}': '- Desarrollo de plataforma web\n- Integración con base de datos\n- Optimización SEO', // Default scope
    '{{total_weeks}}': data.timeline.includes('semanas') ? data.timeline : '4 semanas',
    '{{total_price}}': data.price
  };

  Object.entries(replacements).forEach(([key, value]) => {
    template = template.split(key).join(value);
  });

  return template;
}
