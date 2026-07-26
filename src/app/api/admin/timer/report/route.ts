import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET() {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  try {
    const { data: rawReport, error } = await supabaseServer
      .from('time_entries')
      .select('project_id, duration_seconds')
      .not('stopped_at', 'is', null);

    if (error) throw error;

    const grouped: Record<string, number> = {};
    rawReport.forEach(row => {
      grouped[row.project_id] = (grouped[row.project_id] || 0) + (row.duration_seconds || 0);
    });

    const projectIds = Object.keys(grouped);
    if (projectIds.length === 0) return NextResponse.json([]);

    const { data: leads, error: leadsError } = await supabaseServer
      .from('leads')
      .select('id, name, company, budget')
      .in('id', projectIds);

    if (leadsError) throw leadsError;

    const report = leads.map(lead => ({
      ...lead,
      total_seconds: grouped[lead.id] || 0
    }));

    return NextResponse.json(report);
  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
