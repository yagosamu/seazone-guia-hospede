import type { Address } from '@/db/schemas/property'

export function formatAddress(address: Address): string {
  const complement = address.complement ? `, ${address.complement}` : ''

  return `${address.street}, ${address.number}${complement}, ${address.neighborhood}, ${address.city}/${address.state}, ${address.postal_code}`
}

export function whatsappUrl(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`
}

export function googleMapsUrl(address: Address): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(address))}`
}
