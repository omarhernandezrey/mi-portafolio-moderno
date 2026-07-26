export const LEAD_STATUSES = [
  'new',
  'contacted',
  'paid',
  'cold',
  'lost',
  'archived',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_OPTIONS: ReadonlyArray<{ value: LeadStatus; label: string }> = [
  { value: 'new', label: 'Pendiente' },
  { value: 'contacted', label: 'En Curso' },
  { value: 'paid', label: 'Completado' },
  { value: 'cold', label: 'Sin Acción' },
  { value: 'lost', label: 'Perdido' },
  { value: 'archived', label: 'Archivado' },
];

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}

export type LeadType = 'client' | 'recruiter' | 'other';

export interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  type: LeadType | string | null;
  service_requested: string | null;
  budget: string | null;
  timeline: string | null;
  status: LeadStatus | string | null;
  industry: string | null;
  notes: string | null;
  conversation_id: string | null;
  created_at: string;
  updated_at?: string | null;
}

export const TICKET_STATUSES = [
  'open',
  'in_progress',
  'waiting_client',
  'closed',
] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus | string;
  priority: TicketPriority | string;
  lead_id: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  lead?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    company?: string | null;
    service_requested?: string | null;
  } | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender: 'admin' | 'client';
  content: string;
  attachments?: string[] | null;
  created_at: string;
}

export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'cancelled'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface Invoice {
  id: string;
  lead_id: string | null;
  number: string;
  status: InvoiceStatus | string;
  total: number;
  subtotal?: number;
  currency: string;
  due_date: string | null;
  pdf_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 20;
