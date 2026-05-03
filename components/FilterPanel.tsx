"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"

const ATTRIBUTES = ["Strength", "Dexterity", "Intelligence", "Faith", "Focus"]
const ELEMENTS   = ["Fire", "Ice", "Lightning", "Plague", "Bleed", "None"]

const ATTRIBUTE_LABELS: Record<string, string> = {
  Strength:     "Força",
  Dexterity:    "Destreza",
  Intelligence: "Inteligência",
  Faith:        "Fé",
  Focus:        "Foco",
}

const ELEMENT_LABELS: Record<string, string> = {
  Fire: "Fogo", Ice: "Gelo", Lightning: "Raio",
  Plague: "Praga", Bleed: "Sangramento", None: "Nenhum",
}

interface Props {
  initialWeapon?: string
  initialAttributes?: string[]
  initialElement?: string
  initialFacets?: string[]
}

export function FilterPanel({ initialWeapon = "", initialAttributes = [], initialElement = "", initialFacets = [] }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [weaponTypes, setWeaponTypes]   = useState<string[]>([])
  const [facetOptions, setFacetOptions] = useState<{ id: string; name: string }[]>([])

  const [weapon,     setWeapon]     = useState(initialWeapon)
  const [attributes, setAttributes] = useState<string[]>(initialAttributes)
  const [element,    setElement]    = useState(initialElement)
  const [facets,     setFacets]     = useState<string[]>(initialFacets)

  useEffect(() => {
    fetch("/api/items/weapon-types").then(r => r.json()).then(setWeaponTypes).catch(() => {})
    fetch("/api/items/facets").then(r => r.json()).then(setFacetOptions).catch(() => {})
  }, [])

  function toggleAttribute(attr: string) {
    setAttributes(prev => prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr])
  }

  function toggleFacet(id: string) {
    setFacets(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!weapon) return

    const params = new URLSearchParams()
    params.set("weapon", weapon)
    if (attributes.length) params.set("attrs", attributes.join(","))
    if (element && element !== "") params.set("elem", element)
    if (facets.length) params.set("facets", facets.join(","))

    startTransition(() => {
      router.push(`/results?${params.toString()}`)
    })
  }

  const canSubmit = !!weapon && !isPending

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Tipo de arma */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-[#c9a84c] mb-2 font-medium">
          Tipo de Arma <span className="text-red-400">*</span>
        </label>
        <select
          value={weapon}
          onChange={e => setWeapon(e.target.value)}
          className="w-full bg-[#222] border border-[#2e2e2e] text-[#e8e0d0] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
        >
          <option value="">Selecione...</option>
          {weaponTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Atributos */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-[#c9a84c] mb-2 font-medium">
          Atributos
        </label>
        <div className="flex flex-col gap-1.5">
          {ATTRIBUTES.map(attr => (
            <label key={attr} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={attributes.includes(attr)}
                onChange={() => toggleAttribute(attr)}
                className="w-3.5 h-3.5 accent-[#c9a84c] cursor-pointer"
              />
              <span className="text-sm text-[#e8e0d0] group-hover:text-[#c9a84c] transition-colors">
                {ATTRIBUTE_LABELS[attr]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Elemento */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-[#c9a84c] mb-2 font-medium">
          Dano Elemental
        </label>
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map(el => (
            <button
              key={el}
              type="button"
              onClick={() => setElement(element === el ? "" : el)}
              className={`px-3 py-1 rounded text-xs border transition-all ${
                element === el
                  ? "bg-[#c9a84c] border-[#c9a84c] text-[#0d0d0d] font-semibold"
                  : "bg-[#1a1a1a] border-[#2e2e2e] text-[#7a7268] hover:border-[#c9a84c] hover:text-[#e8e0d0]"
              }`}
            >
              {ELEMENT_LABELS[el]}
            </button>
          ))}
        </div>
      </div>

      {/* Facets */}
      {facetOptions.length > 0 && (
        <div>
          <label className="block text-xs uppercase tracking-widest text-[#c9a84c] mb-2 font-medium">
            Facets
          </label>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
            {facetOptions.map(f => (
              <label key={f.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={facets.includes(f.id)}
                  onChange={() => toggleFacet(f.id)}
                  className="w-3.5 h-3.5 accent-[#c9a84c] cursor-pointer"
                />
                <span className="text-sm text-[#e8e0d0] group-hover:text-[#c9a84c] transition-colors">
                  {f.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full py-3 rounded text-sm font-semibold tracking-wide uppercase transition-all ${
          canSubmit
            ? "bg-[#c9a84c] text-[#0d0d0d] hover:bg-[#e0bc5a] shadow-lg shadow-[#c9a84c]/20"
            : "bg-[#1a1a1a] text-[#4a4540] border border-[#2e2e2e] cursor-not-allowed"
        }`}
      >
        {isPending ? "Buscando..." : "Encontrar Builds"}
      </button>
    </form>
  )
}
