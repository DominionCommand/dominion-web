export async function GET() {
  return Response.json({ ok: true, service: 'dominion-web', ts: new Date().toISOString() });
}
