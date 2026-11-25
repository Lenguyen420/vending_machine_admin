import { useSearchParams } from 'react-router-dom'
export function useFilters() {
  const [params, setParams] = useSearchParams()
  function set(key: string, value?: string) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }
  return { get: (key: string) => params.get(key) ?? undefined, set }
}
const normalize = (value: string) =>
  value.toLocaleLowerCase('vi').normalize('NFD').replace(/\p{M}/gu, '').replaceAll('đ', 'd')
export function matches(query: string | undefined, ...fields: (string | undefined)[]) {
  return !query || normalize(fields.filter(Boolean).join(' ')).includes(normalize(query.trim()))
}
