import type { Dictionary } from '../types'
import { pt } from './pt'

export const es = {
  ...pt,
  languageSwitcher: { label: 'Idioma', pt: 'PT', en: 'EN', es: 'ES' },
  hero: { ...pt.hero, welcomeTo: 'Bienvenido a', checkIn: 'Check-in', checkOut: 'Check-out', access: 'Acceso', accessLabels: { smart_lock: 'Cerradura digital', keybox: 'Caja de llaves', reception: 'Recepción 24 horas', in_person: 'Entrega presencial', other: 'Otro tipo de acceso' } },
  overview: { ...pt.overview, eyebrow: 'Sobre el alojamiento', amenities: 'Comodidades', title: '{type} con {bedrooms} para hasta {guests}', bedrooms: '{n} habitaciones', bathrooms: '{n} baños', guests: '{n} huéspedes' },
  access: { ...pt.access, eyebrow: 'Conexión y acceso', title: 'Todo lo que necesitas para llegar', entry: 'Entrada', parking: 'Estacionamiento', code: 'código', network: 'Red', password: 'Contraseña', copy: 'Copiar', copied: 'Copiado' },
  rules: { ...pt.rules, eyebrow: 'Reglas de la estancia', title: 'Qué esperar de este alojamiento', description: 'Check-in desde {checkIn} y check-out hasta {checkOut}.', children: ['Niños bienvenidos', 'No apto para niños'], babies: ['Bebés bienvenidos', 'No apto para bebés'], pet: ['Mascotas permitidas', 'No se permiten mascotas'], smoking: ['Se permite fumar', 'No se permite fumar'], events: ['Eventos permitidos', 'No se permiten eventos'] },
  welcome: { eyebrow: 'Bienvenida' },
  chat: { ...pt.chat, launcher: 'Asistente', title: 'Asistente Seazone', close: 'Cerrar', emptyTitle: '¿Cómo puedo ayudar con tu estancia?', emptyDescription: 'Pregunta sobre WiFi, reglas, horarios o consejos locales.', placeholder: 'Pregunta sobre el alojamiento...', footer: 'Respuestas basadas en la información de este alojamiento. Para urgencias, habla con {hostName}.', wifi: 'Contraseña del WiFi', checkin: 'Horario de check-in', pet: '¿Puedo llevar mascota?', food: 'Restaurantes cerca', error: 'No pude responder. Inténtalo de nuevo pronto.', retry: 'Intentar de nuevo' },
  contact: { ...pt.contact, eyebrow: 'Contacto y dirección', title: 'Cuenta con tu anfitrión', description: 'Para cualquier duda durante la estancia, habla con quien cuida del alojamiento.', host: 'Anfitrión', address: 'Dirección', whatsapp: 'Hablar por WhatsApp', maps: 'Ver en Google Maps' },
  neighborhood: { ...pt.neighborhood, eyebrow: 'Alrededores', title: 'Qué vale la pena conocer cerca', description: 'Los mejores lugares cerca, seleccionados para ti.', restaurants: 'Restaurantes', attractions: 'Atracciones', essentials: 'Esenciales', selected: '{n} opciones seleccionadas', points: '{n} lugares imprescindibles', essentialSubtitle: 'Servicios indispensables en el barrio', seasonalTip: 'Consejo de temporada' },
} satisfies Dictionary
