import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateInvoicePDF, InvoiceData } from '@/lib/invoices/generate';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';

const schema = z.object({
  lead_id: z.string().uuid(),
  due_date: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
  currency: z.string().default('USD'),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { lead_id, due_date, items, currency, notes } = result.data;

    const { data: lead, error: leadError } = await supabaseServer
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    const { count } = await supabaseServer
      .from('invoices')
      .select('*', { count: 'exact', head: true });
    
    const invoiceNumber = `INV-${new Date().getFullYear()}-${( (count || 0) + 1).toString().padStart(3, '0')}`;

    const calculatedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));
    const subtotal = calculatedItems.reduce((acc, item) => acc + item.total, 0);
    const total = subtotal;

    const pdfData: InvoiceData = {
      number: invoiceNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: due_date,
      clientName: lead.name || 'Cliente',
      clientEmail: lead.email || '',
      clientCompany: lead.company || undefined,
      items: calculatedItems,
      subtotal,
      tax: 0,
      total,
      currency,
      notes
    };

    const pdfBytes = await generateInvoicePDF(pdfData);

    const fileName = `factura_${invoiceNumber}_${Date.now()}.pdf`;
    const { data: uploadData } = await supabaseServer
      .storage
      .from('invoices')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    const pdfUrl = uploadData ? uploadData.path : fileName;

    const { data: invoice, error: dbError } = await supabaseServer
      .from('invoices')
      .insert({
        lead_id,
        number: invoiceNumber,
        due_date,
        items: calculatedItems,
        subtotal,
        total,
        currency,
        status: 'sent',
        pdf_url: pdfUrl,
        notes
      })
      .select()
      .single();

    if (dbError) throw dbError;

    await supabaseServer
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', lead_id);

    await writeAuditLog(auth.actor, {
      action: 'invoice.generate',
      resourceType: 'invoice',
      resourceId: invoice.id,
      metadata: { number: invoiceNumber, lead_id, total, currency },
    });

    return NextResponse.json(invoice);

  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
