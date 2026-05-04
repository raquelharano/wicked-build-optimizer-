import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateBuildScore, ARCHETYPE_TAGS, MIN_BUILD_SCORE } from "@/lib/scoring"
import {
  generateGameplayExplanation,
  generateSynergyExplanation,
  generateStrengths,
  generateWeaknesses,
} from "@/lib/templates"
import type { Archetype, BuildFilters, ScalingGrade, WeightClass, Difficulty } from "@/lib/types"

const ARCHETYPES: Archetype[] = [
  "MeleeBerserker",
  "TankBruiser",
  "ElementalRanger",
  "CriticalAssassin",
  "SpellbladeHybrid",
]

// Mapeamento de categoria de arma → categoria de runa compatível
const WEAPON_RUNE_CATEGORY: Record<string, string> = {
  "Axes": "one-handed",
  "Straight Swords": "one-handed",
  "Curved Swords": "one-handed",
  "Rapiers": "one-handed",
  "Hammers": "one-handed",
  "Maces": "one-handed",
  "Clubs": "one-handed",
  "Knives": "one-handed",
  "Wakizashi": "one-handed",
  "Great Axes": "two-handed",
  "Great Swords": "two-handed",
  "Great Hammers": "two-handed",
  "Great Clubs": "two-handed",
  "Halberds": "two-handed",
  "Scythes": "two-handed",
  "Spears": "two-handed",
  "Curved Great Swords": "two-handed",
  "Bows": "Bows",
  "Double Daggers": "Double Daggers",
  "Staves": "Staves",
  "Wands": "Wands",
}

// POST /api/recommendations
export async function POST(req: NextRequest) {
  let filters: BuildFilters

  try {
    filters = await req.json()
  } catch {
    return NextResponse.json({ error: "Body JSON inválido", code: 400 }, { status: 400 })
  }

  if (!filters.weaponType) {
    return NextResponse.json({ error: "Tipo de arma é obrigatório", code: 400 }, { status: 400 })
  }

  const relaxationSteps = [
    { facets: filters.facets, element: filters.element, attributes: filters.attributes },
    { facets: [], element: filters.element, attributes: filters.attributes },
    { facets: [], element: null, attributes: filters.attributes },
    { facets: [], element: null, attributes: filters.attributes.slice(0, 1) },
    { facets: [], element: null, attributes: [] },
  ]

  for (let step = 0; step < relaxationSteps.length; step++) {
    const current = relaxationSteps[step]
    const result = await generateBuilds(filters.weaponType, current.attributes, current.element, current.facets)

    if (result.length >= 1) {
      return NextResponse.json({
        builds: result,
        filtersRelaxed: step > 0,
        relaxationMessage:
          step > 0
            ? "Nenhuma combinação exata encontrada — mostrando as alternativas mais próximas do seu estilo."
            : null,
      })
    }
  }

  return NextResponse.json({ error: "Nenhuma build encontrada para essa combinação.", code: 404 }, { status: 404 })
}

