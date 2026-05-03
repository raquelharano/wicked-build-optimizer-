import { NextResponse } from "next/server"

// GET /api/items/elements
export async function GET() {
  const elements = ["Fire", "Ice", "Lightning", "Poison", "None"]
  return NextResponse.json(elements)
}
