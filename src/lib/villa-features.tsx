import {
  Wifi, Wind, Waves, Umbrella, Sailboat, Droplets,
  Dumbbell, Flame, Car, PawPrint, Anchor, Leaf,
  UtensilsCrossed, Tv, Bed,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface FeatureDef {
  label: string
  Icon: LucideIcon
}

export const VILLA_FEATURES: Record<string, FeatureDef> = {
  wifi:         { label: 'Internet',         Icon: Wifi },
  ac:           { label: 'Air Conditioning', Icon: Wind },
  pool:         { label: 'Swimming Pool',    Icon: Waves },
  beach_access: { label: 'Close to Beach',  Icon: Umbrella },
  ocean_front:  { label: 'Ocean Front',     Icon: Sailboat },
  hot_tub:      { label: 'Hot Tub',         Icon: Droplets },
  gym:          { label: 'Gym',             Icon: Dumbbell },
  bbq:          { label: 'BBQ / Grill',     Icon: Flame },
  parking:      { label: 'Parking',         Icon: Car },
  pet_friendly: { label: 'Pet Friendly',    Icon: PawPrint },
  boat_dock:    { label: 'Boat Dock',       Icon: Anchor },
  garden:       { label: 'Garden',          Icon: Leaf },
  full_kitchen: { label: 'Full Kitchen',    Icon: UtensilsCrossed },
  smart_tv:     { label: 'Smart TV',        Icon: Tv },
  king_beds:    { label: 'King Beds',       Icon: Bed },
}

export const FEATURE_KEYS = Object.keys(VILLA_FEATURES)
