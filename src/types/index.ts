export type {
  Lead,
  LeadStatus,
  LeadType,
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketMessage,
  Invoice,
  InvoiceStatus,
  PaginatedResult,
} from '@/lib/admin/types';

export {
  LEAD_STATUSES,
  LEAD_STATUS_OPTIONS,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  INVOICE_STATUSES,
  DEFAULT_PAGE_SIZE,
  isLeadStatus,
} from '@/lib/admin/types';

export type { AdminRole } from '@/lib/admin/roles';
export { ADMIN_ROLES, isAdminRole, hasMinRole } from '@/lib/admin/roles';
