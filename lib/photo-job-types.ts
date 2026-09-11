export type PhotoJob = {
  id: string;
  source: string;
  result: string | null;
  state: 'submitting' | 'processing' | 'completed' | 'failed' | 'uncertain';
  error: string | null;
  createdAt: string;
};

export function movePhoto<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || to < 0 || from >= items.length || to >= items.length || from === to) return items;
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
