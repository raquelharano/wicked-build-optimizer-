import type { Weapon, ArmorSet, Rune, Gem, Facet, Archetype, ScalingGrade } from "./types"

// Converte grau de escalamento em valor numérico (0–10)
const SCALING_VALUES: Record<ScalingGrade, number> = {
  S: 10,
  A: 8,
  B: 6,
  C: 4,
  D: 2,
  E: 1,
}

// Peso de classe de armadura para Survivability
const WEIGHT_CLASS_VALUES = { Light: 3, Medium: 6, Heavy: 10 }

// Playstyle tags por archetype (para calcular PlaystyleMatch)
export const ARCHETYPE_TAGS: Record<Archetype, string[]> = {
  MeleeBerserker: ["aggressive", "stagger", "high_risk", "melee"],
  TankBruiser: ["defensive", "sustain", "slow_paced", "melee"],
  ElementalRanger: ["ranged", "dot", "mobile", "elemental"],
  CriticalAssassin: ["burst", "critical", "technical", "melee"],
  SpellbladeHybrid: ["hybrid", "buff", "magic", "melee"],
}

interface ScoreInputs {
  weapon: Weapon
  armorSet: ArmorSet
  runes: Rune[]
  gems: Gem[]
  facets: Facet[]
  selectedAttributes: string[]
  selectedElement: string | null
  archetype: Archetype
  allWeaponsOfSameCategory: Weapon[]
  popularityRank: number | null // posição no ranking de /builds, null = desconhecido
}

interface SubScores {
  scaling: number
  damage: number
  synergy: number
  survivability: number
  playstyleMatch: number
  meta: number
}

function normalize(value: number, max: number): number {
  if (max === 0) return 0
  return Math.min(10, (value / max) * 10)
}

// Scaling (0–10): quão bem a arma escala com os atributos selecionados
function calcScaling(weapon: Weapon, selectedAttributes: string[]): number {
  if (selectedAttributes.length === 0) return 5 // neutro quando nenhum atributo selecionado

  const scalingTable = weapon.scalingTable
  const totalScaling = selectedAttributes.reduce((sum, attr) => {
    const grade = scalingTable[attr] as ScalingGrade | undefined
    return sum + (grade ? SCALING_VALUES[grade] : 0)
  }, 0)

  return normalize(totalScaling, selectedAttributes.length * 10)
}

// Damage (0–10): dano da arma comparado com outras do mesmo tipo
function calcDamage(weapon: Weapon, allWeaponsOfSameCategory: Weapon[]): number {
  const weaponTotal = weapon.baseDamage + weapon.elementalDamage
  const maxTotal = Math.max(
    ...allWeaponsOfSameCategory.map((w) => w.baseDamage + w.elementalDamage),
    weaponTotal
  )
  return normalize(weaponTotal, maxTotal)
}

// Synergy (0–10): conexões de sinergias entre os itens da build
function calcSynergy(runes: Rune[], gems: Gem[], facets: Facet[], weapon: Weapon): number {
  const allTags = [
    ...weapon.playstyleTags,
    ...runes.flatMap((r) => r.synergyTags),
    ...gems.flatMap((g) => g.synergyTags),
    ...facets.flatMap((f) => f.synergyTags),
  ]

  const items = [weapon, ...runes, ...gems, ...facets]
  const totalPossibleConnections = (items.length * (items.length - 1)) / 2
  if (totalPossibleConnections === 0) return 0

  // Contar pares que compartilham pelo menos 1 tag
  let connections = 0
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const tagsI = "playstyleTags" in items[i]
        ? (items[i] as Weapon).playstyleTags
        : "synergyTags" in items[i]
        ? (items[i] as Rune | Gem | Facet).synergyTags
        : []
      const tagsJ = "playstyleTags" in items[j]
        ? (items[j] as Weapon).playstyleTags
        : "synergyTags" in items[j]
        ? (items[j] as Rune | Gem | Facet).synergyTags
        : []
      if (tagsI.some((t) => tagsJ.includes(t))) connections++
    }
  }

  return normalize(connections, totalPossibleConnections) * 10
}

// Survivability (0–10): resistência baseada na armadura
function calcSurvivability(armorSet: ArmorSet): number {
  const weightScore = WEIGHT_CLASS_VALUES[armorSet.weightClass]
  const resistanceBonus = Object.values(armorSet.resistances).reduce((a, b) => a + b, 0)
  const normalizedResistance = normalize(resistanceBonus, 100)
  return normalize(weightScore + normalizedResistance, 10 + 10)
}

// PlaystyleMatch (0–10): quão bem a build combina com o archetype
function calcPlaystyleMatch(weapon: Weapon, archetype: Archetype): number {
  const archetypeTags = ARCHETYPE_TAGS[archetype]
  const weaponTags = weapon.playstyleTags
  if (archetypeTags.length === 0) return 0

  const matches = archetypeTags.filter((t) => weaponTags.includes(t)).length
  return normalize(matches, archetypeTags.length) * 10
}

// Meta (0–10): popularidade no site oficial
function calcMeta(popularityRank: number | null): number {
  if (popularityRank === null) return 5
  if (popularityRank <= 10) return 10
  if (popularityRank <= 20) return 7
  return 3
}

// Score final ponderado (retorna valor entre 0 e 10)
export function calculateBuildScore(inputs: ScoreInputs): {
  totalScore: number
  subScores: SubScores
} {
  const subScores: SubScores = {
    scaling: calcScaling(inputs.weapon, inputs.selectedAttributes),
    damage: calcDamage(inputs.weapon, inputs.allWeaponsOfSameCategory),
    synergy: calcSynergy(inputs.runes, inputs.gems, inputs.facets, inputs.weapon),
    survivability: calcSurvivability(inputs.armorSet),
    playstyleMatch: calcPlaystyleMatch(inputs.weapon, inputs.archetype),
    meta: calcMeta(inputs.popularityRank),
  }

  const totalScore =
    subScores.scaling * 0.2 +
    subScores.damage * 0.2 +
    subScores.synergy * 0.2 +
    subScores.survivability * 0.15 +
    subScores.playstyleMatch * 0.15 +
    subScores.meta * 0.1

  return { totalScore, subScores }
}

// Verificar se a build atinge o threshold mínimo de qualidade
export const MIN_BUILD_SCORE = 0.3
