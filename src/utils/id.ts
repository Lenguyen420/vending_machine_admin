export const id = () => crypto.randomUUID()
export const shortId = (value: string) =>
  value.startsWith('DEMO-') ? value : value.slice(0, 8).toUpperCase()
