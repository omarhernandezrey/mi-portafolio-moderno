-- ════════════════════════════════════════════════════════════════════════════
-- Entrada de leads: origen explícito (T-25)
-- Fecha: 2026-11-17
--
-- Hasta ahora, de dónde vino un lead quedaba escondido en
-- `conversations.intent` — una tabla del chatbot que ya no existe (T-16/D-2)
-- y que `registerContactFormLead`/`/api/calculator` solo usaban para tener
-- algo de donde colgar el lead (`conversation_id`), no porque hubiera una
-- conversación real. Esta migración añade `source` directo en `leads` y
-- rellena las 41 filas existentes desde ese mismo `intent`:
-- `contact_form`/`budget_calculator` ya coinciden literalmente; el resto
-- (el chatbot retirado, sin intent) cae a `chatbot`. `conversation_id` NO se
-- toca: se conserva por histórico, tal como pide la ficha.

alter table public.leads add column if not exists source text;

update public.leads l
set source = coalesce(
  (select c.intent from public.conversations c where c.id = l.conversation_id),
  'chatbot'
)
where l.source is null;

-- A partir de aquí, un alta nueva sin `source` explícito cae a 'manual'
-- (el panel es la única vía que todavía no pasaba un origen).
alter table public.leads alter column source set default 'manual';

alter table public.leads drop constraint if exists leads_source_check;
alter table public.leads add constraint leads_source_check
  check (source in ('contact_form', 'budget_calculator', 'chatbot', 'manual'));