async function generateBuilds(
  weaponType: string,
  attributes: string[],
  element: string | null,
  facetIds: string[]
) {
  const weapons = await prisma.weapon.findMany({
    where: { category: weaponType },
  })

  if (weapons.length === 0) return []

  const weaponsToEvaluate = attributes.length > 0
    ? weapons.filter((w) => {
        const scaling = w.scalingTable as Record<string, string>
        return attributes.some((attr) => attr in scaling)
      })
    : weapons

  if (weaponsToEvaluate.length === 0) return []

  const [armorSets, allRunes, allGems, allFacets, allEnchantments] = await Promise.all([
    prisma.armorSet.findMany(),
    prisma.rune.findMany(),
    prisma.gem.findMany(),
    prisma.facet.findMany(),
    prisma.enchantment.findMany(),
  ])

  // Facets selecionados pelo usuário (se algum)
  const userFacets = facetIds.length > 0
    ? allFacets.filter(f => facetIds.includes(f.id))
    : []

  if (armorSets.length === 0) return []

  const builds = []

  for (const archetype of ARCHETYPES) {
    let bestScore = -1
    let bestBuild = null

    for (const weapon of weaponsToEvaluate) {
      const armor = selectArmorForArchetype(armorSets, archetype)

      const scoreInput = {
        weapon: weapon as any,
        armorSet: armor as any,
        runes: [] as any[],
        gems: [] as any[],
        facets: userFacets as any[],
        selectedAttributes: attributes,
        selectedElement: element,
        archetype,
        allWeaponsOfSameCategory: weaponsToEvaluate as any[],
        popularityRank: null,
      }

      const { totalScore } = calculateBuildScore(scoreInput)

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestBuild = { weapon, armor }
      }
    }

    if (bestBuild && bestScore >= MIN_BUILD_SCORE) {
      const { weapon, armor } = bestBuild

      // ── Runas: 4 compatíveis com o tipo de arma, priorizando o elemento ──
      const selectedRunes = selectRunes(allRunes, weaponType, element)

      // ── Gema: 1, priorizando elemento da build ────────────────────────────
      const selectedGem = selectGem(allGems, element)

      // ── Encantamentos: 4 positivos + 1 negativo ───────────────────────────
      const selectedEnchantments = selectEnchantments(allEnchantments, archetype, element)

      // ── Facet: usar o selecionado ou sugerir o melhor para o archetype ────
      const suggestedFacet = userFacets.length === 0
        ? suggestFacet(allFacets, archetype, element)
        : null

      const scalingTable = weapon.scalingTable as Record<string, ScalingGrade>
      const primaryAttribute = attributes[0] || Object.keys(scalingTable)[0] || "Strength"
      const primaryGrade: ScalingGrade = scalingTable[primaryAttribute] || "C"

      const attrDistribution: Record<string, number> = {}
      for (const attr of attributes.length > 0 ? attributes : [primaryAttribute]) {
        attrDistribution[attr] = 20
      }
      const attributeTotal = Object.values(attrDistribution).reduce((a, b) => a + b, 0)

      const difficultyMap: Record<Archetype, Difficulty> = {
        MeleeBerserker: "Medium",
        TankBruiser: "Easy",
        ElementalRanger: "Medium",
        CriticalAssassin: "Hard",
        SpellbladeHybrid: "Hard",
      }

      const buildId = `${archetype}-${weapon.id}`

      const gameplayExplanation = generateGameplayExplanation({
        buildId,
        archetype,
        difficulty: difficultyMap[archetype],
        weaponName: weapon.name,
        weaponCategory: weapon.category,
        primaryAttribute,
        primaryScalingGrade: primaryGrade,
        elementalType: element,
        armorWeightClass: armor.weightClass as WeightClass,
        runeNames: selectedRunes.map((r: any) => r.name),
        facetNames: [...userFacets, ...(suggestedFacet ? [suggestedFacet] : [])].map((f: any) => f.name),
        strengths: [],
        weaknesses: [],
      })

      const synergyExplanation = generateSynergyExplanation({
        buildId,
        archetype,
        difficulty: difficultyMap[archetype],
        weaponName: weapon.name,
        weaponCategory: weapon.category,
        primaryAttribute,
        primaryScalingGrade: primaryGrade,
        elementalType: element,
        armorWeightClass: armor.weightClass as WeightClass,
        runeNames: selectedRunes.map((r: any) => r.name),
        facetNames: [...userFacets, ...(suggestedFacet ? [suggestedFacet] : [])].map((f: any) => f.name),
        strengths: [],
        weaknesses: [],
      })

      builds.push({
        id: buildId,
        title: `${weapon.name} ${archetype.replace(/([A-Z])/g, " $1").trim()}`,
        archetype,
        playstyle: ARCHETYPE_TAGS[archetype].join(", "),
        difficulty: difficultyMap[archetype],
        score: Math.round(bestScore * 100) / 100,
        isStarterBuild: false,
        patchVersion: weapon.patchVersion,
        sourceUrl: null,
        elementalType: element,
        attributes: attrDistribution,
        attributeTotal,
        gameplayExplanation,
        synergyExplanation,
        strengths: generateStrengths(archetype),
        weaknesses: generateWeaknesses(archetype),
        needsReview: weapon.needsReview || armor.needsReview,
        weapon,
        armorSet: armor,
        accessories: [],
        runes: selectedRunes,
        gems: selectedGem ? [selectedGem] : [],
        facets: userFacets,
        suggestedFacet,
        enchantments: selectedEnchantments,
      })
    }
  }

  return builds.sort((a, b) => b.score - a.score).slice(0, 5)
}

