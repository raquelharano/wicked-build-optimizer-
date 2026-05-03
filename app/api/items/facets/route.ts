import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/items/facets
export async function GET() {
  try {
    const facets = await prisma.facet.findMany({
      select: { id: true, name: true, effectDescription: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(facets)
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar facets", code: 500 },
      { status: 500 }
    )
  }
}
