"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { FilterPanel } from "@/components/FilterPanel"
import { BuildCard } from "@/components/BuildCard"
import type { Build, RecommendationResponse } from "@/lib/types"

function SkeletonCard() {
  return (
    <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[#2e2e2e]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#2e2e2e] rounded w-2/3" />
          <div className="h-3 bg-[#2e2e2e] rounded w-1/3" />
        </div>
        <div className="w-10 h-8 bg-[#2e2e2e] rounded" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-[#2e2e2e] rounded w-full" />
        <div className="h-3 bg-[#2e2e2e] rounded w-3/4" />
        <div className="h-3 bg-[#2e2e2e] rounded w-1/2" />
      </div>
    </div>
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()

  const weapon     = searchParams.get("weapon") ?? ""
  const attrsParam = searchParams.get("attrs") ?? ""
  const element    = searchParams.get("elem") ?? null
  const facetsParam= searchParams.get("facets") ?? ""

  const attributes = attrsParam ? attrsParam.split(",").filter(Boolean) : []
  const facets     = facetsParam ? facetsParam.split(",").filter(Boolean) : []

  const [builds, setBuilds]               = useState<Build[]>([])
  const [relaxed, setRelaxed]             = useState(false)
  const [relaxMessage, setRelaxMessage]   = useState<string | null>(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)

  const fetchBuilds = useCallback(async () => {
    if (!weapon) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weaponType: weapon, attributes, element, facets }),
        signal: AbortSignal.timeout(8000),
      })

      if (res.status === 404) {
        setBuilds([])
        setError("Nenhuma build encontrada para essa combinação. Tente outros filtros.")
        return
      }

      if (!res.ok) throw new Error("Erro do servidor")

      const data: RecommendationResponse = await res.json()
      setBuilds(data.builds)
      setRelaxed(data.filtersRelaxed)
      setRelaxMessage(data.relaxationMessage)
    } catch {
      setError("Algo deu errado. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }, [weapon, attrsParam, element, facetsParam]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchBuilds() }, [fetchBuilds])

  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="border-b border-[#2e2e2e] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#c9a84c] glow-gold tracking-wide hover:opacity-80 transition-opacity">
            WICKED BUILD OPTIMIZER
          </Link>
          <a href="https://www.norestforthewicked.gg" target="_blank" rel="noopener noreferrer"
             className="text-xs text-[#7a7268] hover:text-[#c9a84c] transition-colors">
            norestforthewicked.gg ↗
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 lg:px-6">
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">

          {/* Sidebar — filtros persistentes */}
          <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#e8e0d0] uppercase tracking-widest">Filtros</h2>
                <Link href="/" className="text-xs text-[#7a7268] hover:text-[#c9a84c] transition-colors">
                  Limpar
                </Link>
              </div>
              <div className="divider-gold mb-4" />
              <FilterPanel
                initialWeapon={weapon}
                initialAttributes={attributes}
                initialElement={element ?? ""}
                initialFacets={facets}
              />
            </div>
          </aside>

          {/* Resultados */}
          <section>

            {/* Título e contador */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#e8e0d0]">
                  {loading ? "Buscando builds..." : builds.length > 0 ? `${builds.length} build${builds.length !== 1 ? "s" : ""} encontrada${builds.length !== 1 ? "s" : ""}` : ""}
                </h2>
                {weapon && !loading && (
                  <p className="text-xs text-[#7a7268] mt-0.5">
                    {weapon}
                    {attributes.length > 0 && ` · ${attributes.join(", ")}`}
                    {element && element !== "None" && ` · ${element}`}
                  </p>
                )}
              </div>
              {!loading && builds.length > 0 && (
                <button
                  onClick={fetchBuilds}
                  className="text-xs text-[#7a7268] hover:text-[#c9a84c] transition-colors border border-[#2e2e2e] px-3 py-1.5 rounded hover:border-[#c9a84c]/40"
                >
                  ↺ Atualizar
                </button>
              )}
            </div>

            {/* Banner de filtros relaxados */}
            {relaxed && relaxMessage && (
              <div className="mb-4 px-4 py-3 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-400">
                ⚠ {relaxMessage}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Erro */}
            {!loading && error && (
              <div className="text-center py-16 space-y-4">
                <p className="text-[#7a7268]">{error}</p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={fetchBuilds}
                    className="px-4 py-2 bg-[#1a1a1a] border border-[#2e2e2e] text-sm text-[#e8e0d0] rounded hover:border-[#c9a84c]/40 transition-colors"
                  >
                    Tentar novamente
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 text-sm text-[#7a7268] hover:text-[#c9a84c] transition-colors"
                  >
                    Limpar filtros
                  </Link>
                </div>
              </div>
            )}

            {/* Builds */}
            {!loading && !error && builds.length > 0 && (
              <div className="space-y-3">
                {builds.map((build, i) => (
                  <BuildCard key={build.id} build={build} rank={i + 1} />
                ))}
              </div>
            )}

          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2e2e2e] px-6 py-4 text-center">
        <p className="text-xs text-[#4a4540]">
          Dados:{" "}
          <a href="https://www.norestforthewicked.gg" target="_blank" rel="noopener noreferrer"
             className="hover:text-[#7a7268] transition-colors">norestforthewicked.gg</a>
          {" · "}
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
             className="hover:text-[#7a7268] transition-colors">Código aberto no GitHub</a>
        </p>
      </footer>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#7a7268] text-sm">Carregando...</p>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
