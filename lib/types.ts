// Tipos compartilhados entre frontend, API e engine de recomendação

export type AttackSpeed = "Slow" | "Normal" | "Fast" | "VeryFast"
export type WeaponRange = "Melee" | "Ranged"
export type WeightClass = "Light" | "Medium" | "Heavy"
export type Difficulty = "Easy" | "Medium" | "Hard"
export type Archetype =
  | "MeleeBerserker"
  | "TankBruiser"
  | "ElementalRanger"
  | "CriticalAssassin"
  | "SpellbladeHybrid"

export type ScalingGrade = "S" | "A" | "B" | "C" | "D" | "E"

export interface Weapon {
  id: string
  name: string
  category: string
  baseDamage: number
  elementalDamage: number
  scalingTable: Record<string, ScalingGrade>
  attackSpeed: AttackSpeed
  range: WeaponRange
  twoHanded: boolean
  maxRuneSlots: number
  maxGemSlots: number
  playstyleTags: string[]
  isUnique: boolean
  patchVersion: string
  needsReview: boolean
}

export interface ArmorSet {
  id: string
  name: string
  weightClass: WeightClass
  totalDefense: number
  resistances: Record<string, number>
  setBonusThreshold: number
  setBonusDescription: string | null
  synergyTags: string[]
  patchVersion: string
  needsReview: boolean
}

export interface Rune {
  id: string
  name: string
  effects: string[]
  elementalType: string | null
  triggerCondition: string
  cooldownSeconds: number | null
  stackLimit: number | null
  compatibleWeaponTypes: string[]
  synergyTags: string[]
  patchVersion: string
  needsReview: boolean
}

export interface Gem {
  id: string
  name: string
  rarity: string
  effects: string[]
  elementalType: string | null
  synergyTags: string[]
  patchVersion: string
  needsReview: boolean
}

export interface Facet {
  id: string
  name: string
  effectDescription: string
  triggerCondition: string
  compatibleWeaponTypes: string[]
  synergyTags: string[]
  patchVersion: string
  needsReview: boolean
}

export interface Accessory {
  id: string
  name: string
  effects: string[]
  attributeBonus: Record<string, number>
  patchVersion: string
  needsReview: boolean
}

export interface Build {
  id: string
  title: string
  archetype: Archetype
  playstyle: string
  difficulty: Difficulty
  score: number
  isStarterBuild: boolean
  patchVersion: string
  sourceUrl: string | null
  elementalType: string | null
  attributes: Record<string, number>
  attributeTotal: number
  gameplayExplanation: string
  synergyExplanation: string
  strengths: string[]
  weaknesses: string[]
  needsReview: boolean
  weapon: Weapon
  armorSet: ArmorSet
  accessories: Accessory[]
  runes: Rune[]
  gems: Gem[]
  facets: Facet[]
}

// Filtros que o usuário seleciona na interface
export interface BuildFilters {
  weaponType: string
  attributes: string[]
  element: string | null
  facets: string[]
}

// Resposta da API de recomendações
export interface RecommendationResponse {
  builds: Build[]
  filtersRelaxed: boolean
  relaxationMessage: string | null
}
