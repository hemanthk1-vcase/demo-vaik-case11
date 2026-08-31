// Sequential ID generator for VakilCase records.
// Format: VC-{PREFIX}-YYYY-####  e.g. VC-CL-2026-0001
// Scans existing records' IDs and picks the next free sequence number,
// so it stays correct even if earlier records were deleted.

export function nextSeqId(prefix, existingItems, idField, year) {
  const y = year || new Date().getFullYear();
  const used = new Set();
  (existingItems || []).forEach((it) => {
    const v = it?.data?.[idField] || it?.[idField];
    if (typeof v === 'string' && v) used.add(v);
  });
  let n = 1;
  let id = `VC-${prefix}-${y}-${String(n).padStart(4, '0')}`;
  while (used.has(id)) {
    n += 1;
    id = `VC-${prefix}-${y}-${String(n).padStart(4, '0')}`;
  }
  return id;
}

export const currentYear = () => new Date().getFullYear();