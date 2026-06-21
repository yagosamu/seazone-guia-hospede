export type Period = 'morning' | 'afternoon' | 'evening'
export type Activity = { period: Period; title: string; description: string; place?: string; from_guide?: boolean }
export type Day = { day_number: number; title: string; activities: Activity[] }
export type Itinerary = { intro: string; days: Day[]; closing_tip?: string }
export type WhoTravels = 'couple' | 'family_with_kids' | 'solo' | 'friends'
export type Vibe = 'relax' | 'adventure' | 'gastronomy' | 'culture' | 'nightlife'
export type ItineraryRequest = { days: 1 | 2 | 3 | 4; who: WhoTravels; vibe: Vibe; restrictions?: string }
