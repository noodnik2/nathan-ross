export function pageCount(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize))
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const clampedPage = Math.min(Math.max(page, 1), pageCount(items.length, pageSize))
  const start = (clampedPage - 1) * pageSize
  return items.slice(start, start + pageSize)
}
