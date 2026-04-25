import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateInvoicePDF, InvoiceData } from '@/lib/invoices/generate';
import { z } from 'zod';

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
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { lead_id, due_date, items, currency, notes } = result.data;

    // 1. Obtener datos del lead
    const { data: lead, error: leadError } = await supabaseServer
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    // 2. Generar número de factura automático (Nro de facturas totales + 1)
    const { count } = await supabaseServer
      .from('invoices')
      .select('*', { count: 'exact', head: true });
    
    const invoiceNumber = `INV-${new Date().getFullYear()}-${( (count || 0) + 1).toString().padStart(3, '0')}`;

    // 3. Calcular totales
    const calculatedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.price
    }));
    const subtotal = calculatedItems.reduce((acc, item) => acc + item.total, 0);
    const total = subtotal; // Impuestos 0 por ahora

    // 4. Generar PDF
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

    // 5. Subir a Supabase Storage
    const fileName = `factura_${invoiceNumber}_${Date.now()}.pdf`;
    const { data: uploadData } = await supabaseServer
      .storage
      .from('invoices')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    const pdfUrl = uploadData ? uploadData.path : fileName;

    // 6. Guardar en base de datos
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

    // 7. Actualizar estado del lead
    await supabaseServer
      .from('leads')
      .update({ status: 'facturado' })
      .eq('id', lead_id);

    return NextResponse.json(invoice);

  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
