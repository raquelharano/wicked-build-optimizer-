import type { Archetype, Difficulty, ScalingGrade, WeightClass } from "./types"

// Descrições legíveis por archetype
const ARCHETYPE_LABELS: Record<Archetype, string> = {
  MeleeBerserker: "Berserker Corpo a Corpo",
  TankBruiser: "Tank Bruiser",
  ElementalRanger: "Ranger Elemental",
  CriticalAssassin: "Assassino Crítico",
  SpellbladeHybrid: "Spellblade Híbrido",
}

const ARCHETYPE_PLAYSTYLE_DESC: Record<Archetype, string[]> = {
  MeleeBerserker: [
    "jogo agressivo e de alto risco com alto potencial de stagger",
    "combate frontal intenso focado em pressão constante",
    "ofensiva sem trégua explorando brechas na guarda inimiga",
  ],
  TankBruiser: [
    "alta resiliência e sustain prolongado em combate",
    "defesa sólida que vira a maré pelo cansaço do oponente",
    "absorção de dano enquanto aguarda oportunidades de contra-ataque",
  ],
  ElementalRanger: [
    "dano elemental à distância com DOT acumulado",
    "controle de espaço e kiting com dano contínuo",
    "pressão elemental constante sem expor o personagem",
  ],
  CriticalAssassin: [
    "burst de dano crítico em janelas curtas de oportunidade",
    "execução técnica focada em multiplicadores de dano crítico",
    "estilo arriscado com altíssimo teto de dano",
  ],
  SpellbladeHybrid: [
    "combinação de magias e melee com buffs rotativos",
    "dano híbrido que confunde a resistência do inimigo",
    "gestão de recursos entre magia e estamina",
  ],
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  Easy: "Fácil — recomendada para iniciantes",
  Medium: "Moderada — requer prática com o timing",
  Hard: "Difícil — execução técnica avançada",
}

const WEIGHT_CLASS_LABELS: Record<WeightClass, string> = {
  Light: "leve (rolagem rápida)",
  Medium: "média (equilíbrio entre mobilidade e defesa)",
  Heavy: "pesada (máxima defesa, rolagem lenta)",
}

const SCALING_GRADE_LABELS: Record<ScalingGrade, string> = {
  S: "excepcional (S)",
  A: "excelente (A)",
  B: "bom (B)",
  C: "moderado (C)",
  D: "baixo (D)",
  E: "mínimo (E)",
}

// Frases de tática por archetype (rotativas para evitar repetição)
const TACTICS: Record<Archetype, { do: string[]; avoid: string[] }> = {
  MeleeBerserker: {
    do: ["mantenha pressão constante", "explore janelas de stagger", "avance após esquivas"],
    avoid: ["recuar por muito tempo", "combate defensivo prolongado", "enfrentar múltiplos inimigos simultaneamente"],
  },
  TankBruiser: {
    do: ["bloqueie e contra-ataque no momento certo", "use a armadura pesada para absorver combos", "sustente o dano e espere aberturas"],
    avoid: ["tentar vencer pelo dano bruto", "ignorar o gerenciamento de stamina", "enfrentar ataques sem bloqueio"],
  },
  ElementalRanger: {
    do: ["mantenha distância segura", "acumule DOT e recue", "use o terreno a seu favor"],
    avoid: ["combate corpo a corpo prolongado", "se expor para aplicar dano", "desperdiçar munição em inimigos com alta resistência ao elemento"],
  },
  CriticalAssassin: {
    do: ["ataque de posição vantajosa", "maximize janelas de crítico", "use a mobilidade para reposicionar"],
    avoid: ["trocar golpes frontalmente", "atacar sem setup de crítico", "prolongar combate após o burst"],
  },
  SpellbladeHybrid: {
    do: ["alterne entre magias e ataques melee", "gerencie os buffs ativos", "adapte o estilo ao inimigo"],
    avoid: ["esgotar mana/stamina sem rotação", "ignorar os buffs disponíveis", "focar apenas em um tipo de dano"],
  },
}

// Escolhe item de array de forma pseudo-aleatória mas determinística pelo id da build
function pick<T>(arr: T[], seed: string): T {
  const index = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % arr.length
  return arr[index]
}

