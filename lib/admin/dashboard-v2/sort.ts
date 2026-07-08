export function sortByPreference<T extends { id: string }>(
  items: T[],
  order: string[],
  pinned: string[],
): T[] {
  const pinnedSet = new Set(pinned);
  const orderIndex = new Map(order.map((id, index) => [id, index]));

  return [...items].sort((a, b) => {
    const aPinned = pinnedSet.has(a.id);
    const bPinned = pinnedSet.has(b.id);
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    const ai = orderIndex.get(a.id) ?? 999;
    const bi = orderIndex.get(b.id) ?? 999;
    return ai - bi;
  });
}