// ── Seleciona 4 runas compatíveis com o tipo de arma e o elemento da build ──
function selectRunes(allRunes: any[], weaponCategory: string, element: string | null): any[] {
  const runeCategory = WEAPON_RUNE_CATEGORY[weaponCategory] ?? "one-handed"

  const compatible = allRunes.filter(r => {
    const types: string[] = r.compatibleWeaponTypes
    if (types.length === 0) return true
    return types.includes(runeCategory) || types.includes(weaponCategory)
  })

  if (compatible.length === 0) return []

  const elemental = (element && element !== "None")
    ? compatible.filter(r => r.elementalType === element)
    : []
  const neutral = compatible.filter(r => !r.elementalType)

  const selected: any[] = []
  if (elemental.length >= 2) {
    selected.push(...elemental.slice(0, 2), ...neutral.slice(0, 2))
  } else {
    selected.push(...elemental, ...neutral.slice(0, 4 - elemental.length))
  }

  return selected.slice(0, 4)
}

// ── Seleciona 1 gema, priorizando a que combina com o elemento ──────────────
function selectGem(allGems: any[], element: string | null): any | null {
  if (element && element !== "None") {
    const match = allGems.find(g => g.elementalType === element && g.rarity === "Rare")
      || allGems.find(g => g.elementalType === element)
    if (match) return match
  }
  return allGems.find(g => g.elementalType === null && g.rarity === "Rare")
    || allGems.find(g => g.elementalType === null)
    || allGems[0]
    || null
}

// ── Seleciona 4 encantamentos positivos + 1 negativo (plagued downside) ─────
function selectEnchantments(allEnchantments: any[], archetype: Archetype, element: string | null): any[] {
  const debuffs = allEnchantments.filter(e =>
    (e.compatibleCategories as string[]).includes("debuff")
  )
  const positives = allEnchantments.filter(e =>
    !(e.compatibleCategories as string[]).includes("debuff")
  )

  // Tags de preferência por archetype
  const archetypePrefs: Record<Archetype, string[]> = {
    MeleeBerserker:  ["damage", "stamina", "stagger"],
    TankBruiser:     ["lifesteal", "stagger", "damage"],
    ElementalRanger: [element?.toLowerCase() ?? "fire", "fire", "ice", "lightning", "plague"],
    CriticalAssassin:["critical", "damage"],
    SpellbladeHybrid:["rune", "focus", "damage"],
  }
  const prefs = archetypePrefs[archetype]

  const scored = positives.map(e => ({
    e,
    score: (e.compatibleCategories as string[]).filter(c => prefs.includes(c)).length,
  })).sort((a, b) => b.score - a.score)

  const top4 = scored.slice(0, 4).map(s => s.e)
  const debuff = debuffs[0] ?? null

  return debuff ? [...top4, debuff] : top4
}

// ── Sugere o melhor facet para o archetype/elemento quando nenhum foi selecionado ──
function suggestFacet(allFacets: any[], archetype: Archetype, element: string | null): any | null {
  const prefs: Record<string, string[]> = {
    MeleeBerserker:       ["Heavy", "Clumsy", "Mundane"],
    TankBruiser:          ["Reliable", "Blunt", "Heavy"],
    ElementalRanger_Fire: ["Festering", "Flaming", "Quick"],
    ElementalRanger_Ice:  ["Frigid", "Nimble", "Quick"],
    ElementalRanger_Lightning: ["Voltaic", "Quick", "Nimble"],
    ElementalRanger:      ["Quick", "Nimble", "Voltaic"],
    CriticalAssassin:     ["Sharp", "Keen", "Razor"],
    SpellbladeHybrid:     ["Ritualistic", "Nimble"],
  }

  const key = (element && element !== "None")
    ? `${archetype}_${element}`
    : archetype

  const list = prefs[key] ?? prefs[archetype] ?? []
  for (const name of list) {
    const found = allFacets.find(f => f.name === name)
    if (found) return found
  }
  return allFacets[0] ?? null
}

// ── Seleciona a armadura mais adequada para o archetype ─────────────────────
function selectArmorForArchetype(armorSets: any[], archetype: Archetype) {
  const preferred: Record<Archetype, string> = {
    MeleeBerserker: "Light",
    TankBruiser: "Heavy",
    ElementalRanger: "Light",
    CriticalAssassin: "Light",
    SpellbladeHybrid: "Medium",
  }

  const target = preferred[archetype]
  return (
    armorSets.find((a) => a.weightClass === target) ||
    armorSets[0]
  )
}
