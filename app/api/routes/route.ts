import { buildRouteInventory } from '../../../lib/routes';

export async function GET() {
  const inventory = buildRouteInventory();

  return Response.json({
    ok: true,
    ...inventory,
    routes: inventory.pages.map((route) => route.href),
    api: inventory.api.map((route) => route.href),
  });
}
