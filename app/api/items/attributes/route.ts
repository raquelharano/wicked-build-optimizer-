import { NextResponse } from "next/server"

// GET /api/items/attributes
// Lista fixa de atributos do jogo (não variam por patch)
export async function GET() {
  const attributes = ["Strength", "Dexterity", "Intelligence", "Faith", "Focus"]
  return NextResponse.json(attributes)
}
