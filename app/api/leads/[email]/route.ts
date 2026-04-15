import { buildLeadDossier } from '../../../../lib/lead-dossiers';

export async function GET(_request: Request, context: { params: Promise<{ email: string }> }) {
  const { email } = await context.params;
  const dossier = await buildLeadDossier(email);

  if (!dossier) {
    return Response.json({ ok: false, error: 'Lead dossier not found.' }, { status: 404 });
  }

  return Response.json({
    ok: true,
    dossier,
  });
}