interface TemplateInputs {
  buildId: string
  archetype: Archetype
  difficulty: Difficulty
  weaponName: string
  weaponCategory: string
  primaryAttribute: string
  primaryScalingGrade: ScalingGrade
  elementalType: string | null
  armorWeightClass: WeightClass
  runeNames: string[]
  facetNames: string[]
  strengths: string[]
  weaknesses: string[]
}

export function generateGameplayExplanation(inputs: TemplateInputs): string {
  const { buildId, archetype, weaponCategory, primaryAttribute, primaryScalingGrade, elementalType, armorWeightClass } = inputs

  const playstyleDesc = pick(ARCHETYPE_PLAYSTYLE_DESC[archetype], buildId)
  const tactic = TACTICS[archetype]
  const doTactic = pick(tactic.do, buildId + "do")
  const avoidTactic = pick(tactic.avoid, buildId + "avoid")
  const gradeLabel = SCALING_GRADE_LABELS[primaryScalingGrade]
  const weightLabel = WEIGHT_CLASS_LABELS[armorWeightClass]
  const elementPart = elementalType && elementalType !== "None"
    ? ` Combinado com dano ${elementalType}, o resultado é ${playstyleDesc}.`
    : ` O resultado é ${playstyleDesc}.`

  return (
    `Esta build usa ${weaponCategory} com escalamento ${gradeLabel} em ${primaryAttribute}.` +
    elementPart +
    ` A armadura ${weightLabel} complementa o estilo de jogo.` +
    ` Priorize ${doTactic} e evite ${avoidTactic}.`
  )
}

export function generateSynergyExplanation(inputs: TemplateInputs): string {
  const { weaponName, primaryAttribute, elementalType, runeNames, facetNames } = inputs

  const parts: string[] = []

  parts.push(`${weaponName} escala principalmente com ${primaryAttribute}`)

  if (elementalType && elementalType !== "None") {
    parts.push(`causa dano elemental de ${elementalType}`)
  }

  if (runeNames.length > 0) {
    parts.push(`as runas ${runeNames.slice(0, 2).join(" e ")} amplificam o estilo de jogo`)
  }

  if (facetNames.length > 0) {
    parts.push(`os facets ${facetNames.slice(0, 2).join(" e ")} reforçam a sinergia geral`)
  }

  return parts.join(", ") + "."
}

export function generateStrengths(archetype: Archetype): string[] {
  const base: Record<Archetype, string[]> = {
    MeleeBerserker: ["Alto potencial de stagger", "Excelente contra inimigos com baixa resistência", "Ritmo de combate agressivo"],
    TankBruiser: ["Altíssima sobrevivência", "Ótimo para aprender padrões de bosses", "Perdoa erros de timing"],
    ElementalRanger: ["Segurança no combate à distância", "DOT eficiente contra bosses com muita vida", "Mobilidade para reposicionamento"],
    CriticalAssassin: ["Burst de dano extremo", "Eficiente em inimigos únicos e bosses", "Alto teto de habilidade"],
    SpellbladeHybrid: ["Versatilidade para diferentes situações", "Dano híbrido difícil de resistir", "Recursos táticos variados"],
  }
  return base[archetype]
}

export function generateWeaknesses(archetype: Archetype): string[] {
  const base: Record<Archetype, string[]> = {
    MeleeBerserker: ["Baixa defesa — erros são punidos duramente", "Difícil contra múltiplos inimigos", "Dependente de stamina"],
    TankBruiser: ["Baixo dano comparado a outras builds", "Combates longos e lentos", "Menos eficaz contra inimigos muito ágeis"],
    ElementalRanger: ["Vulnerável em combate corpo a corpo", "Depende de inimigos com resistência elemental baixa", "Gerenciamento de recursos exigente"],
    CriticalAssassin: ["Requer timing preciso para o burst", "Punido severamente por erros", "Baixa sustain fora das janelas de crítico"],
    SpellbladeHybrid: ["Complexidade de gestão de recursos", "Curva de aprendizado alta", "Menor especialização que builds focadas"],
  }
  return base[archetype]
}

export function getDifficultyLabel(difficulty: Difficulty): string {
  return DIFFICULTY_LABELS[difficulty]
}

export function getArchetypeLabel(archetype: Archetype): string {
  return ARCHETYPE_LABELS[archetype]
}
