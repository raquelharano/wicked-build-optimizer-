import type { Difficulty } from "@/lib/types"

const CONFIG: Record<Difficulty, { label: string; color: string; dots: number }> = {
  Easy:   { label: "Fácil",     color: "text-green-400",  dots: 1 },
  Medium: { label: "Moderada",  color: "text-yellow-400", dots: 2 },
  Hard:   { label: "Difícil",   color: "text-red-400",    dots: 3 },
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { label, color, dots } = CONFIG[difficulty]
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < dots ? "bg-current" : "bg-current opacity-20"}`} />
      ))}
      <span className="ml-0.5">{label}</span>
    </span>
  )
}
