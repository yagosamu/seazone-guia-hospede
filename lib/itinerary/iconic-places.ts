import type { Vibe } from './types'

type CityAllowlist = { cardinal: string[]; byVibe: Partial<Record<Vibe, string[]>> }

export const ICONIC_PLACES: Record<string, CityAllowlist> = {
  'Florianópolis': { cardinal: ['Lagoa da Conceição', 'Mercado Público de Florianópolis', 'Centro Histórico (Praça XV)'], byVibe: { relax: ['Praia da Daniela (mar calmo)', 'Praia do Forte', 'Praia da Lagoinha do Leste (vista preservada)'], adventure: ['Praia da Joaquina (surf e sandboard)', 'Trilha da Lagoinha do Leste', 'Morro da Cruz (mirante)'], gastronomy: ['Box 32 no Mercado Público (frutos do mar)', 'Armazém Vieira (boteco histórico)', 'Restaurantes de ostra em Ribeirão da Ilha'], culture: ['Catedral Metropolitana', 'Forte de Santana', 'Casa de Câmara e Cadeia'], nightlife: ['Centrinho da Lagoa da Conceição', 'Bares na Praia Mole'] } },
  'Rio de Janeiro': { cardinal: ['Cristo Redentor', 'Pão de Açúcar', 'Praia de Ipanema', 'Praia de Copacabana'], byVibe: { relax: ['Lagoa Rodrigo de Freitas', 'Jardim Botânico', 'Parque Lage'], adventure: ['Trilha da Pedra Bonita', 'Pedra do Telégrafo', 'Praia da Joatinga'], gastronomy: ['Confeitaria Colombo (centro histórico)', 'Bar Urca (frente para a baía)', 'Cobal do Humaitá (bares e restaurantes)'], culture: ['Museu do Amanhã', 'Theatro Municipal', 'Museu de Arte Moderna (MAM)'], nightlife: ['Arcos da Lapa (samba e bares)', 'Pedra do Sal (roda de samba)', 'Botafogo (cervejarias e bares alternativos)'] } },
  Gramado: { cardinal: ['Lago Negro', 'Rua Coberta'], byVibe: { relax: ['Lago Negro (pedalinho e caminhada)', 'Parque Knorr'], adventure: ['Snowland', 'Mini Mundo'], gastronomy: ['Vale dos Vinhedos (próximo, Bento Gonçalves)', 'Chocolataria Caracol', 'Café Bistrô Pedacinho do Céu'], culture: ['Museu Hollywood Dream Cars', 'Catedral de Pedra (Canela, próximo)'] } },
  'Balneário Camboriú': { cardinal: ['Praia Central', 'Parque Unipraias (teleférico)'], byVibe: { relax: ['Praia de Laranjeiras', 'Praia do Estaleirinho'], adventure: ['Parque Unipraias (tirolesa e teleférico)', 'Praia do Buraco', 'Morro do Careca'], gastronomy: ['Pier 66', 'Calçadão da Avenida Atlântica (variedade de restaurantes)'], culture: ['Cristo Luz'], nightlife: ['Calçadão da Avenida Atlântica', 'Music Park', 'Praia Brava (bares e baladas)'] } },
}

export function getCityAllowlist(city: string, vibe: Vibe): { cardinal: string[]; vibe: string[] } | null {
  const entry = ICONIC_PLACES[city]
  return entry ? { cardinal: entry.cardinal, vibe: entry.byVibe[vibe] ?? [] } : null
}
