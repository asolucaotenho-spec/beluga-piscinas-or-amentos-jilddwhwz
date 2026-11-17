import pb from '@/lib/pocketbase/client'
import type { Setting } from '@/types/beluga'

export const DEFAULT_WHATSAPP_NUMBER = '48 99110-4301'

export interface Branding {
  company_name?: string
  phone?: string
  whatsapp_number?: string
  website?: string
  instagram?: string
  factory_location?: string
  contact_email?: string
  slogan?: string
}

/**
 * Busca o número base de WhatsApp da equipe comercial nas configurações
 * (settings.key='branding' → campo `whatsapp_number`). Sem login/erro, cai
 * no número padrão 48 99110-4301.
 */
export async function getTeamWhatsappNumber(): Promise<string> {
  try {
    const rec = await pb.collection('settings').getFirstListItem<Setting>(`key = 'branding'`)
    const branding = JSON.parse(rec.value || '{}') as Branding
    const num = (branding.whatsapp_number || branding.phone || '').trim()
    return num || DEFAULT_WHATSAPP_NUMBER
  } catch {
    return DEFAULT_WHATSAPP_NUMBER
  }
}

/** Formata o número base da equipe como "(48) 99110-4301" a partir dos dígitos. */
function formatTeamNumber(raw: string): string {
  const d = raw.replace(/\D/g, '')
  const local = d.startsWith('55') && d.length > 11 ? d.slice(2) : d
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`
  return raw
}

/**
 * Monta o link wa.me para o cliente, incluindo na mensagem o contato da
 * equipe (número base configurado, padrão 48 99110-4301).
 */
export async function buildClientWhatsAppLink(
  clientPhone: string,
  extraMessage: string,
): Promise<string> {
  const teamNumber = await getTeamWhatsappNumber()
  const teamDigits = teamNumber.replace(/\D/g, '')
  const teamWaNumber = teamDigits.startsWith('55')
    ? teamDigits
    : teamDigits
      ? `55${teamDigits}`
      : ''

  const digits = (clientPhone || '').replace(/\D/g, '')
  const cleanPhone = digits.length >= 10 && !digits.startsWith('55') ? `55${digits}` : digits

  const message = encodeURIComponent(
    `${extraMessage}\n\nFale com a equipe Beluga Piscinas: ${formatTeamNumber(teamWaNumber)}`,
  )

  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${message}`
    : `https://wa.me/?text=${message}`
}
