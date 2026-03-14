import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { importCsv } from '@/lib/csv-import';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const isAdmin = (session.user as { isAdmin?: boolean }).isAdmin;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const csvPath = body.filePath || process.env.IMPORT_CSV_PATH || './listino_completo.csv';
    const resolvedPath = path.resolve(csvPath);

    console.log(`🔵 Avvio import CSV: ${resolvedPath}`);

    const result = await importCsv(resolvedPath);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('🔴 POST /api/import-csv error:', message);
    return NextResponse.json({ error: 'Errore import', details: message }, { status: 500 });
  }
}
