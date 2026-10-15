export const formatBRL = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0)
}

export const parseBRL = (valStr: string): number => {
  if (!valStr) return 0
  const clean = valStr.replace(/[^\d,-]/g, '').replace(',', '.')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
}

export const formatPhone = (val: string): string => {
  const digits = val.replace(/\D/g, '')
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim()
  }
  return digits
    .replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    .slice(0, 15)
    .trim()
}
