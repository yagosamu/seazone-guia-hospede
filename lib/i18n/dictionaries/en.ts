import type { Dictionary } from '../types'
import { pt } from './pt'

export const en = {
  ...pt,
  languageSwitcher: { label: 'Language', pt: 'PT', en: 'EN', es: 'ES' },
  hero: { ...pt.hero, welcomeTo: 'Welcome to', checkIn: 'Check-in', checkOut: 'Check-out', access: 'Access', accessLabels: { smart_lock: 'Digital lock', keybox: 'Key box', reception: '24-hour reception', in_person: 'In-person handoff', other: 'Other access type' } },
  overview: { ...pt.overview, eyebrow: 'About the property', amenities: 'Amenities', title: '{type} with {bedrooms} for up to {guests}', bedrooms: '{n} bedrooms', bathrooms: '{n} bathrooms', guests: '{n} guests' },
  access: { ...pt.access, eyebrow: 'Connection and access', title: 'Everything you need to arrive', entry: 'Entry', parking: 'Parking', code: 'code', network: 'Network', password: 'Password', copy: 'Copy', copied: 'Copied' },
  rules: { ...pt.rules, eyebrow: 'Stay rules', title: 'What to expect at this property', description: 'Check-in from {checkIn} and check-out by {checkOut}.', children: ['Children welcome', 'Not suitable for children'], babies: ['Babies welcome', 'Not suitable for babies'], pet: ['Pets allowed', 'Pets are not allowed'], smoking: ['Smoking allowed', 'Smoking is not allowed'], events: ['Events allowed', 'Events are not allowed'] },
  welcome: { eyebrow: 'Welcome' },
  chat: { ...pt.chat, launcher: 'Assistant', title: 'Seazone Assistant', close: 'Close', emptyTitle: 'How can I help with your stay?', emptyDescription: 'Ask about WiFi, rules, times or local tips. I answer using this property’s information.', placeholder: 'Ask about the property...', footer: 'Answers based on this property’s information. For urgent matters, contact {hostName}.', wifi: 'WiFi password', checkin: 'Check-in time', pet: 'Can I bring a pet?', food: 'Nearby restaurants', error: 'I could not answer. Please try again shortly.', retry: 'Try again' },
  contact: { ...pt.contact, eyebrow: 'Contact and address', title: 'Your host is here to help', description: 'For any questions during your stay, contact the person who looks after the property.', host: 'Host', address: 'Address', whatsapp: 'Message on WhatsApp', maps: 'View on Google Maps' },
  neighborhood: { ...pt.neighborhood, eyebrow: 'Nearby', title: 'What is worth exploring nearby', description: 'Great places nearby, carefully selected.', restaurants: 'Restaurants', attractions: 'Attractions', essentials: 'Essentials', selected: '{n} selected options', points: '{n} highlights', essentialSubtitle: 'Useful neighborhood services', seasonalTip: 'Seasonal tip' },
} satisfies Dictionary
