import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/builds/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const build = await prisma.build.findUnique({
      where: { id },
      include: {
        weapon: true,
        armorSet: true,
        accessories: true,
        runes: true,
        gems: true,
        enchantments: true,
        facets: true,
      },
    })

    if (!build) {
      return NextResponse.json({ error: "Build não encontrada", code: 404 }, { status: 404 })
    }

    return NextResponse.json(build)
  } catch {
    return NextResponse.json({ error: "Erro ao buscar build", code: 500 }, { status: 500 })
  }
}
