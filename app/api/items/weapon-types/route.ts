import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/items/weapon-types
// Retorna lista distinta de tipos de arma no banco — usado para popular o dropdown
export async function GET() {
  try {
    const weapons = await prisma.weapon.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    })

    const types = weapons.map((w: { category: string }) => w.category)
    return NextResponse.json(types)
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar tipos de arma", code: 500 },
      { status: 500 }
    )
  }
}
