import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateInvoicePDF, InvoiceData } from '@/lib/invoices/generate';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { dispatchEvent } from '@/lib/events/dispatcher';

const schema = z.object({
  lead_id: z.string().uuid(),
  due_date: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    price: z.number().nonnegative(),
  })).min(1),
  currency: z.string().min(3).max(3).transform((value) => value.toUpperCase()).default('USD'),
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

    const calculatedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));
    const subtotal = calculatedItems.reduce((acc, item) => acc + item.total, 0);
    const total = subtotal;

    const year = new Date().getFullYear();
    let invoiceNumber = '';
    let invoice: { id: string; number: string; pdf_url?: string | null } | null = null;

    for (let attempt = 0; attempt < 3 && !invoice; attempt++) {
      const { data: existingNumbers, error: numbersError } = await supabaseServer
        .from('invoices')
        .select('number')
        .like('number', `INV-${year}-%`);

      if (numbersError) throw numbersError;

      const maxSequence = (existingNumbers ?? []).reduce((max, row) => {
        const match = row.number?.match(/-(\d+)$/);
        return match ? Math.max(max, parseInt(match[1], 10)) : max;
      }, 0);

      invoiceNumber = `INV-${year}-${(maxSequence + 1).toString().padStart(3, '0')}`;

      const { data: inserted, error: dbError } = await supabaseServer
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
          pdf_url: null,
          notes
        })
        .select()
        .single();

      if (dbError) {
        if (dbError.code === '23505') continue;
        throw dbError;
      }

      invoice = inserted;
    }

    if (!invoice) {
      return NextResponse.json(
        { error: 'No se pudo asignar un número de factura. Intenta de nuevo.' },
        { status: 409 }
      );
    }

    const pdfData: InvoiceData = {
      number: invoice.number,
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

    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await generateInvoicePDF(pdfData);
    } catch (pdfError) {
      await supabaseServer.from('invoices').delete().eq('id', invoice.id);
      throw pdfError;
    }

    const fileName = `factura_${invoice.number}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseServer
      .storage
      .from('invoices')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError || !uploadData) {
      console.error('Invoice PDF upload error:', uploadError);
      await supabaseServer.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json(
        { error: 'No se pudo guardar el PDF de la factura' },
        { status: 500 }
      );
    }

    const { error: pdfUrlError } = await supabaseServer
      .from('invoices')
      .update({ pdf_url: uploadData.path })
      .eq('id', invoice.id);

    if (pdfUrlError) {
      console.error('Invoice pdf_url update error:', pdfUrlError);
    }
    invoice = { ...invoice, pdf_url: uploadData.path };

    await supabaseServer
      .from('leads')
      .update({ status: 'contacted' })
      .eq('id', lead_id);

    await writeAuditLog(auth.actor, {
      action: 'invoice.generate',
      resourceType: 'invoice',
      resourceId: invoice.id,
      metadata: { number: invoice.number, lead_id, total, currency },
    });

    await dispatchEvent('invoice.created', {
      id: invoice.id,
      number: invoice.number,
      lead_id,
      client_name: lead.name,
      client_email: lead.email,
      total,
      currency,
      status: 'sent',
    }).catch((error) =>
      console.error('dispatchEvent invoice.created error:', error)
    );

    return NextResponse.json(invoice);

  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
