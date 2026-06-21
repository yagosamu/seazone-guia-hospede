import { describe, expect, it } from 'vitest'
import { formatAddress, googleMapsUrl, whatsappUrl } from '@/lib/format'

const address = {
  street: 'Rua X', number: '100', complement: 'Apto 1', neighborhood: 'Centro',
  city: 'Floripa', state: 'SC', postal_code: '88036-001',
}

describe('format helpers', () => {
  it('formats addresses with complement and without an em dash', () => {
    const value = formatAddress(address)
    expect(value).toContain('Apto 1')
    expect(value).not.toContain('—')
  })

  it('omits a null complement', () => {
    expect(formatAddress({ ...address, complement: null })).not.toContain('Apto')
  })

  it('normalizes WhatsApp phone digits', () => {
    expect(whatsappUrl('+55 (48) 99123-4567')).toBe('https://wa.me/5548991234567')
  })

  it('builds an encoded Google Maps search URL', () => {
    expect(googleMapsUrl(address)).toContain('google.com/maps/search')
    expect(googleMapsUrl(address)).toContain(encodeURIComponent('Floripa'))
  })
})
