import type { Archetype } from "@/lib/types"

const CONFIG: Record<Archetype, { label: string; color: string }> = {
  MeleeBerserker:  { label: "Berserker",    color: "bg-red-900/60 text-red-300 border-red-800" },
  TankBruiser:     { label: "Tank",          color: "bg-stone-800/60 text-stone-300 border-stone-700" },
  ElementalRanger: { label: "Ranger Elemental", color: "bg-cyan-900/60 text-cyan-300 border-cyan-800" },
  CriticalAssassin:{ label: "Assassino",     color: "bg-purple-900/60 text-purple-300 border-purple-800" },
  SpellbladeHybrid:{ label: "Spellblade",    color: "bg-blue-900/60 text-blue-300 border-blue-800" },
}

export function ArchetypeBadge({ archetype }: { archetype: Archetype }) {
  const { label, color } = CONFIG[archetype]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {label}
    </span>
  )
}
