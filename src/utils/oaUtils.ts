import type { OA } from "../mocks/mockOA";

export type OAFilters = {
  subject: string;
  level: string;
};

export function getLatestActiveByCode(items: OA[]): OA[] {
  const grouped = new Map<string, OA>();

  for (const oa of items) {
    if (oa.estado !== "ACTIVO") continue;

    const current = grouped.get(oa.codigo);
    if (!current || oa.version > current.version) {
      grouped.set(oa.codigo, oa);
    }
  }

  return Array.from(grouped.values());
}

export function applyFilters(items: OA[], filters: OAFilters): OA[] {
  return items.filter((oa) => {
    if (filters.subject && oa.asignatura !== filters.subject) return false;
    if (filters.level && oa.nivel !== filters.level) return false;
    return true;
  });
}
