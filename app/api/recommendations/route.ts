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

  // Tenta gerar builds com filtros completos; relaxa progressivamente se necessário
  // Passo 5 (atributos=[]) é o último recurso: ignora escalamento e mostra as melhores armas do tipo
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
  // Buscar armas do tipo selecionado
  const weapons = await prisma.weapon.findMany({
    where: { category: weaponType },
  })

  if (weapons.length === 0) return []

  // Filtrar armas que escalam com pelo menos um dos atributos selecionados.
  // Se nenhuma passar (ex: Axes + Faith), retorna [] para ativar o relaxamento externo.
  const weaponsToEvaluate = attributes.length > 0
    ? weapons.filter((w) => {
        const scaling = w.scalingTable as Record<string, string>
        return attributes.some((attr) => attr in scaling)
      })
    : weapons

  // Buscar itens de suporte
  const [armorSets, runes, gems, facets] = await Promise.all([
    prisma.armorSet.findMany(),
    prisma.rune.findMany({
      where: facetIds.length > 0
        ? { compatibleWeaponTypes: { hasSome: [weaponType, ""] } }
        : undefined,
    }),
    prisma.gem.findMany(),
    prisma.facet.findMany(
      facetIds.length > 0 ? { where: { id: { in: facetIds } } } : undefined
    ),
  ])

  if (armorSets.length === 0) return []

  const builds = []

  for (const archetype of ARCHETYPES) {
    let bestScore = -1
    let bestBuild = null

    for (const weapon of weaponsToEvaluate) {
      // Filtrar runas compatíveis com a arma
      const compatibleRunes = runes.filter(
        (r: { compatibleWeaponTypes: string[] }) =>
          r.compatibleWeaponTypes.length === 0 || r.compatibleWeaponTypes.includes(weaponType)
      )

      // Selecionar armadura mais adequada ao archetype
      const armor = selectArmorForArchetype(armorSets, archetype)

      const scoreInput = {
        weapon: weapon as any,
        armorSet: armor as any,
        runes: compatibleRunes.slice(0, 2) as any[],
        gems: gems.slice(0, 2) as any[],
        facets: facets as any[],
        selectedAttributes: attributes,
        selectedElement: element,
        archetype,
        allWeaponsOfSameCategory: weaponsToEvaluate as any[],
        popularityRank: null,
      }

      const { totalScore } = calculateBuildScore(scoreInput)

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestBuild = { weapon, armor, runes: compatibleRunes.slice(0, 2), gems: gems.slice(0, 2), facets, totalScore }
      }
    }

    if (bestBuild && bestScore >= MIN_BUILD_SCORE) {
      const { weapon, armor, runes: selectedRunes, gems: selectedGems, facets: selectedFacets, totalScore } = bestBuild

      // Determinar atributo primário de escalamento
      const scalingTable = weapon.scalingTable as Record<string, ScalingGrade>
      const primaryAttribute = attributes[0] || Object.keys(scalingTable)[0] || "Strength"
      const primaryGrade: ScalingGrade = scalingTable[primaryAttribute] || "C"

      // Calcular distribuição de atributos sugerida
      const attrDistribution: Record<string, number> = {}
      for (const attr of attributes.length > 0 ? attributes : [primaryAttribute]) {
        attrDistribution[attr] = 20
      }
      const attributeTotal = Object.values(attrDistribution).reduce((a, b) => a + b, 0)

      // Determinar dificuldade com base no archetype
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
        facetNames: selectedFacets.map((f: any) => f.name),
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
        facetNames: selectedFacets.map((f: any) => f.name),
        strengths: [],
        weaknesses: [],
      })

      builds.push({
        id: buildId,
        title: `${weapon.name} ${archetype.replace(/([A-Z])/g, " $1").trim()}`,
        archetype,
        playstyle: ARCHETYPE_TAGS[archetype].join(", "),
        difficulty: difficultyMap[archetype],
        score: Math.round(totalScore * 100) / 100,
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
        gems: selectedGems,
        facets: selectedFacets,
        enchantments: [],
      })
    }
  }

  // Ordenar por score e limitar a 5
  return builds.sort((a, b) => b.score - a.score).slice(0, 5)
}

// Seleciona a armadura mais adequada para cada archetype
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
