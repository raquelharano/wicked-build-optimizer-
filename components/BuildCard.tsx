"use client"

import { useState } from "react"
import type { Build } from "@/lib/types"
import { ArchetypeBadge } from "./ArchetypeBadge"
import { DifficultyBadge } from "./DifficultyBadge"

const ELEMENT_COLORS: Record<string, string> = {
  Fire: "text-orange-400",
  Ice: "text-cyan-400",
  Lightning: "text-yellow-400",
  Poison: "text-green-400",
}

export function BuildCard({ build, rank }: { build: Build; rank: number }) {
  const [expanded, setExpanded] = useState(false)

  const topStrengths = build.strengths.slice(0, 3)
  const scorePercent = Math.round(build.score * 10)

  return (
    <article className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg overflow-hidden hover:border-[#c9a84c]/40 transition-colors">

      {/* Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Número de ranking */}
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#222] border border-[#2e2e2e] flex items-center justify-center text-xs text-[#7a7268] font-mono">
            {rank}
          </div>
          <div>
            <h3 className="font-semibold text-[#e8e0d0] leading-tight">{build.title}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <ArchetypeBadge archetype={build.archetype} />
              <DifficultyBadge difficulty={build.difficulty} />
              {build.elementalType && build.elementalType !== "None" && (
                <span className={`text-xs ${ELEMENT_COLORS[build.elementalType] ?? "text-[#7a7268]"}`}>
                  ◆ {build.elementalType}
                </span>
              )}
              {build.needsReview && (
                <span className="text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded">
                  Atualizado recentemente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-bold text-[#c9a84c]">{scorePercent}</div>
          <div className="text-[10px] text-[#7a7268] uppercase tracking-wider">score</div>
        </div>
      </div>

      {/* Divisor */}
      <div className="divider-gold mx-4" />

      {/* Info principal */}
      <div className="p-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[#7a7268] uppercase tracking-wider">Arma</span>
          <p className="text-[#e8e0d0] mt-0.5">{build.weapon.name}</p>
        </div>
        <div>
          <span className="text-[#7a7268] uppercase tracking-wider">Armadura</span>
          <p className="text-[#e8e0d0] mt-0.5">{build.armorSet.name}</p>
        </div>
      </div>

      {/* Pontos fortes */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-[#7a7268] uppercase tracking-wider mb-1.5">Pontos Fortes</p>
        <ul className="space-y-0.5">
          {topStrengths.map((s, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-[#c8c0b0]">
              <span className="text-[#c9a84c] mt-px">+</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Botão expandir */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2.5 border-t border-[#2e2e2e] text-xs text-[#7a7268] hover:text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all flex items-center justify-center gap-1.5"
      >
        {expanded ? "▲ Menos detalhes" : "▼ Ver build completa"}
      </button>

      {/* Detalhes expandidos */}
      {expanded && (
        <div className="border-t border-[#2e2e2e] p-4 space-y-4 bg-[#161616]">

          {/* Runas e Gemas */}
          {(build.runes.length > 0 || build.gems.length > 0) && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              {build.runes.length > 0 && (
                <div>
                  <p className="text-[#7a7268] uppercase tracking-wider mb-1">Runas</p>
                  {build.runes.map(r => (
                    <p key={r.id} className="text-[#c8c0b0]">• {r.name}</p>
                  ))}
                </div>
              )}
              {build.gems.length > 0 && (
                <div>
                  <p className="text-[#7a7268] uppercase tracking-wider mb-1">Gemas</p>
                  {build.gems.map(g => (
                    <p key={g.id} className="text-[#c8c0b0]">• {g.name}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Atributos */}
          <div>
            <p className="text-[#7a7268] uppercase tracking-wider text-xs mb-2">Distribuição de Atributos</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(build.attributes).map(([attr, val]) => (
                <span key={attr} className="px-2 py-1 bg-[#222] border border-[#2e2e2e] rounded text-xs">
                  <span className="text-[#c9a84c]">{attr}</span>
                  <span className="text-[#7a7268] ml-1">{val}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Como jogar */}
          <div>
            <p className="text-[#7a7268] uppercase tracking-wider text-xs mb-1.5">Como Jogar</p>
            <p className="text-sm text-[#c8c0b0] leading-relaxed">{build.gameplayExplanation}</p>
          </div>

          {/* Sinergias */}
          <div>
            <p className="text-[#7a7268] uppercase tracking-wider text-xs mb-1.5">Por Que Funciona</p>
            <p className="text-sm text-[#c8c0b0] leading-relaxed">{build.synergyExplanation}</p>
          </div>

          {/* Fraquezas */}
          <div>
            <p className="text-[10px] text-[#7a7268] uppercase tracking-wider mb-1.5">Pontos Fracos</p>
            <ul className="space-y-0.5">
              {build.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-[#c8c0b0]">
                  <span className="text-red-500 mt-px">−</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  )
}
